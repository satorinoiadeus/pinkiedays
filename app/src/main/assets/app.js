'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const stickerChoices = ['🌸','🎀','🍓','🐰','⭐','🧸','☁️','🍰','🌷','💗','🫧','🍒','🐾','🦋','🌙','🍥','🍬','🪽','🐈','🪄','👻','🎃'];
const vetFunds = [
  {name:'UC Davis Veterinary Medical Teaching Hospital — Compassionate Care Fund',url:'https://give.ucdavis.edu/VMTH/76954'},
  {name:'Atlantic Veterinary College — Veterinary Teaching Hospital',url:'https://vth.upei.ca/donate/'},
  {name:'Schwarzman Animal Medical Center — nonprofit veterinary hospital',url:'https://www.amcny.org/donate/'},
  {name:'Colorado State University — Animal Care / Veterinary Teaching Hospital',url:'https://giving.colostate.edu/passions/animal-care/'},
  {name:'University of Illinois — Veterinary Teaching Hospital giving',url:'https://vetmed.illinois.edu/connect-with-us/giving/giving-opportunities/caring-for-animals/'}
];

function localDate(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function uid(){ return Math.random().toString(36).slice(2,10); }
function esc(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function loadData(){
  let d; try{ d=JSON.parse(localStorage.getItem('pinkieDaysDataV2')||'null'); }catch(e){}
  if(!d){
    try{
      const old=JSON.parse(localStorage.getItem('pinkieDaysData')||'null');
      if(old) d={habits:(old.habits||[]).map(h=>({id:h.id||uid(),text:h.text||'',history:h.done?[localDate()]:[]})),todos:old.todos||[],stickers:(old.stickers||[]).map(s=>({id:s.id||uid(),char:s.char||'🌸',x:(s.x||100)/innerWidth,y:(s.y||100)/innerHeight,rot:s.rot||0,size:s.size||42})),petals:0};
    }catch(e){}
  }
  return Object.assign({habits:[],todos:[],stickers:[],petals:0,lastQuote:0,focus:null},d||{});
}
let data=loadData();
let settings={theme:localStorage.getItem('pinkieTheme')||'pink',motion:localStorage.getItem('pinkieMotion')||'full'};
let focusSeconds=300, focusInterval=null, focusPaused=false;
function save(){ localStorage.setItem('pinkieDaysDataV2',JSON.stringify(data)); }
function haptic(){ try{ if(window.PinkieAndroid?.haptic) PinkieAndroid.haptic(20); else navigator.vibrate?.(15); }catch(e){} }
function chime(freq=660){
  try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.045,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.12);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.13);}catch(e){}
}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800)}
function burst(char='✨',n=8){ if(settings.motion==='reduced')n=Math.min(n,3); for(let i=0;i<n;i++){const s=document.createElement('span');s.className='spark';s.textContent=char;s.style.left=(8+Math.random()*84)+'vw';s.style.top=(80+Math.random()*14)+'vh';s.style.fontSize=(13+Math.random()*23)+'px';s.style.animationDuration=(1.2+Math.random()*1.2)+'s';$('#ambient').appendChild(s);setTimeout(()=>s.remove(),2700);} }
function celebrate(char='🌸'){haptic();chime(720);burst(char,10)}

function currentStreak(history=[]){
  const set=new Set(history); let d=new Date();
  if(!set.has(localDate(d))) d.setDate(d.getDate()-1);
  let n=0; while(set.has(localDate(d))){n++;d.setDate(d.getDate()-1)} return n;
}
function longestStreak(history=[]){
  const arr=[...new Set(history)].sort(); if(!arr.length)return 0; let best=1,cur=1;
  for(let i=1;i<arr.length;i++){const a=new Date(arr[i-1]+'T12:00:00'),b=new Date(arr[i]+'T12:00:00'); if(Math.round((b-a)/86400000)===1){cur++;best=Math.max(best,cur)}else cur=1;} return best;
}
function habitDone(h){ return (h.history||[]).includes(localDate()); }

