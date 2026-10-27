/**
 * XM Iran — Google Apps Script backend (V8).
 * Script properties required: SPREADSHEET_ID, SITE_ORIGIN.
 * Publish as Web app: Execute as Me; access Anyone.
 * Never put credentials or service-account keys in the GitHub repository.
 */
const SHEET_NAME = 'XM_Responses';
const TIMEZONE = 'Asia/Tehran';
const META_HEADERS = ['submission_id', 'payload_sha256', 'کد پیگیری', 'تاریخ ثبت شمسی', 'ساعت ثبت تهران', 'submitted_at_utc', 'survey_version'];

function doPost(e) {
  let data = {};
  let result;
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (typeof raw !== 'string' || raw.length > 65000) throw clientError_('دادهٔ ارسالی معتبر نیست یا بیش از حد مجاز است.');
    data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) { data = {}; throw clientError_('ساختار درخواست معتبر نیست.'); }
    configuredOrigin_();
    const normalized = validate_(data);
    result = store_(normalized);
  } catch (err) {
    result = {ok:false, retryable:!(err && err.isClientError), message:err && err.isClientError ? err.message : 'ثبت پاسخ تأیید نشد. لطفاً دوباره تلاش کنید؛ در صورت تکرار، با تیم پژوهش تماس بگیرید.'};
    // No respondent names or answers in logs.
    console.error('XM request failed: ' + (err && err.isClientError ? 'validation' : 'storage/configuration'));
  }
  return response_(Object.assign(result, {
    type:'XM_SUBMISSION_RESULT',
    submissionId: typeof data.submissionId === 'string' ? data.submissionId.slice(0,80) : '',
    nonce: typeof data.nonce === 'string' ? data.nonce.slice(0,80) : ''
  }));
}

function doGet() {
  return HtmlService.createHtmlOutput('<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>XM survey endpoint</title><p>سرویس دریافت پاسخ فعال است. پرسشنامه را از نشانی سایت پژوهش باز کنید.</p></html>');
}

function clientError_(message) {
  const err = new Error(message); err.isClientError = true; return err;
}

function validate_(p) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (p.version !== SCHEMA.version || !uuid.test(p.submissionId) || !uuid.test(p.nonce) || p.confirmed !== true || p.website !== '') throw clientError_('درخواست معتبر نیست. صفحه را از نشانی رسمی پرسشنامه باز کنید.');
  const a = p.answers;
  if (!a || typeof a !== 'object' || Array.isArray(a)) throw clientError_('پاسخ‌ها معتبر نیستند.');
  const allowed = SCHEMA.questions.map(q=>q.id).concat(['industry_other']);
  if (Object.keys(a).some(k=>allowed.indexOf(k)===-1)) throw clientError_('پاسخ ناشناخته در درخواست وجود دارد.');
  const out = {};
  SCHEMA.questions.forEach(q=>{
    if (q.conditional && a.owner==='2') { out[q.id]=''; return; }
    const v = a[q.id];
    if (q.type==='text' || q.type==='textarea') {
      if (typeof v !== 'string' || !v.trim() || v.length>(q.type==='text'?300:5000)) throw clientError_('پاسخ سؤال ' + q.number + ' ناقص یا بیش از حد مجاز است.');
      out[q.id]=v.trim();
    } else if (q.type==='radio' || q.type==='industry') {
      if (typeof v !== 'string' || !q.options.some((_,i)=>String(i)===v)) throw clientError_('گزینهٔ سؤال ' + q.number + ' معتبر نیست.');
      out[q.id]=v;
      if (q.type==='industry') {
        if (v==='11') {
          if (typeof a.industry_other!=='string' || !a.industry_other.trim() || a.industry_other.length>300) throw clientError_('نام صنعت دیگر را وارد کنید.');
          out.industry_other=a.industry_other.trim();
        } else out.industry_other='';
      }
    } else {
      if (!Array.isArray(v) || v.length!==3 || new Set(v).size!==3 || !v.every(id=>SCHEMA.competencies.some(c=>c[0]===id))) throw clientError_('در سؤال ' + q.number + ' دقیقاً سه گزینهٔ متفاوت انتخاب کنید.');
      out[q.id]=v.slice();
    }
  });
  return {submissionId:p.submissionId, version:p.version, answers:out};
}

function headers_() {
  const h = META_HEADERS.slice();
  SCHEMA.questions.forEach(q=>{
    const base = 'Q' + q.number + '_' + q.id;
    if (q.type==='rank') {
      [1,2,3].forEach(n=>{h.push(base+'_rank_'+n); h.push(base+'_rank_'+n+'_id');});
    } else if (q.type==='check3') {
      [1,2,3].forEach(n=>{h.push(base+'_choice_'+n); h.push(base+'_choice_'+n+'_id');});
    } else {
      h.push(base);
      if (q.type==='radio' || q.type==='industry') h.push(base+'_option_code');
      if (q.type==='industry') h.push('industry_other');
    }
  });
  return h;
}

function answerCells_(a) {
  const cells=[];
  SCHEMA.questions.forEach(q=>{
    const v=a[q.id];
    if (q.type==='rank' || q.type==='check3') {
      v.forEach(id=>{const i=SCHEMA.competencies.findIndex(c=>c[0]===id);cells.push(q.type==='rank'?SCHEMA.competencies[i][1]:SCHEMA.challengeLabels[i]);cells.push(id);});
    } else if (q.type==='radio' || q.type==='industry') {
      cells.push(q.options[Number(v)], String(Number(v)+1));
      if (q.type==='industry') cells.push(a.industry_other);
    } else cells.push(v);
  });
  return cells;
}

