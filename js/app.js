(() => {
  "use strict";

  // Можно поменять код на любой свой четырёхзначный пароль.
  // Это милый локальный квест, а не система реальной защиты данных.
  const SECRET_CODE = "0508";
  const screens = [...document.querySelectorAll("[data-screen]")];
  const display = document.getElementById("safe-display");
  const keypad = document.getElementById("keypad-grid");
  const keypadCard = document.querySelector(".keypad-card");
  const submit = document.getElementById("safe-submit");
  const hpFill = document.getElementById("health-fill");
  const hpTrack = document.getElementById("health-track");
  const hpValue = document.getElementById("health-value");
  const question = document.getElementById("guardian-help");
  const healButton = document.getElementById("guardian-heal");
  const bubble = document.getElementById("guardian-bubble");
  const toast = document.getElementById("toast");
  let enteredCode = "";
  let health = 100;
  let unlocked = false;
  let hintWasShown = false;
  let dialogTimer = null;
  let toastTimer = null;
  let resetDisplayTimer = null;

  function showScreen(name) {
    screens.forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.hidden = !active;
      screen.classList.toggle("is-active", active);
      if (active) {
        // Restart the entrance animation when returning to a screen.
        screen.style.animation = "none";
        void screen.offsetHeight;
        screen.style.animation = "";
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll('[data-action="claim"]').forEach((button) => button.addEventListener("click", () => showScreen("believe")));
  document.querySelectorAll('[data-action="deny"]').forEach((button) => button.addEventListener("click", () => showScreen("accuse")));
  document.querySelectorAll('[data-action="believe"]').forEach((button) => button.addEventListener("click", () => showScreen("believe")));
  document.querySelectorAll('[data-action="vault"]').forEach((button) => button.addEventListener("click", () => showScreen("vault")));

  function heartColorForHealth(value) {
    const green = [130, 213, 155];
    const yellow = [244, 207, 111];
    const red = [231, 111, 132];
    let from, to, t;
    if (value >= 50) {
      from = yellow; to = green; t = (value - 50) / 50;
    } else {
      from = red; to = yellow; t = value / 50;
    }
    const rgb = from.map((n, i) => Math.round(n + (to[i] - n) * t));
    return `rgb(${rgb.join(", ")})`;
  }

  function updateHealth() {
    hpFill.style.transform = `scaleX(${health / 100})`;
    hpFill.style.backgroundColor = heartColorForHealth(health);
    hpTrack.setAttribute("aria-valuenow", String(health));
    hpValue.textContent = String(health);
    hpValue.style.color = heartColorForHealth(health);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 1900);
  }

  function setDisplay(value, type = "") {
    window.clearTimeout(resetDisplayTimer);
    display.classList.remove("is-error", "is-success");
    if (type) display.classList.add(type);
    display.textContent = value;
  }

  function renderEnteredCode() {
    setDisplay(enteredCode ? "• ".repeat(enteredCode.length).trim() : "0");
    submit.classList.toggle("is-ready", enteredCode.length > 0);
  }

  function clearCode() {
    enteredCode = "";
    renderEnteredCode();
  }

  // Когда у стража 0 HP, сейф блокируется, а рядом с подсказкой появляется кнопка лечения.
  function setSafeLocked(locked) {
    keypad.querySelectorAll("button").forEach((button) => { button.disabled = locked; });
    submit.disabled = locked;
    keypadCard.classList.toggle("is-locked", locked);
  }

  function healGuardian() {
    if (health > 0) return;
    health = 100;
    updateHealth();
    healButton.hidden = true;
    setSafeLocked(false);
    clearCode();
    showToast("Китти вылечена до 100 HP 💗");
  }

  function failAttempt() {
    health = Math.max(0, health - 20);
    updateHealth();
    if (health === 0) {
      setSafeLocked(true);
      healButton.hidden = false;
    }
    setDisplay("Ошибка", "is-error");
    keypadCard.classList.remove("is-shaking");
    void keypadCard.offsetWidth;
    keypadCard.classList.add("is-shaking");
    showToast(health > 0 ? `Ой! Китти потеряла 20 HP 💔 Осталось ${health}` : "Ой-ой! У Китти осталось 0 HP 💔");
    enteredCode = "";
    resetDisplayTimer = window.setTimeout(() => {
      if (!unlocked) renderEnteredCode();
    }, 1150);
  }

  function unlockVault() {
    unlocked = true;
    setDisplay("Доступ открыт", "is-success");
    submit.textContent = "Войти";
    submit.classList.add("is-unlocked");
    keypad.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    showToast("Ура! Сейф открыт!");
  }

  function tryCode() {
    if (health === 0) return;
    if (unlocked) {
      window.location.href = "memories.html";
      return;
    }
    if (!enteredCode) {
      showToast("Введи четыре цифры! Ты их знаешь...");
      return;
    }
    if (enteredCode === SECRET_CODE) {
      unlockVault();
    } else {
      failAttempt();
    }
  }

  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || unlocked || button.disabled) return;
    if (button.dataset.digit) {
      if (enteredCode.length >= 4) enteredCode = "";
      enteredCode += button.dataset.digit;
      renderEnteredCode();
      return;
    }
    if (button.dataset.action === "clear") {
      clearCode();
    } else if (button.dataset.action === "delete") {
      enteredCode = enteredCode.slice(0, -1);
      renderEnteredCode();
    }
  });
  submit.addEventListener("click", tryCode);

  document.addEventListener("keydown", (event) => {
    const vaultIsVisible = !document.querySelector('[data-screen="vault"]').hidden;
    if (!vaultIsVisible) return;
    if (health === 0 && (event.key === "Enter" || event.key === "Backspace" || event.key === "Escape" || /^[0-9]$/.test(event.key))) {
      event.preventDefault();
      return;
    }
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      if (!unlocked) {
        if (enteredCode.length >= 4) enteredCode = "";
        enteredCode += event.key;
        renderEnteredCode();
      }
    } else if (event.key === "Backspace") {
      event.preventDefault();
      if (!unlocked) {
        enteredCode = enteredCode.slice(0, -1);
        renderEnteredCode();
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      tryCode();
    } else if (event.key === "Escape") {
      clearCode();
    }
  });

  healButton.addEventListener("click", healGuardian);

  question.addEventListener("click", () => {
    hintWasShown = true;
    bubble.textContent = "Подсказка: тут всё решают любовь и немного удачи <3";
    bubble.hidden = false;
    question.setAttribute("aria-expanded", "true");
    window.clearTimeout(dialogTimer);

    window.clearTimeout(dialogTimer);
    dialogTimer = window.setTimeout(() => {
      bubble.hidden = true;
      question.setAttribute("aria-expanded", "false");
    }, 4000);
  });

  updateHealth();
})();
