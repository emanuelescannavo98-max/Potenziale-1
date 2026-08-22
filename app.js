const KEY = "potenziale_v03";

const today = () => new Date().toISOString().slice(0, 10);

let state = JSON.parse(localStorage.getItem(KEY)) || {
  tasks: [],
  money: {
    income: 0,
    expense: 0
  },
  page: "home"
};

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function tasksToday() {
  return state.tasks.filter(task => task.date === today());
}

function completedToday() {
  return tasksToday().filter(task => task.done).length;
}

function progressToday() {
  const tasks = tasksToday();

  if (tasks.length === 0) return 0;

  return Math.round((completedToday() / tasks.length) * 100);
}

function navigate(page) {
  state.page = page;
  save();
  render();
}

function homePage() {
  const tasks = tasksToday();

  return `
    <section class="hero">
      <div class="eyebrow">OGGI</div>
      <h1>POTENZIALE</h1>
      <p>Il tuo sistema personale.</p>
    </section>

    <section class="card">
      <h2>🎯 Oggi</h2>

      <div class="progress">
        <div style="width:${progressToday()}%"></div>
      </div>

      <p>${completedToday()}/${tasks.length} completate</p>

      ${
        tasks.length
          ? tasks.map(task => `
              <div class="task-row">
                <span>${task.done ? "☑️" : "⬜"}</span>
                <strong>${task.title}</strong>
              </div>
            `).join("")
          : `<p>Nessuna task per oggi.</p>`
      }
    </section>

    <section class="stats">
      <div class="stat">
        <strong>${completedToday()}</strong>
        <span>Completate oggi</span>
      </div>

      <div class="stat">
        <strong>${state.money.income - state.money.expense} €</strong>
        <span>Saldo</span>
      </div>
    </section>
  `;
}

function tasksPage() {
  return `
    <section>
      <h1>Task</h1>

      <button onclick="addTask()">
        ➕ Nuova task
      </button>

      <div class="task-list">
        ${
          state.tasks.length
            ? state.tasks.map(task => `
                <div class="task-row">
                  <input
                    type="checkbox"
                    ${task.done ? "checked" : ""}
                    onchange="toggleTask('${task.id}')"
                  >

                  <span>${task.title}</span>
                </div>
              `).join("")
            : `<p>Nessuna task.</p>`
        }
      </div>
    </section>
  `;
}

function progressPage() {
  return `
    <section>
      <h1>Progressi</h1>

      <div class="card">
        <h2>Oggi</h2>
        <strong>${progressToday()}%</strong>
        <p>${completedToday()} task completate</p>
      </div>
    </section>
  `;
}

function moneyPage() {
  const balance = state.money.income - state.money.expense;

  return `
    <section>
      <h1>Economia</h1>

      <div class="card">
        <h2>Saldo</h2>
        <strong>${balance} €</strong>
      </div>

      <button onclick="addIncome()">
        ➕ Entrata
      </button>

      <button onclick="addExpense()">
        ➖ Spesa
      </button>
    </section>
  `;
}

function addTask() {
  const title = prompt("Cosa devi fare?");

  if (!title) return;

  state.tasks.push({
    id: Date.now().toString(),
    title: title,
    date: today(),
    done: false
  });

  save();
  render();
}

function toggleTask(id) {
  const task = state.tasks.find(task => task.id === id);

  if (!task) return;

  task.done = !task.done;

  save();
  render();
}

function addIncome() {
  const amount = Number(prompt("Importo entrata (€)"));

  if (!amount || amount <= 0) return;

  state.money.income += amount;

  save();
  render();
}

function addExpense() {
  const amount = Number(prompt("Importo spesa (€)"));

  if (!amount || amount <= 0) return;

  state.money.expense += amount;

  save();
  render();
}

function render() {
  const content = document.getElementById("content");

  if (state.page === "home") {
    content.innerHTML = homePage();
  }

  if (state.page === "tasks") {
    content.innerHTML = tasksPage();
  }

  if (state.page === "progress") {
    content.innerHTML = progressPage();
  }

  if (state.page === "money") {
    content.innerHTML = moneyPage();
  }
}

document.addEventListener("DOMContentLoaded", render);