function applyTranslations(){
  document.documentElement.lang=getLang();
  $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  $$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
  $('#motionBtn').textContent=settings.motion==='reduced'?t('motionOff'):t('motionOn');
  $('#themeSelect').value=settings.theme;
  render();renderGames();renderQuote(data.lastQuote||0);renderFocus();
}
function initLanguage(){
  const sel=$('#languageSelect'); sel.innerHTML=''; Object.entries(LANGS).forEach(([code,v])=>{const o=document.createElement('option');o.value=code;o.textContent=`${v.flag} ${v.name}`;sel.appendChild(o)}); sel.value=getLang();
  sel.onchange=()=>{localStorage.setItem('pinkieLang',sel.value);applyTranslations();celebrate('💗')};
}
function setTheme(theme){settings.theme=theme;localStorage.setItem('pinkieTheme',theme);document.documentElement.dataset.theme=theme;const color=theme==='pink'?'#fff3f8':theme==='dark'?'#17121d':'#160d1f';document.querySelector('meta[name=theme-color]').setAttribute('content',color);if(theme==='halloween')burst('👻',6)}
function setMotion(v){settings.motion=v;localStorage.setItem('pinkieMotion',v);document.body.classList.toggle('reduced-motion',v==='reduced');$('#motionBtn').textContent=v==='reduced'?t('motionOff'):t('motionOn')}

function addHabit(text=$('#habitInput').value.trim()){if(!text)return;data.habits.push({id:uid(),text,history:[]});$('#habitInput').value='';save();render();celebrate('🌸')}
function addTodo(text=$('#todoInput').value.trim()){if(!text)return;data.todos.push({id:uid(),text,done:false,created:Date.now()});$('#todoInput').value='';save();render();celebrate('✨')}
function toggleHabit(id){const h=data.habits.find(x=>x.id===id);if(!h)return;h.history=h.history||[];const td=localDate();if(h.history.includes(td))h.history=h.history.filter(x=>x!==td);else{h.history.push(td);celebrate('💗')}save();render();renderFocus()}
function toggleTodo(id){const x=data.todos.find(x=>x.id===id);if(!x)return;x.done=!x.done;if(x.done)celebrate('⭐');save();render();renderFocus()}
function delHabit(id){data.habits=data.habits.filter(x=>x.id!==id);if(data.focus?.id===id)data.focus=null;save();render();renderFocus()}
function delTodo(id){data.todos=data.todos.filter(x=>x.id!==id);if(data.focus?.id===id)data.focus=null;save();render();renderFocus()}

function render(){
  const hl=$('#habitList');hl.innerHTML=''; if(!data.habits.length)hl.innerHTML=`<div class="empty">${esc(t('noHabits'))}</div>`;
  data.habits.forEach(h=>{const done=habitDone(h),st=currentStreak(h.history);const row=document.createElement('div');row.className='item';row.innerHTML=`<button class="check ${done?'done':''}" aria-label="done">${done?'✓':''}</button><div class="text ${done?'done':''}"><b>${esc(h.text)}</b><div class="tiny">${esc(t('tinyStreak'))}: ${st} ${esc(st===1?t('day'):t('days'))}</div></div><span class="streak">🔥 ${st}</span><button class="delete" aria-label="${esc(t('delete'))}">×</button>`;row.querySelector('.check').onclick=()=>toggleHabit(h.id);row.querySelector('.delete').onclick=()=>delHabit(h.id);hl.appendChild(row)});
  const tl=$('#todoList');tl.innerHTML='';if(!data.todos.length)tl.innerHTML=`<div class="empty">${esc(t('noTodos'))}</div>`;
  data.todos.forEach(x=>{const row=document.createElement('div');row.className='item';row.innerHTML=`<button class="check ${x.done?'done':''}">${x.done?'✓':''}</button><div class="text ${x.done?'done':''}">${esc(x.text)}</div><button class="delete" aria-label="${esc(t('delete'))}">×</button>`;row.querySelector('.check').onclick=()=>toggleTodo(x.id);row.querySelector('.delete').onclick=()=>delTodo(x.id);tl.appendChild(row)});
  const doneH=data.habits.filter(habitDone).length,pct=data.habits.length?Math.round(doneH/data.habits.length*100):0;$('#habitProgress').style.width=pct+'%';$('#habitPercent').textContent=`${pct}% ${t('today')}`;
  const todoDone=data.todos.filter(x=>x.done).length;$('#todoCount').textContent=`${data.todos.length-todoDone} ${t('left')}`;$('#doneToday').textContent=doneH+todoDone;$('#bestStreak').textContent=Math.max(0,...data.habits.map(h=>longestStreak(h.history||[])));$('#petals').textContent=data.petals||0;
  const total=doneH+todoDone;$('#petText').textContent=total>=5?t('petLots'):total>=2?t('petSome'):t('petZero');renderStickers();
}

