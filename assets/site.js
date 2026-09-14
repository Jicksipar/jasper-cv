const body = document.body;
const gate = document.querySelector(".language-gate");
const langButtons = document.querySelectorAll("[data-set-lang]");
const dateNodes = document.querySelectorAll("[data-current-date]");

function renderDate(lang) {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
  dateNodes.forEach((node) => {
    node.textContent = formatter.format(date);
  });
}

function setLanguage(lang, remember = true) {
  body.dataset.lang = lang;
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
  langButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.setLang === lang));
  });
  renderDate(lang);
  if (remember) localStorage.setItem("jasper-site-language", lang);
  if (gate) gate.hidden = true;
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.setLang));
});

const savedLanguage = localStorage.getItem("jasper-site-language");
if (savedLanguage === "en" || savedLanguage === "zh") {
  setLanguage(savedLanguage, false);
} else {
  renderDate("en");
  if (gate) gate.hidden = false;
}

const flipbook = document.querySelector("#flipbook");
const pages = flipbook ? Array.from(flipbook.querySelectorAll(".reader-page")) : [];
const prevButton = document.querySelector("[data-flip-prev]");
const nextButton = document.querySelector("[data-flip-next]");
const pageCounter = document.querySelector("[data-page-counter]");
let currentPage = 0;
let turning = false;
let touchStartX = null;

function updatePageCounter() {
  if (pageCounter) pageCounter.textContent = `${currentPage + 1} / ${pages.length}`;
}

function turnTo(nextPage, direction = 1) {
  if (!pages.length || turning || nextPage === currentPage) return;
  const wrappedPage = (nextPage + pages.length) % pages.length;
  const oldPage = pages[currentPage];
  const newPage = pages[wrappedPage];
  turning = true;

  oldPage.classList.add("turn-out");
  if (direction < 0) oldPage.classList.add("reverse");

  setTimeout(() => {
    oldPage.classList.remove("active", "turn-out", "reverse");
    newPage.classList.add("active", "turn-in");
    if (direction < 0) newPage.classList.add("reverse");
    currentPage = wrappedPage;
    updatePageCounter();

    setTimeout(() => {
      newPage.classList.remove("turn-in", "reverse");
      turning = false;
    }, 430);
  }, 250);
}

if (pages.length) {
  updatePageCounter();
  prevButton?.addEventListener("click", () => turnTo(currentPage - 1, -1));
  nextButton?.addEventListener("click", () => turnTo(currentPage + 1, 1));

  flipbook.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  flipbook.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      turnTo(currentPage + (deltaX < 0 ? 1 : -1), deltaX < 0 ? 1 : -1);
    }
    touchStartX = null;
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") turnTo(currentPage + 1, 1);
    if (event.key === "ArrowLeft") turnTo(currentPage - 1, -1);
  });
}
