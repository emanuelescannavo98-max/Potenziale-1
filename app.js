const KEY = "potenziale_v1";

const defaultState = {
  tasks: [],
  money: {
    income: 0,
    expense: 0
  },
  xp:0,
  page: "home"
};

let state = load();

function load() {
  try {
    const saved = localStorage.getItem(KEY);

    if (!saved) {
      return { ...defaultState };
    }

    return {
      ...defaultState,
      ...JSON.parse(saved)
    };
  } catch (error) {
    return { ...defaultState };
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date) {
  return new Date(date + "T12:00:00").toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function tasksToday() {
  return state.tasks.filter(task => task.date === today());
}

function completedToday() {
  return tasksToday().filter(task => task.completed);
}

function progressPercent() {
  const tasks = tasksToday();

  if (tasks.length === 0) {
    return 0;
  }

  return Math.round(
    (completedToday().length / tasks.length) * 100
  );
}

function navigate(page) {
  state.page = page;
  save();
  render();
}

function render() {
  const content = document.getElementById("content");

  if (!content) {
    return;
  }

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

  updateNavigation();
}

function updateNavigation() {
  document.querySelectorAll(".nav-btn").forEach(button => {
    const action = button.getAttribute("onclick");

    if (!action) {
      return;
    }

    button.classList.toggle(
      "active",
      action.includes(`'${state.page}'`)
    );
  });
}

function homePage() {
  const tasks = tasksToday();
  const completed = completedToday();
  const percent = progressPercent();

  return `
    <section class="hero">
      <div class="eyebrow">OGGI</div>

      <div class="date">
        ${formatDate(today())}
      </div>

      <p>
        Un passo alla volta. Costruiamo il sistema prima di renderlo complesso.
      </p>
    </section>

    <section class="card">
      <div class="section-title">
        <h2>🎯 Oggi</h2>
        <strong>${completed.length}/${tasks.length}</strong>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>

      <p>${percent}% completato</p>

      ${
        tasks.length === 0
          ? `
            <div class="empty">
              Nessuna task per oggi.<br>
              Vai in <strong>Task</strong> per crearne una.
            </div>
          `
          : `
            <div class="task-list">
              ${tasks.map(task => taskHTML(task)).join("")}
            </div>
          `
      }
    </section>

    <section class="stats">
      <div class="stat">
        <strong>${completed.length}</strong>
        <span>Completate oggi</span>
      </div>

      <div class="stat">
        <strong>${moneyBalance().toFixed(2)} €</strong>
        <span>Saldo</span>
      </div>
    </section>
  `;
}

function tasksPage() {
  const tasks = tasksToday();

  return `
    <section class="page">
      <div class="page-header">
        <div>
          <div class="eyebrow">ORGANIZZAZIONE</div>
          <h2>Task</h2>
          <p>Le cose che contano oggi.</p>
        </div>
      </div>

      <form class="task-form" onsubmit="addTask(event)">
        <input
          id="taskInput"
          type="text"
          placeholder="Es. Allenamento"
          autocomplete="off"
          required
        >

        <button type="submit">
          + Aggiungi
        </button>
      </form>

      <div class="task-list">
        ${
          tasks.length === 0
            ? `<div class="empty">Ancora nessuna task per oggi.</div>`
            : tasks.map(task => taskHTML(task)).join("")
        }
      </div>
    </section>
  `;
}

function taskHTML(task) {
  return `
    <div class="task-item ${task.completed ? "completed" : ""}">
      <button
        class="task-check"
        onclick="toggleTask('${task.id}')"
      >
        ${task.completed ? "✓" : ""}
      </button>

      <span>${escapeHTML(task.title)}</span>

      <button
        class="task-delete"
        onclick="deleteTask('${task.id}')"
      >
        ×
      </button>
    </div>
  `;
}

function addTask(event) {
  event.preventDefault();

  const input = document.getElementById("taskInput");

  if (!input) {
    return;
  }

  const title = input.value.trim();

  if (!title) {
    return;
  }

  state.tasks.push({
    id: uid(),
    title: title,
    date: today(),
    completed: false
  });

  save();
  render();
}

function toggleTask(id) {
  const task = state.tasks.find(item => item.id === id);

  if (!task) {
    return;
  }

  task.completed = !task.completed;

  save();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(task => task.id !== id);

  save();
  render();
}

function progressPage() {
  const total = tasksToday().length;
  const completed = completedToday().length;
  const percent = progressPercent();

  return `
    <section class="page">
      <div class="eyebrow">PERFORMANCE</div>
      <h2>Progressi</h2>
      <p>Vediamo quanto stai avanzando.</p>

      <section class="card">
        <h3>Oggi</h3>

        <div class="big-number">
          ${percent}%
        </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width:${percent}%"></div>
        </div>

        <p>${completed} di ${total} task completate.</p>
      </section>

      <section class="card">
        <h3>Obiettivo</h3>
        <p>
          Costruire continuità, un giorno alla volta.
        </p>
      </section>
    </section>
  `;
}

function moneyBalance() {
  return Number(state.money.income || 0) -
         Number(state.money.expense || 0);
}

function moneyPage() {
  const income = Number(state.money.income || 0);
  const expense = Number(state.money.expense || 0);
  const balance = moneyBalance();

  return `
    <section class="page">
      <div class="eyebrow">FINANZE</div>
      <h2>Economia</h2>
      <p>Il tuo quadro economico personale.</p>

      <section class="stats">
        <div class="stat">
          <strong>${income.toFixed(2)} €</strong>
          <span>Entrate</span>
        </div>

        <div class="stat">
          <strong>${expense.toFixed(2)} €</strong>
          <span>Uscite</span>
        </div>
      </section>

      <section class="card">
        <h3>Saldo</h3>

        <div class="big-number">
          ${balance.toFixed(2)} €
        </div>
      </section>

      <section class="card">
        <h3>Aggiungi movimento</h3>

        <form onsubmit="addMoney(event)">
          <input
            id="moneyAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Importo"
            required
          >

          <select id="moneyType">
            <option value="income">Entrata</option>
            <option value="expense">Uscita</option>
          </select>

          <button type="submit">
            Salva
          </button>
        </form>
      </section>
    </section>
  `;
}

function addMoney(event) {
  event.preventDefault();

  const amount = Number(
    document.getElementById("moneyAmount").value
  );

  const type =
    document.getElementById("moneyType").value;

  if (!amount || amount <= 0) {
    return;
  }

  state.money[type] =
    Number(state.money[type] || 0) + amount;

  save();
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  render();
});