function addSticker(char){data.stickers.push({id:uid(),char,x:.64+Math.random()*.12,y:.18+Math.random()*.14,rot:Math.floor(Math.random()*24)-12,size:36+Math.floor(Math.random()*18)});save();renderStickers();celebrate(char)}
function renderStickers(){const layer=$('#stickerLayer');layer.innerHTML='';data.stickers.forEach(s=>{const e=document.createElement('div');e.className='placed';e.textContent=s.char;e.style.left=Math.max(0,Math.min(innerWidth-50,s.x*innerWidth))+'px';e.style.top=Math.max(0,Math.min(innerHeight-50,s.y*innerHeight))+'px';e.style.fontSize=(s.size||42)+'px';e.style.transform=`rotate(${s.rot||0}deg)`;layer.appendChild(e);dragSticker(e,s);let taps=0,timer;e.addEventListener('click',()=>{taps++;clearTimeout(timer);timer=setTimeout(()=>taps=0,320);if(taps===2){data.stickers=data.stickers.filter(x=>x.id!==s.id);save();renderStickers();taps=0;}})});$('#petals').textContent=data.petals||0}
function dragSticker(el,s){let sx=0,sy=0,ox=0,oy=0,active=false;el.addEventListener('pointerdown',e=>{active=true;sx=e.clientX;sy=e.clientY;ox=s.x*innerWidth;oy=s.y*innerHeight;el.setPointerCapture(e.pointerId);el.classList.add('dragging')});el.addEventListener('pointermove',e=>{if(!active)return;const px=Math.max(0,Math.min(innerWidth-48,ox+e.clientX-sx)),py=Math.max(0,Math.min(innerHeight-48,oy+e.clientY-sy));s.x=px/innerWidth;s.y=py/innerHeight;el.style.left=px+'px';el.style.top=py+'px'});el.addEventListener('pointerup',()=>{active=false;el.classList.remove('dragging');save()})}
function initStickers(){const shelf=$('#stickerShelf');stickerChoices.forEach(ch=>{const b=document.createElement('button');b.className='sticker-btn';b.textContent=ch;b.onclick=()=>addSticker(ch);shelf.appendChild(b)})}

function pickFocus(){const c=[];data.habits.filter(h=>!habitDone(h)).forEach(h=>c.push({type:'habit',id:h.id,text:h.text}));data.todos.filter(x=>!x.done).forEach(x=>c.push({type:'todo',id:x.id,text:x.text}));if(!c.length){data.focus=null;toast('♡');renderFocus();return}data.focus=c[Math.floor(Math.random()*c.length)];save();renderFocus();celebrate('🎯')}
function renderFocus(){let f=data.focus;if(f){const item=f.type==='habit'?data.habits.find(x=>x.id===f.id):data.todos.find(x=>x.id===f.id);if(!item || (f.type==='habit'?habitDone(item):item.done)){data.focus=null;f=null;save()}}
  $('#nowTask').textContent=f?f.text:t('noFocus');$('#nowTiny').textContent=f?.tiny?`${t('tinyPrefix')}: ${f.text}`:'';$('#focusTimer').textContent=`${String(Math.floor(focusSeconds/60)).padStart(2,'0')}:${String(focusSeconds%60).padStart(2,'0')}`;
}
function makeTiny(){if(!data.focus)pickFocus();if(!data.focus)return;data.focus.tiny=true;save();renderFocus();burst('🫧',5)}
function toggleTimer(){if(focusInterval){clearInterval(focusInterval);focusInterval=null;focusPaused=true;$('#timerBtn').textContent=t('resume');return}if(focusSeconds<=0)focusSeconds=300;$('#timerBtn').textContent=t('pause');focusInterval=setInterval(()=>{focusSeconds--;renderFocus();if(focusSeconds<=0){clearInterval(focusInterval);focusInterval=null;focusSeconds=300;$('#timerBtn').textContent=t('start5');toast(t('timerDone'));celebrate('🌷');showReward();}},1000)}
function toggleFocusOnly(){const on=document.body.classList.toggle('focus-only');$('#focusOnlyBtn').textContent=on?t('exitFocus'):t('focusMode')}

function renderQuote(index){data.lastQuote=((index%100)+100)%100;save();$('#quote').textContent=quoteByIndex(data.lastQuote)}
function randomQuote(){let n=Math.floor(Math.random()*100);if(n===data.lastQuote)n=(n+17)%100;renderQuote(n);burst('💌',5)}
function showReward(){data.petals=(data.petals||0)+1;save();render();const n=Math.floor(Math.random()*100);$('#rewardQuote').textContent=quoteByIndex(n);openModal('rewardModal');celebrate('🌷')}

