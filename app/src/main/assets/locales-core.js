const LANGS={
  "en":{"name":"English","flag":"🇬🇧"},"ru":{"name":"Русский","flag":"🇷🇺"},"ky":{"name":"Кыргызча","flag":"🇰🇬"},"kk":{"name":"Қазақша","flag":"🇰🇿"},"uz":{"name":"O‘zbekcha","flag":"🇺🇿"},"tg":{"name":"Тоҷикӣ","flag":"🇹🇯"},"tr":{"name":"Türkçe","flag":"🇹🇷"}
};
const UI={};
const QUOTE_PARTS={};
function getLang(){ const saved=localStorage.getItem('pinkieLang'); if(saved&&LANGS[saved]) return saved; const n=(navigator.language||'en').toLowerCase().slice(0,2); return LANGS[n]?n:'en'; }
function t(key){ const lang=getLang(); return (UI[lang]&&UI[lang][key]) || (UI.en&&UI.en[key]) || key; }
function quoteByIndex(index,lang=getLang()){ const q=QUOTE_PARTS[lang]||QUOTE_PARTS.en; const n=((Number(index)||0)%100+100)%100; return q.a[Math.floor(n/10)]+' '+q.b[n%10]; }
