const KEY="potenziale_v02";
const today=()=>new Date().toISOString().slice(0,10);
const fmtDate=d=>new Date(d+"T12:00:00").toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

const defaultState={
  tasks:[],
  money:{income:0,expense:0},
  page:"home"
};

let state=load();
function load(){
  try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||"{}")}}
  catch{return {...defaultState}}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function tasksToday(){return state.tasks.filter(t=>t.date===today())}
function doneToday(){return tasksToday().filter(t=>t.done).length}
function pct(){const a=tasksToday();return a.length?Math.round(doneToday()/a.length*100):0}

function nav(){
  document.querySelectorAll(".nav-btn").forEach(b=>{
    b.classList.toggle("active",b.dataset.page===state.page);
    b.onclick=()=>{state.page=b.dataset.page;save();render()}
  })
}

function render(){
  nav();
  const c=document.getElementById("content");
  if(state.page==="home") c.innerHTML=home();
  if(state.page==="tasks") c.innerHTML=tasksPage();
  if(state.page==="progress") c.innerHTML=progressPage();
  if(state.page==="money") c.innerHTML=moneyPage();
  bind();
}

function home(){
  const a=tasksToday();
  return `<section class="hero">
    <div class="eyebrow">OGGI</div>
    <div class="date">${fmtDate(today())}</div>
    <p>Un passo alla volta. Costruiamo il sistema prima di renderlo complesso.</p>
  </section>
  <section class="card">
    <h2>🎯 Oggi <span style="float:right">${doneToday()}/${a.length}</span></h2>
    <div class="progress"><i style="width:${pct()}%"></i></div>
    <p style="color:#667085">${pct()}% completato</p>
    ${a.length?a.slice(0,4).map(taskMini).join(""):`<div class="empty">Nessuna task per oggi.<br>Vai in <b>Task</b> per crearne una.</div>`}
  </section>
  <section class="stats">
    <div class="stat"><strong>${doneToday()}</strong><span>Completate oggi</span></div>
    <div class="stat"><strong>${moneyBalance()} €</strong><span>Saldo</span></div>
  </section>`;
}

function taskMini(t){
 return `<div class="task-row ${t.done?"done":""}">
   <button class="check ${t.done?"done":""}" data-toggle="${t.id}">${t.done?"✓":""}</button>
   <div class="task-main"><div class="task-title">${esc(t.title)}</div><div class="task-meta">${esc(t.category)} · ${esc(t.priority)}</div></div>
 </div>`
}

function tasksPage(){
 return `<section class="card">
   <h2>☑️ Task</h2>
   <form id="taskForm" class="form">
     <input name="title" placeholder="Cosa vuoi fare?" maxlength="80" required>
     <div class="form-row">
       <select name="category"><option>Personale</option><option>Corpo</option><option>Crescita</option><option>Lavoro</option><option>Economia</option><option>Casa</option></select>
       <select name="priority"><option>Media</option><option>Alta</option><option>Bassa</option></select>
     </div>
     <button class="primary">+ Aggiungi task</button>
   </form>
 </section>
 <section class="card">
   <h2>Oggi <span style="float:right">${doneToday()}/${tasksToday().length}</span></h2>
   ${tasksToday().length?tasksToday().map(taskFull).join(""):`<div class="empty">Nessuna task ancora.</div>`}
 </section>
 <section class="card">
   <h2>Prossime</h2>
   ${state.tasks.filter(t=>t.date>today()).length?state.tasks.filter(t=>t.date>today()).map(taskFull).join(""):`<div class="empty">Nessuna task futura.</div>`}
 </section>`;
}

function taskFull(t){
 return `<div class="task-row ${t.done?"done":""}">
   <button class="check ${t.done?"done":""}" data-toggle="${t.id}">${t.done?"✓":""}</button>
   <div class="task-main"><div class="task-title">${esc(t.title)}</div><div class="task-meta">${esc(t.category)} · ${fmtDate(t.date)}</div></div>
   <span class="priority">${esc(t.priority)}</span>
   <button class="icon-btn" data-delete="${t.id}" aria-label="Elimina">×</button>
 </div>`;
}

function progressPage(){
 const total=state.tasks.length, done=state.tasks.filter(t=>t.done).length;
 const allPct=total?Math.round(done/total*100):0;
 return `<section class="hero"><div class="eyebrow">PROGRESSI</div><div class="date">${allPct}/100</div><p>Il punteggio cresce quando trasformi le intenzioni in azioni.</p></section>
 <section class="stats">
   <div class="stat"><strong>${done}</strong><span>Task completate</span></div>
   <div class="stat"><strong>${total}</strong><span>Task totali</span></div>
 </section>
 <section class="card"><h2>Avanzamento</h2><div class="progress"><i style="width:${allPct}%"></i></div><p style="color:#667085">${allPct}% delle task completate</p></section>`;
}

function moneyBalance(){return Math.round((Number(state.money.income)||0)-(Number(state.money.expense)||0))}

function moneyPage(){
 return `<section class="card"><h2>💶 Economia personale</h2>
   <div class="stats">
     <div class="stat"><strong>${Number(state.money.income||0).toFixed(2)} €</strong><span>Entrate</span></div>
     <div class="stat"><strong>${Number(state.money.expense||0).toFixed(2)} €</strong><span>Uscite</span></div>
   </div>
   <div class="stat" style="margin-top:12px"><strong>${moneyBalance()} €</strong><span>Saldo</span></div>
 </section>
 <section class="card"><h2>Registra movimento</h2>
   <form id="moneyForm" class="form">
     <input name="amount" type="number" step="0.01" min="0" placeholder="Importo (€)" required>
     <select name="type"><option value="income">Entrata</option><option value="expense">Uscita</option></select>
     <button class="primary">Salva movimento</button>
   </form>
 </section>`;
}

function bind(){
 document.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>{
   const t=state.tasks.find(x=>x.id===b.dataset.toggle); if(t){t.done=!t.done;save();render()}
 });
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{
   state.tasks=state.tasks.filter(x=>x.id!==b.dataset.delete);save();render()
 });
 const tf=document.getElementById("taskForm");
 if(tf) tf.onsubmit=e=>{
   e.preventDefault();const f=new FormData(tf);
   state.tasks.push({id:uid(),title:f.get("title").trim(),category:f.get("category"),priority:f.get("priority"),date:today(),done:false});
   save();render()
 };
 const mf=document.getElementById("moneyForm");
 if(mf) mf.onsubmit=e=>{
   e.preventDefault();const f=new FormData(mf),n=Number(f.get("amount"));
   if(n>0){if(f.get("type")==="income")state.money.income+=n;else state.money.expense+=n;save();render()}
 };
}
render();