const games=[
  {id:'tap',emoji:'🐰',name:'tapBunny',help:'tapNeed'}, {id:'star',emoji:'⭐',name:'starCatch',help:'catchNeed'}, {id:'memory',emoji:'🎀',name:'memory',help:'pairsNeed'}, {id:'bubble',emoji:'🫧',name:'bubblePop',help:'popNeed'}, {id:'sequence',emoji:'🍓',name:'sequence',help:'sequenceNeed'}
];
function renderGames(){const g=$('#gamesGrid');g.innerHTML='';games.forEach(x=>{const b=document.createElement('button');b.className='game-card';b.innerHTML=`<span class="emoji">${x.emoji}</span><b>${esc(t(x.name))}</b><span class="tiny">${esc(t(x.help))}</span>`;b.onclick=()=>startGame(x.id);g.appendChild(b)})}
function openModal(id){$('#'+id).classList.add('show')}
function closeModal(id){$('#'+id).classList.remove('show')}
function startGame(id){const game=games.find(g=>g.id===id);$('#gameTitle').textContent=`${game.emoji} ${t(game.name)}`;$('#gameHelp').textContent=t(game.help);$('#gameBody').innerHTML='';openModal('gameModal');if(id==='tap')gameTap();if(id==='star')gameStar();if(id==='memory')gameMemory();if(id==='bubble')gameBubble();if(id==='sequence')gameSequence()}
function winGame(){closeModal('gameModal');showReward()}
function gameTap(){let n=0;const b=document.createElement('button');b.className='big-game-btn';b.innerHTML='🐰<span style="font-size:16px;display:block">0 / 10</span>';b.onclick=()=>{n++;haptic();b.innerHTML=`🐰<span style="font-size:16px;display:block">${n} / 10</span>`;b.style.transform=`scale(${1+Math.min(n,9)*.008}) rotate(${n%2?2:-2}deg)`;if(n>=10)setTimeout(winGame,180)};$('#gameBody').appendChild(b)}
function gameStar(){let n=0;const a=document.createElement('div');a.className='arena';const b=document.createElement('button');b.className='moving-star';b.textContent='⭐';a.appendChild(b);const move=()=>{b.style.left=(12+Math.random()*76)+'%';b.style.top=(15+Math.random()*70)+'%'};b.onclick=()=>{n++;haptic();$('#gameHelp').textContent=`${n} / 6`;if(n>=6)setTimeout(winGame,180);else move()};move();$('#gameBody').appendChild(a)}
function gameMemory(){const vals=['🌸','🎀','🐰','🌸','🎀','🐰'].sort(()=>Math.random()-.5);let first=null,locked=false,matched=0;const grid=document.createElement('div');grid.className='memory-grid';vals.forEach((v,i)=>{const b=document.createElement('button');b.className='memory-card hidden';b.textContent=v;b.dataset.v=v;b.onclick=()=>{if(locked||b.disabled||b===first)return;b.classList.remove('hidden');if(!first){first=b;return}locked=true;if(first.dataset.v===b.dataset.v){first.disabled=b.disabled=true;first=null;locked=false;matched++;haptic();if(matched===3)setTimeout(winGame,250)}else setTimeout(()=>{first.classList.add('hidden');b.classList.add('hidden');first=null;locked=false},550)};grid.appendChild(b)});$('#gameBody').appendChild(grid)}
function gameBubble(){let left=10;const a=document.createElement('div');a.className='arena bubbles';for(let i=0;i<10;i++){const b=document.createElement('button');const sz=32+Math.random()*34;b.style.width=b.style.height=sz+'px';b.style.left=(4+Math.random()*82)+'%';b.style.top=(5+Math.random()*75)+'%';b.onclick=()=>{b.remove();left--;haptic();$('#gameHelp').textContent=`${10-left} / 10`;if(left===0)setTimeout(winGame,180)};a.appendChild(b)}$('#gameBody').appendChild(a)}
function gameSequence(){const symbols=['🌸','⭐','🍓','🎀'];const seq=Array.from({length:4},()=>Math.floor(Math.random()*4));let pos=0,accept=false;const row=document.createElement('div');row.className='sequence-row';const buttons=symbols.map((s,i)=>{const b=document.createElement('button');b.className='seq';b.textContent=s;b.onclick=()=>{if(!accept)return;if(i===seq[pos]){pos++;haptic();if(pos===seq.length){accept=false;setTimeout(winGame,250)}}else{accept=false;pos=0;$('#gameHelp').textContent=t('tryAgain');setTimeout(play,800)}};row.appendChild(b);return b});$('#gameBody').appendChild(row);function play(){accept=false;$('#gameHelp').textContent=t('watch');seq.forEach((idx,k)=>setTimeout(()=>{buttons[idx].classList.add('flash');setTimeout(()=>buttons[idx].classList.remove('flash'),320);if(k===seq.length-1)setTimeout(()=>{accept=true;$('#gameHelp').textContent=t('yourTurn')},420)},k*600))}play()}

