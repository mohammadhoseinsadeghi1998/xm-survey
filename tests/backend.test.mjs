import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const root=new URL('../',import.meta.url);
const code=['google-apps-script/Schema.gs','google-apps-script/Code.gs'].map(p=>fs.readFileSync(new URL(p,root),'utf8')).join('\n');
function setup() {
  const rows=[];
  let maxCols=26,maxRows=1000,locked=false;
  function range(r,c,n=1,m=1) {
    const x={
      setValues(values){values.forEach((row,i)=>row.forEach((v,j)=>{(rows[r+i-1]??=[])[c+j-1]=v;}));return x;},
      getValues(){return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>rows[r+i-1]?.[c+j-1]??''));},
      getDisplayValues(){return x.getValues().map(row=>row.map(String));},
      setNumberFormat(){return x;},setBackground(){return x;},setFontColor(){return x;},setFontWeight(){return x;},
      createTextFinder(value){const finder={matchEntireCell(){return finder;},matchCase(){return finder;},useRegularExpression(){return finder;},findNext(){for(let i=r;i<r+n;i++) if(rows[i-1]?.[c-1]===value)return {getRow:()=>i};return null;}};return finder;}
    };return x;
  }
  const sheet={getRange:range,getMaxColumns:()=>maxCols,insertColumnsAfter:(_,n)=>maxCols+=n,getMaxRows:()=>maxRows,insertRowsAfter:(_,n)=>maxRows+=n,getLastRow:()=>rows.length,setFrozenRows(){},setRightToLeft(){}};
  const props={SPREADSHEET_ID:'test-sheet',SITE_ORIGIN:'https://example.github.io'};
  const context=vm.createContext({
    console:{log(){},error(){}},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]})},
    SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet,insertSheet:()=>sheet}),flush(){}},
    LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}})},
    Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(alg,s)=>Array.from(crypto.createHash(alg).update(s).digest()),getUuid:()=>crypto.randomUUID(),formatDate(date,tz,fmt){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));return fmt==='yyyy-MM-dd'?`${p.year}-${p.month}-${p.day}`:`${p.hour}:${p.minute}:${p.second}`;}},
    HtmlService:{XFrameOptionsMode:{ALLOWALL:'ALLOWALL'},createHtmlOutput:html=>({html,setXFrameOptionsMode(){return this;}})}
  });
  vm.runInContext(code,context);
  const schema=vm.runInContext('SCHEMA',context);
  const answers={};
  schema.questions.forEach(q=>answers[q.id]=q.type==='rank'||q.type==='check3'?schema.competencies.slice(0,3).map(c=>c[0]):q.options?'0':'پاسخ آزمایشی');
  const payload={version:schema.version,submissionId:crypto.randomUUID(),nonce:crypto.randomUUID(),confirmed:true,website:'',answers};
  return {c:context,rows,props,schema,payload,isLocked:()=>locked};
}

