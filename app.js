diff --git a/app.js b/app.js
index f4064fdb76b1cd5b2d5ab27ccdf46a1c046ffc95..598f6683176b6c94e47deaccf0b8ed6139633ecd 100644
--- a/app.js
+++ b/app.js
@@ -1,243 +1,240 @@
-const triviaQuestions = [
-  {
-    question: "What is the capital city of Australia?",
-    options: ["Sydney", "Canberra", "Melbourne", "Perth"],
-    answer: "Canberra",
-  },
-  {
-    question: "Which planet is called the Red Planet?",
-    options: ["Venus", "Mars", "Jupiter", "Saturn"],
-    answer: "Mars",
-  },
-  {
-    question: "What year did the first iPhone launch?",
-    options: ["2005", "2007", "2010", "2012"],
-    answer: "2007",
-  },
-  {
-    question: "Which element has the chemical symbol O?",
-    options: ["Gold", "Oxygen", "Osmium", "Zinc"],
-    answer: "Oxygen",
-  },
-  {
-    question: "How many players are on a soccer team on the field at once?",
-    options: ["9", "10", "11", "12"],
-    answer: "11",
-  },
-  {
-    question: "What is the largest ocean on Earth?",
-    options: ["Indian Ocean", "Atlantic Ocean", "Arctic Ocean", "Pacific Ocean"],
-    answer: "Pacific Ocean",
-  },
-];
-
-const words = ["puzzle", "galaxy", "notebook", "quantum", "library", "trivia", "cipher"];
-
-const questionEl = document.getElementById("question");
-const answersEl = document.getElementById("answers");
-const feedbackEl = document.getElementById("feedback");
-const scoreEl = document.getElementById("score");
-const totalEl = document.getElementById("total");
-const bestScoreEl = document.getElementById("best-score");
-const questionProgressEl = document.getElementById("question-progress");
-const nextQuestionBtn = document.getElementById("next-question");
-const resetTriviaBtn = document.getElementById("reset-trivia");
-
-const scrambledEl = document.getElementById("scrambled");
-const guessEl = document.getElementById("guess");
-const puzzleFeedbackEl = document.getElementById("puzzle-feedback");
-const attemptCountEl = document.getElementById("attempt-count");
-const checkGuessBtn = document.getElementById("check-guess");
-const showHintBtn = document.getElementById("show-hint");
-const newPuzzleBtn = document.getElementById("new-puzzle");
-
-const STORAGE_KEY = "trivia-best-score";
-
-let questionDeck = [];
-let currentQuestion = null;
-let score = 0;
-let askedCount = 0;
-let hasAnsweredCurrent = false;
-
-let currentWord = "";
-let puzzleAttempts = 0;
-
-function shuffle(list) {
-  const copy = [...list];
-
-  for (let i = copy.length - 1; i > 0; i -= 1) {
-    const j = Math.floor(Math.random() * (i + 1));
-    [copy[i], copy[j]] = [copy[j], copy[i]];
-  }
-
-  return copy;
+import { SEEDED_EVENTS, SOURCE_CATALOG } from "./data.js";
+import {
+  CACHE_KEY,
+  CITY_KEY,
+  DAY_MS,
+  RADIUS_MILES,
+  haversineMiles,
+  prettyDateRange,
+  readJsonStorage,
+  sourceBadge,
+  writeJsonStorage,
+} from "./utils.js";
+
+const stateSelect = document.getElementById("state-select");
+const cityInput = document.getElementById("city-input");
+const cityMessage = document.getElementById("city-message");
+const applyCityButton = document.getElementById("apply-city");
+const clearCityButton = document.getElementById("clear-city");
+const refreshButton = document.getElementById("refresh-btn");
+const cardsRoot = document.getElementById("cards");
+const cardTemplate = document.getElementById("event-card-template");
+const resultSummary = document.getElementById("result-summary");
+const lastSync = document.getElementById("last-sync");
+const sourceList = document.getElementById("source-list");
+
+const DIRECTORY_STATE = {
+  events: [],
+  selectedState: "all",
+  cityCenter: readJsonStorage(CITY_KEY),
+};
+
+function hydrateSourceList() {
+  sourceList.innerHTML = "";
+
+  SOURCE_CATALOG.forEach((source) => {
+    const li = document.createElement("li");
+    li.innerHTML = `<a href="${source.homepage}" target="_blank" rel="noopener noreferrer">${source.name}</a> <span class="chip">${sourceBadge(source.type)}</span>`;
+    sourceList.appendChild(li);
+  });
 }
 
-function pickRandomItem(list) {
-  return list[Math.floor(Math.random() * list.length)];
+function populateStateSelect(events) {
+  const states = [...new Set(events.map((event) => event.state))].sort();
+  stateSelect.innerHTML = '<option value="all">All states</option>';
+
+  states.forEach((stateCode) => {
+    const option = document.createElement("option");
+    option.value = stateCode;
+    option.textContent = stateCode;
+    stateSelect.appendChild(option);
+  });
 }
 
-function loadBestScore() {
-  const saved = Number(localStorage.getItem(STORAGE_KEY) || 0);
-  bestScoreEl.textContent = Number.isFinite(saved) ? saved : 0;
+function resolveSourceName(sourceId) {
+  return SOURCE_CATALOG.find((source) => source.id === sourceId)?.name ?? "Unknown source";
 }
 
-function saveBestScoreIfNeeded() {
-  const bestScore = Number(bestScoreEl.textContent);
+function renderCards() {
+  cardsRoot.innerHTML = "";
+
+  const visibleEvents = DIRECTORY_STATE.events
+    .filter((event) =>
+      DIRECTORY_STATE.selectedState === "all" ? true : event.state === DIRECTORY_STATE.selectedState,
+    )
+    .map((event) => {
+      if (!DIRECTORY_STATE.cityCenter) {
+        return { ...event, distance: null };
+      }
+
+      return {
+        ...event,
+        distance: haversineMiles(
+          DIRECTORY_STATE.cityCenter.lat,
+          DIRECTORY_STATE.cityCenter.lon,
+          event.lat,
+          event.lon,
+        ),
+      };
+    })
+    .filter((event) => (DIRECTORY_STATE.cityCenter ? event.distance <= RADIUS_MILES : true))
+    .sort((left, right) => new Date(left.startDate) - new Date(right.startDate));
+
+  visibleEvents.forEach((event) => {
+    const node = cardTemplate.content.cloneNode(true);
+
+    node.querySelector(".card__name").textContent = event.name;
+    node.querySelector(".card__dates").textContent = prettyDateRange(event.startDate, event.endDate);
+    node.querySelector(".card__location").textContent = `${event.venue} • ${event.city}, ${event.state}`;
+    node.querySelector(".card__format").textContent = event.format;
+
+    const chips = node.querySelector(".chip-row");
+
+    const sourceChip = document.createElement("span");
+    sourceChip.className = "chip";
+    sourceChip.textContent = resolveSourceName(event.sourceId);
+    chips.appendChild(sourceChip);
+
+    if (event.distance !== null) {
+      const distanceChip = document.createElement("span");
+      distanceChip.className = "chip";
+      distanceChip.textContent = `${event.distance.toFixed(1)} miles`;
+      chips.appendChild(distanceChip);
+    }
 
-  if (score > bestScore) {
-    localStorage.setItem(STORAGE_KEY, String(score));
-    bestScoreEl.textContent = String(score);
-  }
-}
+    node.querySelector(".card__action").addEventListener("click", () => {
+      localStorage.setItem("atlas-selected-event", JSON.stringify(event));
+      window.location.href = `details.html?id=${encodeURIComponent(event.id)}`;
+    });
+
+    cardsRoot.appendChild(node);
+  });
 
-function prepareDeckIfNeeded() {
-  if (questionDeck.length === 0) {
-    questionDeck = shuffle(triviaQuestions);
-    askedCount = 0;
+  if (visibleEvents.length === 0) {
+    cardsRoot.innerHTML = '<p class="helper">No tournaments match your current filters.</p>';
   }
-}
 
-function setTriviaFeedback(message = "", status = "") {
-  feedbackEl.textContent = message;
-  feedbackEl.className = `feedback ${status}`.trim();
+  resultSummary.textContent = `${visibleEvents.length} event${visibleEvents.length === 1 ? "" : "s"} shown`;
 }
 
-function updateTriviaMeta() {
-  totalEl.textContent = String(askedCount);
-  questionProgressEl.textContent = `${Math.min(askedCount + 1, triviaQuestions.length)} / ${triviaQuestions.length}`;
+function mergeSourceFeeds() {
+  // This project intentionally keeps adapters local-first for reliability in static hosting.
+  // Replace this function with live source fetchers where CORS/API access is available.
+  return SEEDED_EVENTS;
 }
 
-function renderQuestion() {
-  prepareDeckIfNeeded();
-
-  currentQuestion = questionDeck.pop();
-  hasAnsweredCurrent = false;
-
-  questionEl.textContent = currentQuestion.question;
-  setTriviaFeedback();
-  answersEl.innerHTML = "";
+function cacheIsFresh(cache) {
+  if (!cache?.syncedAt || !Array.isArray(cache.events)) {
+    return false;
+  }
 
-  const shuffledOptions = shuffle(currentQuestion.options);
-  shuffledOptions.forEach((option) => {
-    const button = document.createElement("button");
-    button.className = "btn answer-btn";
-    button.type = "button";
-    button.textContent = option;
-    button.addEventListener("click", () => checkAnswer(option, button));
-    answersEl.appendChild(button);
-  });
+  return Date.now() - new Date(cache.syncedAt).getTime() < DAY_MS;
+}
 
-  nextQuestionBtn.disabled = true;
-  updateTriviaMeta();
+function setLastSyncLabel(isoDate) {
+  const friendly = new Date(isoDate).toLocaleString();
+  lastSync.textContent = `Last sync: ${friendly}`;
 }
 
-function lockAnswerButtons(selectedAnswer) {
-  const allAnswerButtons = [...answersEl.querySelectorAll("button")];
+function loadEvents({ forceRefresh = false } = {}) {
+  const cache = readJsonStorage(CACHE_KEY);
 
-  allAnswerButtons.forEach((button) => {
-    const option = button.textContent;
+  if (!forceRefresh && cacheIsFresh(cache)) {
+    DIRECTORY_STATE.events = cache.events;
+    setLastSyncLabel(cache.syncedAt);
+    return;
+  }
 
-    button.disabled = true;
+  const events = mergeSourceFeeds();
+  const syncedAt = new Date().toISOString();
 
-    if (option === currentQuestion.answer) {
-      button.classList.add("correct");
-    } else if (option === selectedAnswer) {
-      button.classList.add("wrong");
-    }
-  });
+  DIRECTORY_STATE.events = events;
+  writeJsonStorage(CACHE_KEY, { syncedAt, events });
+  setLastSyncLabel(syncedAt);
 }
 
-function checkAnswer(selectedAnswer) {
-  if (hasAnsweredCurrent) {
-    return;
-  }
-
-  hasAnsweredCurrent = true;
-  askedCount += 1;
+async function geocodeCity(cityQuery) {
+  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(
+    cityQuery,
+  )}`;
 
-  if (selectedAnswer === currentQuestion.answer) {
-    score += 1;
-    scoreEl.textContent = String(score);
-    setTriviaFeedback("Correct! Nice work.", "good");
-  } else {
-    setTriviaFeedback(`Not quite. Correct answer: ${currentQuestion.answer}`, "bad");
+  const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
+  if (!response.ok) {
+    throw new Error("Geocoder unavailable. Try again shortly.");
   }
 
-  lockAnswerButtons(selectedAnswer);
-  saveBestScoreIfNeeded();
-  updateTriviaMeta();
-  nextQuestionBtn.disabled = false;
-}
-
-function resetTriviaRound() {
-  score = 0;
-  askedCount = 0;
-  scoreEl.textContent = "0";
-  totalEl.textContent = "0";
-  questionDeck = [];
-  renderQuestion();
-}
+  const payload = await response.json();
+  if (!payload.length) {
+    throw new Error("City not found. Try format 'City, ST'.");
+  }
 
-function scramble(word) {
-  return shuffle(word.split("")).join("");
+  return {
+    label: cityQuery,
+    lat: Number(payload[0].lat),
+    lon: Number(payload[0].lon),
+  };
 }
 
-function renderPuzzle() {
-  currentWord = pickRandomItem(words);
-  let scrambled = scramble(currentWord);
-
-  while (scrambled === currentWord) {
-    scrambled = scramble(currentWord);
+function applySavedCityUi() {
+  if (!DIRECTORY_STATE.cityCenter) {
+    return;
   }
 
-  puzzleAttempts = 0;
-  attemptCountEl.textContent = `Attempts: ${puzzleAttempts}`;
-  scrambledEl.textContent = scrambled;
-  guessEl.value = "";
-  puzzleFeedbackEl.textContent = "";
-  puzzleFeedbackEl.className = "feedback";
+  cityInput.value = DIRECTORY_STATE.cityCenter.label;
+  cityMessage.textContent = `Radius filter active: within ${RADIUS_MILES} miles of ${DIRECTORY_STATE.cityCenter.label}.`;
 }
 
-function checkGuess() {
-  const guess = guessEl.value.trim().toLowerCase();
+async function applyCityFilter() {
+  const query = cityInput.value.trim();
 
-  if (!guess) {
-    puzzleFeedbackEl.textContent = "Type a guess first.";
-    puzzleFeedbackEl.className = "feedback bad";
+  if (!query) {
+    cityMessage.textContent = "Enter a city first.";
     return;
   }
 
-  puzzleAttempts += 1;
-  attemptCountEl.textContent = `Attempts: ${puzzleAttempts}`;
-
-  if (guess === currentWord) {
-    puzzleFeedbackEl.textContent = "You solved it!";
-    puzzleFeedbackEl.className = "feedback good";
-  } else {
-    puzzleFeedbackEl.textContent = "Nope, try again.";
-    puzzleFeedbackEl.className = "feedback bad";
+  applyCityButton.disabled = true;
+  cityMessage.textContent = "Finding city coordinates…";
+
+  try {
+    DIRECTORY_STATE.cityCenter = await geocodeCity(query);
+    writeJsonStorage(CITY_KEY, DIRECTORY_STATE.cityCenter);
+    cityMessage.textContent = `Radius filter active: within ${RADIUS_MILES} miles of ${query}.`;
+    renderCards();
+  } catch (error) {
+    cityMessage.textContent = error.message;
+  } finally {
+    applyCityButton.disabled = false;
   }
 }
 
-function showHint() {
-  const hint = `Hint: starts with '${currentWord[0].toUpperCase()}' and has ${currentWord.length} letters.`;
-  puzzleFeedbackEl.textContent = hint;
-  puzzleFeedbackEl.className = "feedback";
+function clearCityFilter() {
+  DIRECTORY_STATE.cityCenter = null;
+  localStorage.removeItem(CITY_KEY);
+  cityInput.value = "";
+  cityMessage.textContent = "Radius filter cleared.";
+  renderCards();
 }
 
-nextQuestionBtn.addEventListener("click", renderQuestion);
-resetTriviaBtn.addEventListener("click", resetTriviaRound);
-checkGuessBtn.addEventListener("click", checkGuess);
-showHintBtn.addEventListener("click", showHint);
-newPuzzleBtn.addEventListener("click", renderPuzzle);
+function init() {
+  hydrateSourceList();
+  loadEvents();
+  populateStateSelect(DIRECTORY_STATE.events);
+  applySavedCityUi();
+  renderCards();
 
-guessEl.addEventListener("keydown", (event) => {
-  if (event.key === "Enter") {
-    checkGuess();
-  }
-});
+  stateSelect.addEventListener("change", (event) => {
+    DIRECTORY_STATE.selectedState = event.target.value;
+    renderCards();
+  });
+
+  applyCityButton.addEventListener("click", applyCityFilter);
+  clearCityButton.addEventListener("click", clearCityFilter);
+
+  refreshButton.addEventListener("click", () => {
+    loadEvents({ forceRefresh: true });
+    populateStateSelect(DIRECTORY_STATE.events);
+    renderCards();
+  });
+}
 
-loadBestScore();
-resetTriviaRound();
-renderPuzzle();
+init();