function exportData(){const backup={app:'Pinkie Days',version:2,exportedAt:new Date().toISOString(),data,settings:{theme:settings.theme,motion:settings.motion,lang:getLang()}};const json=JSON.stringify(backup,null,2);try{if(window.PinkieAndroid?.exportBackup){PinkieAndroid.exportBackup(json);toast(t('exported'));return}}catch(e){}const blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`pinkie-days-backup-${localDate()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast(t('exported'))}
function importData(file){const r=new FileReader();r.onload=()=>{try{const b=JSON.parse(r.result);const d=b.data||b;if(!Array.isArray(d.habits)||!Array.isArray(d.todos)||!Array.isArray(d.stickers))throw new Error('shape');data=Object.assign({habits:[],todos:[],stickers:[],petals:0,lastQuote:0,focus:null},d);if(b.settings){if(b.settings.lang&&LANGS[b.settings.lang])localStorage.setItem('pinkieLang',b.settings.lang);if(b.settings.theme)settings.theme=b.settings.theme;if(b.settings.motion)settings.motion=b.settings.motion}save();setTheme(settings.theme);setMotion(settings.motion);initLanguage();applyTranslations();toast(t('imported'));celebrate('💗')}catch(e){toast(t('importFail'))}};r.readAsText(file)}
function donateRandom(){const f=vetFunds[Math.floor(Math.random()*vetFunds.length)];if(confirm(`${t('donationConfirm')}\n\n${f.name}?`))window.open(f.url,'_blank')}

function initEvents(){
  $('#addHabit').onclick=()=>addHabit();$('#habitInput').addEventListener('keydown',e=>{if(e.key==='Enter')addHabit()});$('#addTodo').onclick=()=>addTodo();$('#todoInput').addEventListener('keydown',e=>{if(e.key==='Enter')addTodo()});
  $('#brainAdd').onclick=()=>{const v=$('#brainInput').value.trim();if(v){addTodo(v);$('#brainInput').value=''}};$('#brainInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#brainAdd').click()});
  $('#pickOne').onclick=pickFocus;$('#makeTiny').onclick=makeTiny;$('#timerBtn').onclick=toggleTimer;$('#focusOnlyBtn').onclick=toggleFocusOnly;
  $('#anotherQuote').onclick=randomQuote;$('#surpriseBtn').onclick=()=>{randomQuote();celebrate(Math.random()>.5?'✨':'💗')};$('#sparkleBtn').onclick=()=>celebrate('✨');$('#extraSpark').onclick=()=>{celebrate('🎀');addSticker(stickerChoices[Math.floor(Math.random()*stickerChoices.length)])};$('#petAvatar').onclick=()=>{celebrate('🐰');toast(t('petSome'))};
  $('#clearStickers').onclick=()=>{data.stickers=[];save();renderStickers();burst('🫧',5)};$('#freshDay').onclick=()=>{data.todos=data.todos.filter(x=>!x.done);data.focus=null;focusSeconds=300;save();render();renderFocus();celebrate('🌷')};
  $('#themeSelect').onchange=e=>setTheme(e.target.value);$('#motionBtn').onclick=()=>setMotion(settings.motion==='full'?'reduced':'full');$('#exportBtn').onclick=exportData;$('#importBtn').onclick=()=>$('#importFile').click();$('#importFile').onchange=e=>{if(e.target.files?.[0])importData(e.target.files[0]);e.target.value=''};$('#donateBtn').onclick=donateRandom;
  $$('[data-close]').forEach(x=>x.onclick=()=>closeModal(x.dataset.close));$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));
  addEventListener('resize',renderStickers);
}

function init(){
  setTheme(settings.theme);setMotion(settings.motion);initLanguage();initStickers();initEvents();applyTranslations();
  if(!data.lastQuote)randomQuote();else renderQuote(data.lastQuote);
  setInterval(()=>{if(settings.motion==='full'&&Math.random()>.62)burst(settings.theme==='halloween'?'👻':Math.random()>.5?'✨':'🌸',1)},3200);
}
init();