test('client/server schemas and supplied survey structure match',()=>{
  const {schema}=setup(),ctx=vm.createContext({window:{}});
  vm.runInContext(fs.readFileSync(new URL('data.js',root),'utf8'),ctx);
  assert.equal(JSON.stringify(schema.questions),JSON.stringify(ctx.window.SURVEY.questions));
  assert.equal(schema.questions.length,28);
  assert.equal(schema.competencies.length,15);
  assert.equal(schema.questions.filter(q=>q.guide && q.id!=='overall').length,14);
  assert.equal(schema.questions.find(q=>q.id==='overall').number,1);
  assert.equal(schema.questions.at(-1).number,21);
});
test('every required answer is enforced on the server',()=>{
  const {c,payload,schema}=setup();
  assert.doesNotThrow(()=>c.validate_(payload));
  for(const q of schema.questions){const p=structuredClone(payload);delete p.answers[q.id];assert.throws(()=>c.validate_(p),{isClientError:true},q.id);}
  for(const id of ['name','success']){const p=structuredClone(payload);p.answers[id]='   ';assert.throws(()=>c.validate_(p));}
});
test('conditional owner and other industry',()=>{
  const {c,payload:p}=setup();p.answers.owner='2';delete p.answers.owner_titles;
  assert.equal(c.validate_(p).answers.owner_titles,'');
  p.answers.industry='11';assert.throws(()=>c.validate_(p));
  p.answers.industry_other=' صنعت دیگر ';assert.equal(c.validate_(p).answers.industry_other,'صنعت دیگر');
  p.answers.industry='0';assert.equal(c.validate_(p).answers.industry_other,'');
});
test('rank and challenge lists require exactly three distinct valid choices',()=>{
  const {c,payload,schema}=setup();
  for(const id of ['important','least','challenges']) for(const v of [[],['change'],['change','change','strategy'],['change','strategy','fake'],schema.competencies.slice(0,4).map(c=>c[0])]){
    const p=structuredClone(payload);p.answers[id]=v;assert.throws(()=>c.validate_(p),{isClientError:true});
  }
});
test('invalid types, version, confirmation, unknown fields and long values rejected',()=>{
  const {c,payload}=setup();
  for(const patch of [{version:'old'},{confirmed:false},{website:'spam'},{submissionId:'bad'},{nonce:'bad'},{answers:null}]) assert.throws(()=>c.validate_({...payload,...patch}));
  for(const [key,v] of [['name','x'.repeat(301)],['success','x'.repeat(5001)],['overall',0],['overall','99'],['unknown','x']]){
    const p=structuredClone(payload);p.answers[key]=v;assert.throws(()=>c.validate_(p));
  }
});
test('submission storage has separate date/time, ranked labels and IDs, and is idempotent',()=>{
  const {c,payload,rows,isLocked}=setup(),p=c.validate_(payload);
  const first=c.store_(p),again=c.store_(p);
  assert.equal(JSON.stringify(first),JSON.stringify(again));assert.equal(rows.length,2);assert.equal(isLocked(),false);
  assert.match(first.trackingCode,/^XM-[A-F0-9]{32}$/);assert.match(first.date,/^14\d{2}\/\d{2}\/\d{2}$/);assert.match(first.time,/^\d{2}:\d{2}:\d{2}$/);
  assert.equal(rows[0].length,rows[1].length);
  assert.equal(rows[1][rows[0].indexOf('Q17_important_rank_2_id')],'change');
  assert.match(rows[1][rows[0].indexOf('Q17_important_rank_2')],/Organizational Design/);
  p.answers.name='نام جدید';assert.throws(()=>c.store_(p),{isClientError:true});assert.equal(rows.length,2);assert.equal(isLocked(),false);
  rows[0][0]='edited';assert.throws(()=>c.store_(p),/schema mismatch/);assert.equal(isLocked(),false);
});
test('formula injection protection and HTML-safe receipt transport',()=>{
  const {c,payload}=setup();
  for(const s of ['=SUM(A1:A2)','  +1','@x','-1','\tx'])assert.ok(c.safeCell_(s).startsWith("'"));
  assert.equal(c.safeCell_('متن عادی'),'متن عادی');
  const html=c.response_({message:'</script><script>evil()</script>'}).html;
  assert.equal((html.match(/<script>/g)||[]).length,1);assert.ok(html.includes('https://example.github.io'));assert.ok(!html.includes('<script>evil'));
  assert.ok(c.doPost({parameter:{payload:JSON.stringify(payload)}}).html.includes('XM_SUBMISSION_RESULT'));
});
test('malformed requests never crash the receipt handler; missing origin does not store',()=>{
  const {c,rows,payload,props}=setup();
  for(const raw of ['null','[]','5','"text"','{','x'.repeat(65001)])assert.doesNotThrow(()=>c.doPost({parameter:{payload:raw}}));
  assert.doesNotThrow(()=>c.doPost(null));assert.equal(rows.length,0);
  props.SITE_ORIGIN='https://example.github.io/repo/';c.doPost({parameter:{payload:JSON.stringify(payload)}});assert.equal(rows.length,0);
});
test('Solar Hijri conversion matches Intl Persian calendar across 2000–2050',()=>{
  const {c}=setup();
  const fmt=new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
  for(let y=2000;y<=2050;y++)for(let m=1;m<=12;m++)for(const d of [1,20,21,28]){
    const parts=Object.fromEntries(fmt.formatToParts(new Date(Date.UTC(y,m-1,d))).map(p=>[p.type,p.value]));
    assert.equal(c.gregorianToJalali_(y,m,d).join('/'),`${+parts.year}/${+parts.month}/${+parts.day}`,`${y}-${m}-${d}`);
  }
});