function safeCell_(v) {
  const s=String(v == null ? '' : v);
  // Defense against spreadsheet/formula injection, including whitespace prefixes.
  return /^[\s\uFEFF]*[=+@-]/.test(s) || /^[\t\r\n]/.test(s) ? "'"+s : s;
}

function store_(p) {
  const props=PropertiesService.getScriptProperties();
  const sheetId=props.getProperty('SPREADSHEET_ID');
  if (!sheetId) throw new Error('Missing spreadsheet configuration');
  const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(p.answers),Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
  const lock=LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const book=SpreadsheetApp.openById(sheetId);
    let sheet=book.getSheetByName(SHEET_NAME);
    const headers=headers_();
    if (!sheet) sheet=book.insertSheet(SHEET_NAME);
    if (sheet.getMaxColumns()<headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(),headers.length-sheet.getMaxColumns());
    if (sheet.getLastRow()===0) {
      sheet.getRange(1,1,1,headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,headers.length).setBackground('#3A69AF').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setRightToLeft(true);
    } else {
      const actual=sheet.getRange(1,1,1,headers.length).getValues()[0];
      if (JSON.stringify(actual)!==JSON.stringify(headers)) throw new Error('Sheet schema mismatch');
    }
    const last=sheet.getLastRow();
    if (last>1) {
      const found=sheet.getRange(2,1,last-1,1).createTextFinder(p.submissionId).matchEntireCell(true).matchCase(true).useRegularExpression(false).findNext();
      if (found) {
        const old=sheet.getRange(found.getRow(),1,1,META_HEADERS.length).getDisplayValues()[0];
        if (old[1]!==hash) throw clientError_('این شناسه پیش‌تر برای پاسخ دیگری ثبت شده است. با تیم پژوهش تماس بگیرید.');
        return {ok:true,trackingCode:old[2],date:old[3],time:old[4]};
      }
    }
    const now=new Date();
    const greg=Utilities.formatDate(now,TIMEZONE,'yyyy-MM-dd').split('-').map(Number);
    const j=gregorianToJalali_(greg[0],greg[1],greg[2]);
    const date=j[0]+'/'+pad_(j[1])+'/'+pad_(j[2]);
    const time=Utilities.formatDate(now,TIMEZONE,'HH:mm:ss');
    const code='XM-'+Utilities.getUuid().replace(/-/g,'').toUpperCase();
    const row=[p.submissionId,hash,code,date,time,now.toISOString(),p.version].concat(answerCells_(p.answers)).map(safeCell_);
    const next=sheet.getLastRow()+1;
    if(next>sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(),100);
    // Date and time are deliberately separate plain-text columns, not auto-parsed dates.
    sheet.getRange(next,1,1,row.length).setNumberFormat('@').setValues([row]);
    SpreadsheetApp.flush();
    return {ok:true,trackingCode:code,date:date,time:time};
  } finally { lock.releaseLock(); }
}

function pad_(n) {return ('0'+n).slice(-2);}

/** Gregorian -> Solar Hijri, integer civil-date conversion. */
function gregorianToJalali_(gy,gm,gd) {
  const gdm=[0,31,59,90,120,151,181,212,243,273,304,334];
  const gy2=gm>2?gy+1:gy;
  let days=355666+365*gy+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)+gd+gdm[gm-1];
  let jy=-1595+33*Math.floor(days/12053);days%=12053;
  jy+=4*Math.floor(days/1461);days%=1461;
  if(days>365){jy+=Math.floor((days-1)/365);days=(days-1)%365;}
  const jm=days<186?1+Math.floor(days/31):7+Math.floor((days-186)/30);
  const jd=1+(days<186?days%31:(days-186)%30);
  return [jy,jm,jd];
}

function configuredOrigin_() {
  const origin=PropertiesService.getScriptProperties().getProperty('SITE_ORIGIN') || '';
  if (!/^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?$/.test(origin)) throw new Error('SITE_ORIGIN must be an HTTPS origin without path or trailing slash');
  return origin;
}

function response_(result) {
  let origin;
  try { origin=configuredOrigin_(); }
  catch (_) { return HtmlService.createHtmlOutput('SITE_ORIGIN is not configured correctly.'); }
  const json=JSON.stringify(result).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  // The HtmlService output is sandboxed inside Google's iframe; top is the survey tab.
  // Target a configured origin, never '*'. Only receipt/status is returned, no answers.
  const html='<!doctype html><html><head><meta charset="utf-8"></head><body><script>window.top.postMessage('+json+','+JSON.stringify(origin)+');</script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Run once manually to authorize and check configuration. Does not create test responses. */
function checkSetup() {
  const p=PropertiesService.getScriptProperties();
  if (!/^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?$/.test(p.getProperty('SITE_ORIGIN')||'')) throw new Error('SITE_ORIGIN must be an HTTPS origin without path or trailing slash');
  const book=SpreadsheetApp.openById(p.getProperty('SPREADSHEET_ID'));
  console.log('Spreadsheet accessible. Expected response columns: '+headers_().length);
  console.log('Today in Tehran: '+Utilities.formatDate(new Date(),TIMEZONE,'yyyy-MM-dd HH:mm:ss'));
  console.log('Setup OK. Publish web app as Me / Anyone.');
}
