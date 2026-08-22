const APP_VERSION="0.1.0";
const KEY="potenziale_foundation_v01";
let deferredPrompt=null;
let current="home";

const defaults={
  version:APP_VERSION,
  tasks:[],
  completed:0,
  income:0,
  expenses:0,
  savingsGoal:0,
  history:[]
};

function load(){
  try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}
  catch{return {...defaults}}
}
let state=load();
function save(){state.version=APP_VERSION;localStorage.setItem(KEY,JSON.stringify(state))}
function today(){return new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"})}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function render(){
  document.querySelectorAll("[data-screen]").forEach(b=>b.classList.toggle("active",b.dataset.screen===current));
  const screen=document.getElementById("screen");
  if(current==="home")screen.innerHTML=home();
  if(current==="tasks")screen.innerHTML=tasks();
  if(current==="progress")screen.innerHTML=progress();
  if(current==="money")screen.innerHTML=money();
  bind();
}
function home(){
 const total=state.tasks.length, done=state.tasks.filter(t=>t.done).length, pct=total?Math.round(done/total*100):0;
 return `<section class="card hero"><div class="eyebrow">OGGI</div><h2>${today()}</h2><p>Un passo alla volta. Costruiamo il sistema prima di renderlo complesso.</p></section>
 <section class="card"><div class="row"><h2>🎯 Oggi</h2><b>${done}/${total}</b></div><div class="progress"><i style="width:${pct}%"></i></div><p>${pct}% completato</p>${total?state.tasks.map(taskHTML).join(""):`<div class="empty">Nessuna task. Vai in <b>Task</b> per crearne una.</div>`}</section>
 <section class="card"><div class="grid"><div class="metric"><b>${done}</b><span>Completate oggi</span></div><div class="metric"><b>${Math.max(0,state.income-state.expenses).toFixed(0)} €</b><span>Saldo mensile</span></div></div></section>`
}
function taskHTML(t){return `<div class="task"><button class="check ${t.done?"done":""}" data-id="${esc(t.id)}">${t.done?"✓":""}</button><div><div class="task-title">${esc(t.title)}</div><small>${esc(t.category||"Generale")}</small></div></div>`}
function tasks(){
 return `<section class="card"><div class="row"><h2>✓ Task</h2><button class="primary" id="add">Aggiungi</button></div><p>Questa è la base del motore quotidiano.</p>${state.tasks.length?state.tasks.map(taskHTML).join(""):`<div class="empty">Ancora nessuna task.</div>`}</section>
 <section class="card"><h3>Nuova task</h3><div class="field"><label>Descrizione</label><input id="title" placeholder="Es. 20 minuti di studio"></div><div class="field"><label>Area</label><input id="category" placeholder="Es. Carriera"></div><button class="primary" id="create">Salva task</button></section>`
}
function progress(){
 const done=state.tasks.filter(t=>t.done).length,total=state.tasks.length,pct=total?Math.round(done/total*100):0;
 return `<section class="card"><h2>◒ Progressi</h2><div class="grid"><div class="metric"><b>${pct}%</b><span>Completamento</span></div><div class="metric"><b>${done}</b><span>Task completate</span></div></div></section>
 <section class="card"><h3>Progressione</h3><div class="progress"><i style="width:${pct}%"></i></div><p>${done} di ${total} task completate.</p></section>`
}
function money(){
 const balance=Number(state.income)-Number(state.expenses),goal=Number(state.savingsGoal)||0,p=goal?Math.max(0,Math.min(100,balance/goal*100)):0;
 return `<section class="card"><h2>€ Economia</h2><p>La base del modulo economico di POTENZIALE.</p></section>
 <section class="card"><div class="field"><label>Entrate mensili (€)</label><input id="income" type="number" value="${state.income}"></div>
 <div class="field"><label>Spese mensili (€)</label><input id="expenses" type="number" value="${state.expenses}"></div>
 <div class="field"><label>Obiettivo risparmio (€)</label><input id="goal" type="number" value="${state.savingsGoal}"></div>
 <button class="primary" id="saveMoney">Salva</button></section>
 <section class="card"><div class="metric"><b>${balance.toFixed(2)} €</b><span>Saldo mensile</span></div><br><div class="progress"><i style="width:${p}%"></i></div><p>${Math.round(p)}% dell'obiettivo</p></section>`
}
function bind(){
 document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{const t=state.tasks.find(x=>x.id===b.dataset.id);if(t){t.done=!t.done;save();render()}});
 const create=document.getElementById("create"); if(create)create.onclick=()=>{const title=document.getElementById("title").value.trim();if(!title)return;state.tasks.push({id:crypto.randomUUID(),title,category:document.getElementById("category").value.trim()||"Generale",done:false});save();render();};
 const saveMoney=document.getElementById("saveMoney");if(saveMoney)saveMoney.onclick=()=>{state.income=Number(document.getElementById("income").value)||0;state.expenses=Number(document.getElementById("expenses").value)||0;state.savingsGoal=Number(document.getElementById("goal").value)||0;save();render()};
 const add=document.getElementById("add");if(add)document.getElementById("title")?.focus();
}
document.querySelectorAll("[data-screen]").forEach(b=>b.onclick=()=>{current=b.dataset.screen;render()});
document.getElementById("install").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}else alert("Nel menu del browser scegli 'Installa app'.")};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.getElementById("install").hidden=false});
window.addEventListener("load",()=>{if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});render()});
