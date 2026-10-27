// Optional browser test: install playwright-core and a Chromium browser, or set
// PLAYWRIGHT_MODULE and CHROMIUM_PATH. No real Google request is made.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
  for(const width of [1280,390,320]) {
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage(),errors=[],posts=[];
    async function assertLayout() {
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`horizontal overflow at ${width}px: ${await page.locator('#step-label').textContent()}`);
    }
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/config.js',route=>route.fulfill({contentType:'text/javascript',body:"window.XM_CONFIG={endpoint:'https://script.google.com/macros/s/TEST/exec',timeoutMs:350};"}));
    await page.route('https://script.google.com/macros/s/TEST/exec',async route=>{
      const p=JSON.parse(new URLSearchParams(route.request().postData()).get('payload'));posts.push(p);
      const result={type:'XM_SUBMISSION_RESULT',nonce:p.nonce,submissionId:p.submissionId,ok:true,trackingCode:'XM-TEST-RECEIPT',date:'1405/08/05',time:'18:30:00'};
      // First attempt deliberately loses its receipt. Retry must reuse the submission ID.
      await route.fulfill({contentType:'text/html',body:posts.length===1?'<html></html>':`<script>window.top.postMessage(${JSON.stringify(result)},${JSON.stringify(origin)});</script>`});
    });
    await page.goto(origin);
    await assertLayout();
    assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
    assert.equal(await page.locator('.brand img').count(),2);
    assert.ok(await page.locator('.brand img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0)));
    await page.locator('#next').click();
    await page.locator('#next').click();assert.ok(await page.locator('.question.invalid').count()>0);
    await page.locator('#input-name').fill('نام آزمایشی');
    await page.reload();assert.equal(await page.locator('#input-name').inputValue(),'نام آزمایشی');
    await page.locator('#input-organization').fill('سازمان آزمایشی');
    await page.locator('#input-industry').selectOption('11');
    assert.equal(await page.locator('#other-wrap').isVisible(),true);
    await page.locator('#industry-other').fill('صنعت آزمایشی');
    await page.locator('#input-job').fill('مدیر');
    await page.locator('input[name=owner][value="0"]').check();
    assert.equal(await page.locator('#q-owner_titles').isVisible(),true);
    await page.locator('#next').click();assert.equal(await page.locator('#q-owner_titles').evaluate(e=>e.classList.contains('invalid')),true);
    await page.locator('#input-owner_titles').fill('مدیر تجربه');
    await page.locator('input[name=owner][value="2"]').check();assert.equal(await page.locator('#q-owner_titles').isVisible(),false);
    await page.locator('#input-decision_maker').fill('مدیرعامل');
    await assertLayout();
    await page.locator('#next').click();
    await page.locator('[data-guide=general]').click();assert.equal(await page.locator('#guide-dialog').isVisible(),true);
    assert.equal(await page.locator('#guide-dialog .guide-item').count(),5);await page.keyboard.press('Escape');
    for(let step=2;step<=6;step++) {
      await assertLayout();
      const names=await page.locator('input[type=radio]').evaluateAll(els=>[...new Set(els.map(e=>e.name))]);
      for(const name of names)await page.locator(`input[name="${name}"][value="2"]`).check();
      if(step===3){await page.locator('[data-guide=competency]').first().click();assert.equal(await page.locator('#guide-dialog li').count(),6);await page.locator('#close-guide').click();}
      await page.locator('#next').click();
    }
    for(const id of ['important','least']) {
      await assertLayout();
      await page.locator(`#${id}-0`).selectOption('customer_centric');
      assert.equal(await page.locator(`#${id}-1 option[value=customer_centric]`).isDisabled(),true);
      await page.locator(`#${id}-1`).selectOption('strategy');
      await page.locator(`#${id}-2`).selectOption('change');
    }
    await page.locator('#next').click();
    await page.locator('#input-success').fill('موفقیت نمونه <script>alert(1)</script>');
    await page.locator('#input-challenges_text').fill('چالش نمونه');
    await assertLayout();
    await page.locator('input[value=customer_centric]').check();await page.locator('input[value=change]').check();
    await page.locator('#next').click();assert.equal(await page.locator('#error-challenges').isVisible(),true);
    await page.locator('input[value=strategy]').check();assert.equal(await page.locator('input[value=behavior]').isDisabled(),true);
    await page.locator('#next').click();
    assert.equal(await page.locator('.review-row').count(),28);
    assert.ok((await page.locator('.review-row').allTextContents()).some(s=>s.includes('رتبهٔ ۱')));
    await page.locator('[data-edit=name]').click();await page.locator('#input-name').fill('نام ویرایش‌شده');await page.locator('#next').click();
    assert.equal(await page.locator('.review-row').count(),28);
    assert.ok((await page.locator('.review-row').first().textContent()).includes('نام ویرایش‌شده'));
    await assertLayout();
    await page.locator('#next').click();assert.equal(await page.locator('#confirm-error').isVisible(),true);assert.equal(posts.length,0);
    await page.locator('#confirm').check();await page.locator('#next').click();
    await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('رسید هنوز دریافت نشده'));
    assert.equal(await page.locator('#previous').isDisabled(),true);
    assert.equal(await page.locator('[data-edit]').count(),0);
    await page.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://script.google.com',data:{type:'XM_SUBMISSION_RESULT',nonce:'wrong',submissionId:'wrong',ok:true,trackingCode:'FAKE'}})));
    assert.equal(await page.locator('.tracking').count(),0);
    await page.reload();assert.equal(await page.locator('#confirm').isChecked(),true);
    await page.locator('#next').click();await page.locator('.tracking').waitFor();
    assert.equal(await page.locator('.tracking').textContent(),'XM-TEST-RECEIPT');
    await assertLayout();
    assert.equal(posts.length,2);assert.equal(posts[0].submissionId,posts[1].submissionId);assert.notEqual(posts[0].nonce,posts[1].nonce);
    assert.deepEqual(posts[0].answers,posts[1].answers);
    assert.equal(await page.evaluate(()=>localStorage.getItem('xm-iran-draft-v1')),null);
    await page.reload();await page.locator('.tracking').waitFor();
    page.once('dialog',d=>d.accept());await page.locator('#new').click();assert.equal(await page.locator('#clear').isVisible(),true);
    assert.ok((await page.locator('#step-label').textContent()).includes('۱'));
    assert.equal(await page.evaluate(()=>localStorage.getItem('xm-iran-receipt-v1')),null);
    assert.deepEqual(errors,[]);
    if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`xm-survey-${width}.png`),fullPage:true});
    await context.close();console.log(`PASS ${width}px: full survey, conditional validation, draft/reload, guide, rank, review/edit, lost receipt/retry, reset; no JS errors`);
  }
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
