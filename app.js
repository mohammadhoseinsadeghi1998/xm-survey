(() => {
  'use strict';
  const S = window.SURVEY, Q = S.questions, cfg = window.XM_CONFIG;
  const KEY = 'xm-iran-draft-v1', RECEIPT = 'xm-iran-receipt-v1';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fa = n => Number(n).toLocaleString('fa-IR');
  const uuid = () => crypto.randomUUID();
  const pages = [
    {title:'آشنایی با پژوهش', ids:[]},
    {title:'اطلاعات پاسخ‌دهنده و سازمان', ids:Q.slice(0,7).map(q=>q.id)},
    {title:'ارزیابی وضعیت کلی مدیریت تجربه (General XM Assessment)', ids:['overall','confidence']},
    {title:'وضعیت شایستگی‌ها — ۱ از ۴', ids:Q.slice(9,13).map(q=>q.id)},
    {title:'وضعیت شایستگی‌ها — ۲ از ۴', ids:Q.slice(13,17).map(q=>q.id)},
    {title:'وضعیت شایستگی‌ها — ۳ از ۴', ids:Q.slice(17,20).map(q=>q.id)},
    {title:'وضعیت شایستگی‌ها — ۴ از ۴', ids:Q.slice(20,23).map(q=>q.id)},
    {title:'اهمیت شایستگی‌ها', ids:['important','least']},
    {title:'عوامل موفقیت و چالش‌ها (Success Factors & Challenges)', ids:['success','challenges_text','challenges']},
    {title:'بازبینی و تأیید نهایی پاسخ‌ها', ids:[]}
  ];
  let state = {version:S.version, page:0, answers:{}, submissionId:uuid(), pending:null};
  let busy = false, timer, activeNonce, editing = false, receipt = null;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.version === S.version && saved.answers && typeof saved.answers === 'object' && !Array.isArray(saved.answers) && typeof saved.submissionId === 'string') {
      state = saved;
      state.page = Number.isInteger(state.page) ? Math.max(0,Math.min(9,state.page)) : 0;
      if (state.pending) state.page = 9;
      $('status').textContent = 'پیش‌نویس قبلی از همین مرورگر بازیابی شد.';
    }
    receipt = JSON.parse(localStorage.getItem(RECEIPT));
  } catch (_) { $('status').textContent = 'ذخیرهٔ محلی در دسترس نیست؛ تا پایان ثبت این صفحه را نبندید.'; }
  const isActive = q => !q.conditional || ['0','1'].includes(state.answers.owner);
  const valid = (q, answers=state.answers) => {
    if (q.conditional && !['0','1'].includes(answers.owner)) return true;
    const v = answers[q.id];
    if (['text','textarea'].includes(q.type)) return typeof v === 'string' && !!v.trim() && v.length <= (q.type==='text'?300:5000);
    if (q.type==='radio' || q.type==='industry') {
      if (!q.options.some((_,i)=>String(i)===v)) return false;
      return q.type!=='industry' || v!=='11' || (typeof answers.industry_other==='string' && !!answers.industry_other.trim() && answers.industry_other.length<=300);
    }
    if (q.type==='rank' || q.type==='check3') return Array.isArray(v) && v.length===3 && new Set(v).size===3 && v.every(id=>S.competencies.some(c=>c[0]===id));
    return false;
  };
  function save(manual=false) {
    try {
      localStorage.setItem(KEY,JSON.stringify(state));
      if (manual) $('status').textContent = 'پیش‌نویس ذخیره شد؛ با همین مرورگر و همین دستگاه می‌توانید ادامه دهید. این ذخیره‌سازی، ثبت نهایی نیست.';
    } catch (_) { $('status').textContent = 'مرورگر اجازهٔ ذخیرهٔ پیش‌نویس نمی‌دهد یا فضای کافی ندارد؛ تا دریافت کد پیگیری صفحه را نبندید.'; }
  }
  function guideHTML() {
    return `<p>${esc(S.guideIntro)}</p>${S.guide.map(([t,d])=>`<div class="guide-item"><strong>${esc(t)}</strong><p>${esc(d)}</p></div>`).join('')}<p class="info">${esc(S.stakeholder)}</p>`;
  }
  function help(comp=false) {
    $('guide-content').innerHTML = guideHTML() + (comp ? `<div class="notice">راهنمای بالا مقیاس پنج‌سطحیِ وضعیت کلی سازمان است. برای این سؤال، مقیاس شش‌گزینه‌ایِ زیر به کار می‌رود؛ این دو مقیاس یکسان نیستند و تبدیل عددی ندارند.</div><h3>گزینه‌های همین سؤال</h3><ol>${S.scale.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>` : '');
    $('guide-dialog').showModal();
  }
  function updateProgress() {
    const active = Q.filter(isActive), answered = active.filter(q=>valid(q)).length;
    const percent = receipt ? 100 : Math.round(answered/active.length*100);
    $('progress').value = percent;
    $('progress-label').textContent = receipt ? 'ثبت نهایی انجام شد' : `${fa(percent)}٪ پاسخ داده‌شده (${fa(answered)} از ${fa(active.length)})`;
    $('step-label').textContent = receipt ? 'پایان پژوهش' : `مرحلهٔ ${fa(state.page+1)} از ${fa(pages.length)}`;
    const group = state.page<=1?state.page:state.page<=6?2:state.page-4;
    $('step-list').innerHTML = ['معرفی','اطلاعات سازمان','ارزیابی XM','اهمیت','چالش‌ها','بازبینی'].map((t,i)=>`<span class="${i===group?'active':i<group?'done':''}">${t}</span>`).join('');
  }
  function questionHTML(q) {
    const v = state.answers[q.id];
    let body = q.hint ? `<p class="hint">${esc(q.hint)}</p>` : '';
    if (q.guide) body += `<button type="button" class="help" data-guide="${q.id==='overall'?'general':'competency'}" aria-haspopup="dialog">ⓘ راهنمای مقیاس</button>`;
    if (q.type==='text') body += `<input class="input" id="input-${q.id}" data-id="${q.id}" type="text" maxlength="300" value="${esc(v)}" autocomplete="${q.id==='name'?'name':q.id==='organization'?'organization':q.id==='job'?'organization-title':'off'}" aria-labelledby="label-${q.id}" aria-required="true" aria-describedby="error-${q.id}">`;
    if (q.type==='textarea') body += `<textarea id="input-${q.id}" data-id="${q.id}" maxlength="5000" rows="5" aria-labelledby="label-${q.id}" aria-required="true" aria-describedby="error-${q.id}">${esc(v)}</textarea><div class="hint">حداکثر ۵۰۰۰ نویسه</div>`;
    if (q.type==='industry') body += `<select id="input-industry" data-id="industry" aria-labelledby="label-industry" aria-required="true" aria-describedby="error-industry"><option value="">انتخاب کنید…</option>${q.options.map((x,i)=>`<option value="${i}" ${v===String(i)?'selected':''}>${esc(x)}</option>`).join('')}</select><div id="other-wrap" ${v==='11'?'':'hidden'}><label for="industry-other" class="field-label">نام صنعت دیگر <span class="required">الزامی</span></label><input id="industry-other" class="input" type="text" maxlength="300" data-id="industry_other" value="${esc(state.answers.industry_other)}" ${v==='11'?'aria-required="true"':'disabled'}></div>`;
    if (q.type==='radio') body += `<div class="options" role="radiogroup" aria-required="true" aria-labelledby="label-${q.id}" aria-describedby="error-${q.id}">${q.options.map((x,i)=>`<label class="option"><input type="radio" name="${q.id}" data-id="${q.id}" value="${i}" ${v===String(i)?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div>`;
    if (q.type==='rank') body += `<div class="rank-group">${[0,1,2].map(i=>`<div class="rank-row"><label for="${q.id}-${i}"><span class="rank-number">${fa(i+1)}</span>رتبهٔ ${fa(i+1)}</label><select id="${q.id}-${i}" data-id="${q.id}" data-rank="${i}" aria-required="true" aria-describedby="error-${q.id}"><option value="">یک شایستگی انتخاب کنید…</option>${S.competencies.map(c=>`<option value="${c[0]}" ${v?.[i]===c[0]?'selected':''}>${esc(c[1])}</option>`).join('')}</select></div>`).join('')}</div>`;
    if (q.type==='check3') body += `<p class="hint">دقیقاً ۳ مورد انتخاب کنید. این سؤال رتبه‌بندی ندارد.</p><div class="options">${S.competencies.map((c,i)=>`<label class="option"><input type="checkbox" data-id="challenges" value="${c[0]}" ${Array.isArray(v)&&v.includes(c[0])?'checked':''}><span>${esc(S.challengeLabels[i])}</span></label>`).join('')}</div><div id="challenge-counter" class="counter" aria-live="polite"></div>`;
    return `<fieldset id="q-${q.id}" class="question" ${isActive(q)?'':'hidden disabled'}><legend id="label-${q.id}"><span class="number">${fa(q.number)}</span>${esc(q.text)} <span class="required">* الزامی</span></legend><div class="body">${body}<div id="error-${q.id}" class="error" hidden></div></div></fieldset>`;
  }
  function displayAnswer(q) {
    const v = state.answers[q.id];
    if (!isActive(q)) return 'مشمول پاسخ نیست — متولی مشخصی وجود ندارد.';
    if (q.type==='industry') return (q.options[Number(v)]||'—') + (v==='11' ? `: ${state.answers.industry_other||''}` : '');
    if (q.type==='radio') return q.options[Number(v)]||'—';
    if (q.type==='rank') return (v||[]).map((id,i)=>`رتبهٔ ${fa(i+1)}: ${S.competencies.find(c=>c[0]===id)?.[1]||'—'}`).join('\n');
    if (q.type==='check3') return (v||[]).map(id=>S.challengeLabels[S.competencies.findIndex(c=>c[0]===id)]).join('\n');
    return v||'—';
  }
  function render(focus=true) {
    if (receipt) { showReceipt(); return; }
    $('navigation').hidden = false;
    $('clear').hidden = false;
    $('connection-note').hidden = endpointReady();
    const p = pages[state.page];
    let html = '';
    if (state.page===0) {
      html = `<section class="card intro"><p class="eyebrow">XMGlobal Collaborative · ایران</p><h1>${esc(S.welcome)}</h1><h2>هدف پژوهش</h2><p>${esc(S.purpose)}</p><div class="columns"><section><h2>از تکمیل پرسشنامه چه انتظاری داشته باشید؟</h2><ul>${S.expectations.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section><section><h2>نکات مهم</h2><ul>${S.notes.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section></div><div class="notice">در این نسخه، پاسخ به همهٔ سؤال‌ها، از جمله پرسش‌های تشریحی، الزامی است. سؤال متولی مدیریت تجربه فقط در صورت وجود متولی نمایش داده می‌شود.</div><div class="info"><strong>ذخیره و ادامه در فرصتی دیگر</strong><br>پیش‌نویس پاسخ‌ها به‌طور خودکار فقط در همین مرورگر و دستگاه ذخیره می‌شود. روی دستگاه مشترک، پس از استفاده پیش‌نویس را پاک کنید. پاک‌کردن داده‌های مرورگر یا استفاده از حالت ناشناس می‌تواند پیش‌نویس را حذف کند. پاسخ‌ها تنها پس از بازبینی و تأیید نهایی به پژوهشگر ارسال می‌شوند.</div></section>`;
    } else {
      html = `<div class="page-heading"><p class="eyebrow">ارزیابی شایستگی‌های مدیریت تجربه</p><h1>${esc(p.title)}</h1></div>`;
      if (state.page===2) html += `<section class="card"><h2>پیش از پاسخ‌گویی، راهنمای مقیاس را مطالعه کنید</h2>${guideHTML()}</section>`;
      if (state.page>=3 && state.page<=6) html += `<p class="info">در ادامه، درباره‌ی وضعیت فعلی سازمان شما در شایستگی‌های مدیریت تجربه (XM) پرسیده می‌شود.</p>`;
      if (state.page===9) {
        html += `<div class="notice">همهٔ پاسخ‌ها را بررسی کنید. ثبت تنها با تأیید شما و دریافت رسید از Google Sheets نهایی می‌شود.</div><section class="card"><dl>${Q.map(q=>`<div class="review-row"><dt>${fa(q.number)}. ${esc(q.text)}</dt><dd>${esc(displayAnswer(q))}</dd>${state.pending?'':`<button type="button" class="text-button" data-edit="${q.id}">ویرایش پاسخ ${fa(q.number)}</button>`}</div>`).join('')}</dl></section><section class="card"><label class="confirm"><input id="confirm" type="checkbox" ${state.pending?'checked disabled':''}><span>تمام پاسخ‌های بالا را بازبینی کرده‌ام و ثبت و استفادهٔ محرمانه از آن‌ها برای این پژوهش را تأیید می‌کنم.</span></label><label class="trap" aria-hidden="true">Website<input id="website" tabindex="-1" autocomplete="off"></label><p id="confirm-error" class="error" hidden></p></section>`;
        if (state.pending) html += '<p class="notice">این مجموعه پاسخ برای ارسال نهایی قفل شده است. اگر رسید دریافت نشده، «تلاش مجدد برای دریافت رسید» را بزنید؛ شناسهٔ ثابت از ثبت ردیف تکراری جلوگیری می‌کند.</p>';
      } else html += p.ids.map(id=>questionHTML(Q.find(q=>q.id===id))).join('');
    }
    $('main').innerHTML = html;
    $('previous').hidden = state.page===0;
    $('previous').disabled = !!state.pending || busy;
    $('next').textContent = state.page===9 ? (state.pending?'تلاش مجدد برای دریافت رسید':'تأیید و ثبت نهایی') : state.page===0?'شروع پرسشنامه ←':editing?'بازگشت به بازبینی ←':state.page===8?'مشاهدهٔ همهٔ پاسخ‌ها ←':'ذخیره و ادامه ←';
    $('next').disabled = busy || (state.page===9 && !endpointReady());
    $('clear').disabled = busy || !!state.pending;
    syncControls(); updateProgress();
    if (focus) { $('main').focus(); window.scrollTo({top:0,behavior:'smooth'}); }
  }
  function syncControls() {
    const owner = $('q-owner_titles');
    if (owner) { owner.hidden = !['0','1'].includes(state.answers.owner); owner.disabled = owner.hidden; }
    const other = $('other-wrap');
    if (other) { other.hidden = state.answers.industry!=='11'; $('industry-other').disabled=other.hidden; $('industry-other').setAttribute('aria-required',String(!other.hidden)); }
    ['important','least'].forEach(id=>{
      const vals = Array.isArray(state.answers[id])?state.answers[id]:[];
      document.querySelectorAll(`select[data-id="${id}"]`).forEach(select=>{
        [...select.options].forEach(o=>{o.disabled=!!o.value && o.value!==select.value && vals.includes(o.value);});
      });
    });
    const chosen = Array.isArray(state.answers.challenges)?state.answers.challenges:[];
    document.querySelectorAll('input[data-id="challenges"]').forEach(i=>{i.disabled=chosen.length>=3 && !i.checked;});
    if ($('challenge-counter')) $('challenge-counter').textContent=`${fa(chosen.length)} از ۳ مورد انتخاب شده است.`;
  }
  function validatePage() {
    let first;
    pages[state.page].ids.forEach(id=>{
      const q=Q.find(q=>q.id===id), ok=valid(q), field=$(`q-${id}`), err=$(`error-${id}`);
      field.classList.toggle('invalid',!ok); err.hidden=ok;
      field.querySelectorAll('input,select,textarea').forEach(el=>el.setAttribute('aria-invalid',String(!ok)));
      if (!ok) { err.textContent=q.type==='rank'?'برای هر سه رتبه، یک شایستگی متفاوت انتخاب کنید.':q.type==='check3'?'دقیقاً سه مورد انتخاب کنید.':'پاسخ این سؤال الزامی است؛ لطفاً پاسخ را کامل کنید.'; if (!first) first=field; }
    });
    if (first) { first.scrollIntoView({behavior:'smooth',block:'center'}); first.querySelector('input:not(:disabled),select,textarea')?.focus({preventScroll:true}); $('status').textContent='لطفاً سؤال‌های مشخص‌شده را تکمیل کنید.'; return false; }
    return true;
  }
  $('main').addEventListener('input', e=>{
    const el=e.target, id=el.dataset.id;
    if (!id || state.pending) return;
    if (el.dataset.rank!==undefined) {
      const a=Array.isArray(state.answers[id])?[...state.answers[id]]:['','','']; a[Number(el.dataset.rank)]=el.value; state.answers[id]=a;
    } else if (el.type==='checkbox') {
      const a=Array.isArray(state.answers[id])?[...state.answers[id]]:[];
      if (el.checked && !a.includes(el.value)) { if (a.length>=3) { el.checked=false; return; } a.push(el.value); }
      state.answers[id]=el.checked?a:a.filter(x=>x!==el.value);
    } else state.answers[id]=el.value;
    if (id==='owner' && el.value==='2') delete state.answers.owner_titles;
    if (id==='industry' && el.value!=='11') delete state.answers.industry_other;
    syncControls(); updateProgress(); save();
    const q=Q.find(q=>q.id===id || (id==='industry_other' && q.id==='industry'));
    if(q && valid(q)) { $(`q-${q.id}`).classList.remove('invalid'); $(`error-${q.id}`).hidden=true; $(`q-${q.id}`).querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid')); }
  });
  $('main').addEventListener('click',e=>{
    const button=e.target.closest('button'); if (!button) return;
    if (button.dataset.guide) help(button.dataset.guide==='competency');
    if (button.dataset.edit && !state.pending) {
      state.page=pages.findIndex(p=>p.ids.includes(button.dataset.edit)); editing=true; save(); render();
      $(`q-${button.dataset.edit}`)?.scrollIntoView({block:'center'});
    }
    if (button.id==='print') window.print();
    if (button.id==='copy') {
      if (!navigator.clipboard) { $('status').textContent='کد پیگیری را دستی انتخاب و کپی کنید.'; return; }
      navigator.clipboard.writeText(receipt.trackingCode).then(()=>{$('status').textContent='کد پیگیری کپی شد.';}).catch(()=>{$('status').textContent='کد پیگیری را دستی انتخاب و کپی کنید.';});
    }
    if (button.id==='new') {
      if (!confirm('پرسشنامهٔ جدید آغاز شود؟ ابتدا کد پیگیری فعلی را نگه دارید.')) return;
      receipt=null; state={version:S.version,page:0,answers:{},submissionId:uuid(),pending:null};
      try {localStorage.removeItem(RECEIPT);localStorage.removeItem(KEY);} catch(_){}
      $('status').textContent=''; render();
    }
  });
  $('close-guide').onclick=()=>$('guide-dialog').close();
  $('guide-dialog').addEventListener('click',e=>{if(e.target===$('guide-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('save').onclick=()=>save(true);
  $('clear').onclick=()=>{
    if (state.pending || busy || !confirm('پیش‌نویس و پاسخ‌های واردشده از این مرورگر پاک شوند؟')) return;
    try {localStorage.removeItem(KEY);} catch(_){}
    state={version:S.version,page:0,answers:{},submissionId:uuid(),pending:null};editing=false;$('status').textContent='پیش‌نویس پاک شد.';render();
  };
  $('previous').onclick=()=>{if(state.page>0 && !busy && !state.pending){state.page--;editing=false;save();render();}};
  $('next').onclick=()=>{
    if (busy) return;
    if (state.page===9) {submit();return;}
    if (!validatePage()) return;
    state.page=editing?9:Math.min(9,state.page+1);editing=false;$('status').textContent='';save();render();
  };
  function endpointReady() {return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(cfg.endpoint);}
  function submit() {
    if (!endpointReady()) return;
    const missing=Q.find(q=>!valid(q));
    if (missing) {state.page=pages.findIndex(p=>p.ids.includes(missing.id));render();validatePage();return;}
    if (!$('confirm').checked) { $('confirm-error').hidden=false;$('confirm-error').textContent='برای ثبت، تأیید بازبینی پاسخ‌ها الزامی است.';$('confirm').focus();return; }
    if (!state.pending) state.pending={version:S.version,submissionId:state.submissionId,answers:JSON.parse(JSON.stringify(state.answers)),confirmed:true,website:$('website').value};
    activeNonce=uuid(); save(); busy=true;render(false);
    $('next').textContent='در حال ثبت و دریافت رسید…';
    $('status').textContent='لطفاً تا دریافت کد پیگیری صفحه را نبندید. موفقیت فقط پس از تأیید ذخیره در Google Sheets نمایش داده می‌شود.';
    $('transport').action=cfg.endpoint;
    $('payload').value=JSON.stringify({...state.pending,nonce:activeNonce});
    $('transport').submit();
    clearTimeout(timer);
    timer=setTimeout(()=>{busy=false;render(false);$('status').textContent='رسید هنوز دریافت نشده است؛ ممکن است پاسخ ثبت شده باشد. اتصال اینترنت را بررسی کنید و با دکمهٔ تلاش مجدد، رسید همین پاسخ را دریافت کنید. داده‌ها حفظ شده‌اند.';},cfg.timeoutMs||60000);
  }
  window.addEventListener('message',e=>{
    let host; try {host=new URL(e.origin).hostname;}catch(_){return;}
    if (e.origin!==`https://${host}` || !(host==='script.google.com'||host==='script.googleusercontent.com'||host.endsWith('.script.googleusercontent.com'))) return;
    const d=e.data;
    if (!state.pending || !d || d.type!=='XM_SUBMISSION_RESULT' || d.nonce!==activeNonce || d.submissionId!==state.submissionId) return;
    clearTimeout(timer);busy=false;
    if (d.ok && typeof d.trackingCode==='string' && typeof d.date==='string' && typeof d.time==='string') {
      receipt={trackingCode:d.trackingCode,date:d.date,time:d.time};
      try {localStorage.setItem(RECEIPT,JSON.stringify(receipt));localStorage.removeItem(KEY);} catch(_){}
      state.answers={};state.pending=null;$('payload').value='';$('status').textContent='';render();
    } else {
      if (d.retryable===false) state.pending=null;
      save();render(false);$('status').textContent=d.message||'ثبت تأیید نشد. لطفاً دوباره تلاش کنید.';
    }
  });
  function showReceipt() {
    $('navigation').hidden=true;$('clear').hidden=true;$('connection-note').hidden=true;
    $('main').innerHTML=`<section class="card success-card"><div class="success-icon" aria-hidden="true">✓</div><h1>از مشارکت شما سپاسگزاریم</h1><p>پاسخ‌های شما با موفقیت ثبت شد.</p><p class="muted">کد پیگیری را برای مکاتبه با تیم پژوهش نگه دارید.</p><div class="tracking">${esc(receipt.trackingCode)}</div><p>تاریخ ثبت (شمسی): <b dir="ltr">${esc(receipt.date)}</b><br>ساعت ثبت: <b dir="ltr">${esc(receipt.time)}</b> — به وقت تهران</p><div class="receipt-actions"><button id="copy" class="primary" type="button">کپی کد پیگیری</button><button id="print" class="secondary" type="button">چاپ رسید</button></div><p class="muted" style="margin-top:20px">پیش‌نویس پاسخ‌ها از این مرورگر پاک شد. تنها این رسید برای مراجعهٔ بعدی نگه‌داری می‌شود.</p><button type="button" id="new" class="text-button">شروع پرسشنامهٔ جدید</button></section>`;
    updateProgress();$('main').focus();window.scrollTo(0,0);
  }
  window.addEventListener('beforeunload',e=>{if(busy){e.preventDefault();e.returnValue='';}});
  $('connection-note').hidden=endpointReady();
  render(false);
})();
