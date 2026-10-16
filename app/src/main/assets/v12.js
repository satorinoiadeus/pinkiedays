'use strict';
(() => {
  const V12_VIEWS=['today','habits','tasks','play','style'];
  const V12_COLORS={rose:['#ff6fab','#ff8fc4'],lavender:['#8f74ff','#c59cff'],sky:['#4ba9ff','#7bc9ff'],mint:['#34b989','#76d8b6'],peach:['#ff8368','#ffb08f'],cherry:['#e94d77','#ff758f']};
  let saved={};try{saved=JSON.parse(localStorage.getItem('pinkieSettingsV3')||'{}')||{}}catch(e){}
  settings.accent=saved.accent||settings.accent||'rose';
  settings.blockOpacity=Number(saved.blockOpacity||settings.blockOpacity||84);
  settings.stickersVisible=saved.stickersVisible!==undefined?saved.stickersVisible:(settings.stickersVisible!==undefined?settings.stickersVisible:true);
  settings.view=saved.view||settings.view||'today';
  settings.taskSection=saved.taskSection||settings.taskSection||'inbox';

  function saveSettingsV12(){
    localStorage.setItem('pinkieSettingsV3',JSON.stringify({theme:settings.theme,motion:settings.motion,accent:settings.accent,blockOpacity:settings.blockOpacity,stickersVisible:settings.stickersVisible,view:settings.view,taskSection:settings.taskSection}));
    localStorage.setItem('pinkieTheme',settings.theme);localStorage.setItem('pinkieMotion',settings.motion);
  }
  function ensureV12Data(){
    data.activeDays=Array.isArray(data.activeDays)?data.activeDays:[];
    data.taskSections=Array.isArray(data.taskSections)?data.taskSections:[];
    if(!data.taskSections.length)data.taskSections=[{id:'inbox',key:'inbox',builtin:true},{id:'personal',key:'personal',builtin:true},{id:'work',key:'work',builtin:true}];
    if(!data.taskSections.some(s=>s.id==='inbox'))data.taskSections.unshift({id:'inbox',key:'inbox',builtin:true});
    data.todos.forEach(x=>{if(!x.sectionId)x.sectionId='inbox'});
    data.stickers.forEach(s=>{if(s.visible===undefined)s.visible=true;if(!s.size)s.size=42;if(!Number.isFinite(s.rot))s.rot=0});
    if(!data.activeDays.length&&data.habits.some(h=>(h.history||[]).includes(localDate())))data.activeDays.push(localDate());
    if(!data.taskSections.some(s=>s.id===settings.taskSection))settings.taskSection='inbox';
    save();saveSettingsV12();
  }
  ensureV12Data();

  function markActiveDay(){const d=localDate();if(!data.activeDays.includes(d))data.activeDays.push(d)}
  function appStreak(){return currentStreak(data.activeDays||[])}
  function appBest(){return longestStreak(data.activeDays||[])}
  function sectionName(s){return s.name||t(s.key||s.id)||s.id}
  function activeSection(){return data.taskSections.find(s=>s.id===settings.taskSection)||data.taskSections[0]}

  function switchView(view,scroll=true){
    if(!V12_VIEWS.includes(view))view='today';settings.view=view;saveSettingsV12();document.body.dataset.view=view;
    $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===view));$$('#bottomNav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    if(scroll)window.scrollTo({top:0,behavior:settings.motion==='reduced'?'auto':'smooth'});if(view==='habits')renderStreaks();if(view==='tasks')renderTaskSections();
  }

  function applyAccent(name,celebrateIt=false){
    if(!V12_COLORS[name])name='rose';settings.accent=name;saveSettingsV12();const c=V12_COLORS[name];
    document.documentElement.style.setProperty('--accent',c[0]);document.documentElement.style.setProperty('--pink',c[1]);$$('.color-dot').forEach(b=>b.classList.toggle('active',b.dataset.color===name));if(celebrateIt)celebrate('🎨');
  }
  function renderPalette(){const p=$('#colorPalette');if(!p)return;p.innerHTML='';Object.entries(V12_COLORS).forEach(([name,c])=>{const b=document.createElement('button');b.className='color-dot';b.dataset.color=name;b.style.background=`linear-gradient(135deg,${c[0]},${c[1]})`;b.setAttribute('aria-label',name);b.onclick=()=>applyAccent(name,true);p.appendChild(b)});applyAccent(settings.accent)}
  function applyOpacity(v){const n=Math.max(35,Math.min(100,Number(v)||84));settings.blockOpacity=n;saveSettingsV12();document.documentElement.style.setProperty('--block-alpha',(n/100).toFixed(2));document.documentElement.style.setProperty('--surface-alpha',Math.min(1,n/100+.08).toFixed(2));if($('#blockOpacity'))$('#blockOpacity').value=n;if($('#opacityValue'))$('#opacityValue').textContent=n+'%'}

  function renderTaskSections(){
    const wrap=$('#taskSections');if(!wrap)return;wrap.innerHTML='';data.taskSections.forEach(s=>{const n=data.todos.filter(x=>(x.sectionId||'inbox')===s.id&&!x.done).length;const b=document.createElement('button');b.className='section-chip'+(s.id===settings.taskSection?' active':'');b.textContent=sectionName(s)+(n?' · '+n:'');b.onclick=()=>{settings.taskSection=s.id;saveSettingsV12();renderTaskSections();render()};wrap.appendChild(b)});
  }
  function addTaskSection(){const name=prompt(t('sectionNamePrompt'));if(!name||!name.trim())return;const id='sec_'+uid();data.taskSections.push({id,name:name.trim(),builtin:false});settings.taskSection=id;save();saveSettingsV12();renderTaskSections();render();celebrate('🗂️')}
  function manageTaskSection(){const s=activeSection();if(!s)return;const msg=s.id==='inbox'?t('renameSectionPrompt'):t('manageSectionPrompt');const val=prompt(msg,sectionName(s));if(val===null)return;const v=val.trim();if(v.toUpperCase()==='DELETE'&&s.id!=='inbox'){data.todos.forEach(x=>{if(x.sectionId===s.id)x.sectionId='inbox'});data.taskSections=data.taskSections.filter(x=>x.id!==s.id);settings.taskSection='inbox';save();saveSettingsV12();renderTaskSections();render();toast(t('sectionDeleted'));return}if(!v)return;s.name=v;s.builtin=false;delete s.key;save();renderTaskSections();render()}

  addTodo=function(text=$('#todoInput').value.trim(),sectionId=settings.taskSection){if(!text)return;data.todos.push({id:uid(),text,done:false,created:Date.now(),sectionId:sectionId||'inbox'});$('#todoInput').value='';save();render();renderTaskSections();celebrate('✨')};
  toggleHabit=function(id){const h=data.habits.find(x=>x.id===id);if(!h)return;h.history=h.history||[];const td=localDate();if(h.history.includes(td))h.history=h.history.filter(x=>x!==td);else{h.history.push(td);markActiveDay();celebrate('💗')}save();render();renderFocus();renderStreaks()};
  toggleTodo=function(id){const x=data.todos.find(x=>x.id===id);if(!x)return;x.done=!x.done;if(x.done){x.completedDate=localDate();markActiveDay();celebrate('⭐')}else x.completedDate=null;save();render();renderFocus();renderStreaks();renderTaskSections()};
  delTodo=function(id){data.todos=data.todos.filter(x=>x.id!==id);if(data.focus?.id===id)data.focus=null;save();render();renderFocus();renderTaskSections()};

  render=function(){
    const hl=$('#habitList');hl.innerHTML='';if(!data.habits.length)hl.innerHTML=`<div class="empty">${esc(t('noHabits'))}</div>`;data.habits.forEach(h=>{const done=habitDone(h),st=currentStreak(h.history);const row=document.createElement('div');row.className='item';row.innerHTML=`<button class="check ${done?'done':''}">${done?'✓':''}</button><div class="text ${done?'done':''}"><b>${esc(h.text)}</b><div class="tiny">${esc(t('tinyStreak'))}: ${st} ${esc(st===1?t('day'):t('days'))}</div></div><span class="streak">🔥 ${st}</span><button class="delete">×</button>`;row.querySelector('.check').onclick=()=>toggleHabit(h.id);row.querySelector('.delete').onclick=()=>delHabit(h.id);hl.appendChild(row)});
    const filtered=data.todos.filter(x=>(x.sectionId||'inbox')===settings.taskSection),tl=$('#todoList');tl.innerHTML='';if(!filtered.length)tl.innerHTML=`<div class="empty">${esc(t('noTodos'))}</div>`;filtered.forEach(x=>{const row=document.createElement('div');row.className='item';row.innerHTML=`<button class="check ${x.done?'done':''}">${x.done?'✓':''}</button><div class="text ${x.done?'done':''}">${esc(x.text)}</div><button class="delete">×</button>`;row.querySelector('.check').onclick=()=>toggleTodo(x.id);row.querySelector('.delete').onclick=()=>delTodo(x.id);tl.appendChild(row)});
    const doneH=data.habits.filter(habitDone).length,pct=data.habits.length?Math.round(doneH/data.habits.length*100):0;$('#habitProgress').style.width=pct+'%';$('#habitPercent').textContent=`${pct}% ${t('today')}`;const sectionDone=filtered.filter(x=>x.done).length;$('#todoCount').textContent=`${filtered.length-sectionDone} ${t('left')}`;
    const todayDone=data.todos.filter(x=>x.done&&x.completedDate===localDate()).length;$('#doneToday').textContent=doneH+todayDone;$('#petals').textContent=data.petals||0;if($('#homeStreak'))$('#homeStreak').textContent=appStreak()+' 🔥';if($('#bestStreak'))$('#bestStreak').textContent=appBest();const total=doneH+todayDone;$('#petText').textContent=total>=5?t('petLots'):total>=2?t('petSome'):t('petZero');renderTaskSections();renderStickers();renderStreaks();
  };

  function renderStreaks(){if(!$('#mainStreak'))return;const cur=appStreak(),best=appBest();$('#mainStreak').textContent=cur;$('#bestStreakBadge').textContent=`${t('bestStreak')}: ${best}`;$('#homeStreak').textContent=cur+' 🔥';const strip=$('#weekStrip');strip.innerHTML='';const set=new Set(data.activeDays||[]);for(let i=6;i>=0;i--){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);const key=localDate(d),active=set.has(key);const cell=document.createElement('div');cell.className='week-day'+(active?' active':'')+(i===0?' today':'');cell.innerHTML=`<div class="dot">${active?'🔥':'♡'}</div><small>${esc(d.toLocaleDateString(getLang(),{weekday:'narrow'}))}</small>`;strip.appendChild(cell)}$('#streakMessage').textContent=cur===0?t('streakStart'):cur<3?t('streakWarm'):cur<7?t('streakGrowing'):t('streakHot')}

  addSticker=function(char){data.stickers.push({id:uid(),char,x:.58+Math.random()*.2,y:.16+Math.random()*.22,rot:Math.floor(Math.random()*24)-12,size:36+Math.floor(Math.random()*18),visible:true});save();renderStickers();renderStickerManager();celebrate(char)};
  renderStickers=function(){const layer=$('#stickerLayer');layer.innerHTML='';if(!settings.stickersVisible){if($('#stickerCount'))$('#stickerCount').textContent=data.stickers.length;return}data.stickers.filter(s=>s.visible!==false).forEach(s=>{const e=document.createElement('div');e.className='placed';e.textContent=s.char;e.style.left=Math.max(0,Math.min(innerWidth-50,s.x*innerWidth))+'px';e.style.top=Math.max(0,Math.min(innerHeight-50,s.y*innerHeight))+'px';e.style.fontSize=(s.size||42)+'px';e.style.transform=`rotate(${s.rot||0}deg)`;layer.appendChild(e);dragSticker(e,s);let taps=0,timer;e.addEventListener('click',()=>{taps++;clearTimeout(timer);timer=setTimeout(()=>taps=0,320);if(taps===2){data.stickers=data.stickers.filter(x=>x.id!==s.id);save();renderStickers();renderStickerManager();taps=0}})});if($('#stickerCount'))$('#stickerCount').textContent=data.stickers.length};
  function renderStickerManager(){if(!$('#stickerManagerList'))return;$('#toggleStickersBtn').textContent=settings.stickersVisible?t('hideStickers'):t('showStickers');const list=$('#stickerManagerList');list.innerHTML='';if(!data.stickers.length){list.innerHTML=`<div class="sticker-empty">${esc(t('noStickers'))}</div>`;return}data.stickers.forEach((s,i)=>{const row=document.createElement('div');row.className='sticker-manage-row';row.innerHTML=`<div class="preview">${s.char}</div><div class="grow"><b>${esc(t('sticker'))} ${i+1}</b><div class="tiny">${Math.round(s.size||42)}px · ${Math.round(s.rot||0)}°</div></div><div class="controls"><button data-a="v">${s.visible===false?'🙈':'👁️'}</button><button data-a="s">−</button><button data-a="b">＋</button><button data-a="r">↻</button><button data-a="d">×</button></div>`;row.querySelector('[data-a="v"]').onclick=()=>{s.visible=s.visible===false;save();renderStickers();renderStickerManager()};row.querySelector('[data-a="s"]').onclick=()=>{s.size=Math.max(20,(s.size||42)-6);save();renderStickers();renderStickerManager()};row.querySelector('[data-a="b"]').onclick=()=>{s.size=Math.min(96,(s.size||42)+6);save();renderStickers();renderStickerManager()};row.querySelector('[data-a="r"]').onclick=()=>{s.rot=((s.rot||0)+15)%360;save();renderStickers();renderStickerManager()};row.querySelector('[data-a="d"]').onclick=()=>{data.stickers=data.stickers.filter(x=>x.id!==s.id);save();renderStickers();renderStickerManager()};list.appendChild(row)})}
  function openStickerManager(){renderStickerManager();openModal('stickerModal')}

  exportData=function(){const backup={app:'Pinkie Days',version:3,exportedAt:new Date().toISOString(),data,settings:{theme:settings.theme,motion:settings.motion,accent:settings.accent,blockOpacity:settings.blockOpacity,stickersVisible:settings.stickersVisible,view:settings.view,taskSection:settings.taskSection,lang:getLang()}};const json=JSON.stringify(backup,null,2);try{if(window.PinkieAndroid?.exportBackup){PinkieAndroid.exportBackup(json);toast(t('exported'));return}}catch(e){}const blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`pinkie-days-backup-${localDate()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast(t('exported'))};
  importData=function(file){const r=new FileReader();r.onload=()=>{try{const b=JSON.parse(r.result),d=b.data||b;if(!Array.isArray(d.habits)||!Array.isArray(d.todos)||!Array.isArray(d.stickers))throw new Error('shape');data=Object.assign({habits:[],todos:[],stickers:[],petals:0,lastQuote:0,focus:null,activeDays:[],taskSections:[]},d);if(b.settings){Object.assign(settings,b.settings);if(b.settings.lang&&LANGS[b.settings.lang])localStorage.setItem('pinkieLang',b.settings.lang)}ensureV12Data();setTheme(settings.theme);setMotion(settings.motion);renderPalette();applyOpacity(settings.blockOpacity);initLanguage();applyTranslations();switchView(settings.view,false);render();toast(t('imported'));celebrate('💗')}catch(e){toast(t('importFail'))}};r.readAsText(file)};

  function bindV12(){
    $$('#bottomNav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));$('#addSectionBtn').onclick=addTaskSection;$('#manageSectionBtn').onclick=manageTaskSection;$('#blockOpacity').oninput=e=>applyOpacity(e.target.value);$('#manageStickersBtn').onclick=openStickerManager;$('#manageStickersStyleBtn').onclick=openStickerManager;$('#toggleStickersBtn').onclick=()=>{settings.stickersVisible=!settings.stickersVisible;saveSettingsV12();renderStickers();renderStickerManager()};$('#randomStickerBtn').onclick=()=>addSticker(stickerChoices[Math.floor(Math.random()*stickerChoices.length)]);$('#clearStickers').onclick=()=>{if(data.stickers.length&&confirm(t('clearStickersConfirm'))){data.stickers=[];save();renderStickers();renderStickerManager();burst('🫧',5)}};$('#exportBtn').onclick=exportData;$('#themeSelect').onchange=e=>{setTheme(e.target.value);saveSettingsV12()};$('#motionBtn').onclick=()=>{setMotion(settings.motion==='full'?'reduced':'full');saveSettingsV12()};
    addEventListener('resize',renderStickers);
  }

  renderPalette();applyOpacity(settings.blockOpacity);bindV12();switchView(settings.view,false);render();renderStickerManager();
})();
