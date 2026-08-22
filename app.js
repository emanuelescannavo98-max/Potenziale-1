const KEY="potenziale_state_v1";
const defaultState={page:"home",xp:0,tasks:[
{id:1,title:"Definire le 3 priorità della giornata",category:"Sistema",done:false},
{id:2,title:"Completare un'attività importante",category:"Lavoro",done:false},
{id:3,title:"Controllare le finanze",category:"Economia",done:false}
],money:{income:0,expense:0,movements:[]}};
let state=load();
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s)return {...defaultState,...s,money:{...defaultState.money,...s.money}}}catch(e){}return JSON.parse(JSON.stringify(defaultState))}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function formatDate(d){return new Intl.DateTimeFormat("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(d)}
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function completedToday(){return state.tasks.filter(t=>t.done)}
function progressPercent(){return state.tasks.length?Math.round(completedToday().length/state.tasks.length*100):0}
function moneyBalance(){return Number(state.money.income||0)-Number(state.money.expense||0)}
function taskHTML(t){return `<div class="task ${t.done?"done":""}">
<button class="task-check" onclick="toggleTask(${t.id})">${t.done?"✓":""}</button>
<div class="task-title">${escapeHTML(t.title)}<div class="task-meta">${escapeHTML(t.category||"Generale")}</div></div>
<button class="delete" onclick="deleteTask(${t.id})">×</button></div>`}
function homePage(){const c=completedToday(),p=progressPercent();return `<section class="page">
<section class="hero"><div class="eyebrow">OGGI</div><div class="date">${formatDate(new Date())}</div><p>Un passo alla volta. Costruiamo il sistema prima di rincorrere il risultato.</p></section>
<section class="card"><div class="section-title"><h2>🎯 Oggi</h2><strong>${c.length}/${state.tasks.length}</strong></div>
<div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div><p class="mini">${p}% completato</p>
${state.tasks.length?`<div class="task-list">${state.tasks.map(taskHTML).join("")}</div>`:`<div class="empty">Nessuna task per oggi.<br>Vai in <strong>Task</strong> per crearne una.</div>`}</section>
<section class="stats"><div class="stat"><strong>${state.xp}</strong><span>XP totali</span></div><div class="stat"><strong>€ ${moneyBalance().toFixed(2)}</strong><span>Saldo</span></div></section></section>`}
function tasksPage(){return `<section class="page"><div class="eyebrow">SISTEMA</div><h2>Task</h2><p class="notice">Le attività sono il motore quotidiano di POTENZIALE. Completarle aumenta i tuoi XP.</p>
<section class="card"><div class="section-title"><h3>Oggi</h3><strong>${completedToday().length}/${state.tasks.length}</strong></div><div class="task-list">${state.tasks.length?state.tasks.map(taskHTML).join(""):`<div class="empty">Nessuna task ancora.</div>`}</div></section>
<section class="card"><h3>Nuova task</h3><form onsubmit="addTask(event)"><input id="taskTitle" placeholder="Cosa vuoi completare?" required maxlength="100"><input id="taskCategory" placeholder="Categoria (es. Lavoro, Economia)"><button class="primary" type="submit">Aggiungi task</button></form></section></section>`}
function progressPage(){const p=progressPercent(),c=completedToday().length,total=state.tasks.length,level=Math.floor(state.xp/100)+1,xp=state.xp%100;return `<section class="page"><div class="eyebrow">PERFORMANCE</div><h2>Progressi</h2><p class="notice">Vediamo quanto stai avanzando. La continuità conta più della perfezione.</p>
<section class="card"><h3>Oggi</h3><div class="big-number">${p}%</div><div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div><p class="mini">${c} di ${total} task completate.</p></section>
<section class="card"><div class="level-row"><h3>Livello ${level}</h3><span class="level">⭐ ${xp} / 100 XP</span></div><div class="progress-bar"><div class="progress-fill" style="width:${xp}%"></div></div><p class="mini">${state.xp} XP complessivi</p></section>
<section class="card"><h3>Obiettivo</h3><p>Costruire continuità, un giorno alla volta.</p></section></section>`}
function moneyPage(){const i=Number(state.money.income||0),e=Number(state.money.expense||0),b=moneyBalance();return `<section class="page"><div class="eyebrow">FINANZE</div><h2>Economia</h2><p class="notice">Il tuo quadro economico personale.</p>
<section class="stats"><div class="stat"><strong>€ ${i.toFixed(2)}</strong><span>Entrate</span></div><div class="stat"><strong>€ ${e.toFixed(2)}</strong><span>Uscite</span></div></section>
<section class="card"><h3>Saldo</h3><div class="big-number">€ ${b.toFixed(2)}</div></section>
<section class="card"><h3>Aggiungi movimento</h3><form onsubmit="addMoney(event)"><input id="moneyAmount" type="number" step="0.01" min="0" placeholder="Importo" required><div class="row"><select id="moneyType"><option value="income">Entrata</option><option value="expense">Uscita</option></select><input id="moneyNote" placeholder="Descrizione"></div><button class="primary" type="submit">Salva</button></form>
<div class="money-list">${state.money.movements.length?state.money.movements.slice().reverse().slice(0,20).map(m=>`<div class="money-item"><span>${escapeHTML(m.note||(m.type==="income"?"Entrata":"Uscita"))}<div class="mini">${escapeHTML(m.date)}</div></span><strong class="${m.type}">${m.type==="income"?"+":"-"} € ${Number(m.amount).toFixed(2)}</strong></div>`).join(""):`<div class="empty">Nessun movimento registrato.</div>`}</div></section></section>`}
function render(){const c=document.getElementById("content");if(!c)return;if(state.page==="home")c.innerHTML=homePage();if(state.page==="tasks")c.innerHTML=tasksPage();if(state.page==="progress")c.innerHTML=progressPage();if(state.page==="money")c.innerHTML=moneyPage();updateNavigation()}
function updateNavigation(){document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page))}
function toggleTask(id){const t=state.tasks.find(x=>x.id===id);if(!t)return;if(!t.done){t.done=true;state.xp+=10}else{t.done=false;state.xp=Math.max(0,state.xp-10)}save();render()}
function deleteTask(id){state.tasks=state.tasks.filter(t=>t.id!==id);save();render()}
function addTask(e){e.preventDefault();const title=document.getElementById("taskTitle").value.trim(),category=document.getElementById("taskCategory").value.trim()||"Generale";if(!title)return;state.tasks.push({id:Date.now(),title,category,done:false});save();render()}
function addMoney(e){e.preventDefault();const amount=Number(document.getElementById("moneyAmount").value),type=document.getElementById("moneyType").value,note=document.getElementById("moneyNote").value.trim();if(!amount||amount<=0)return;if(type==="income")state.money.income+=amount;else state.money.expense+=amount;state.money.movements.push({amount,type,note,date:new Date().toLocaleDateString("it-IT")});save();render()}
document.addEventListener("click",e=>{const b=e.target.closest(".nav-btn");if(!b)return;state.page=b.dataset.page;save();render()});
document.addEventListener("DOMContentLoaded",render);
