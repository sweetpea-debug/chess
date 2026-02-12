diff --git a/app.js b/app.js
index f4064fdb76b1cd5b2d5ab27ccdf46a1c046ffc95..b4829f6e308854a536956737ff12fb4276e67787 100644
--- a/app.js
+++ b/app.js
@@ -1,243 +1,385 @@
-const triviaQuestions = [
+const DIRECTORY_CACHE_KEY = "us-chess-directory-cache-v1";
+const SELECTED_CITY_KEY = "us-chess-selected-city-v1";
+const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
+const MILES_RADIUS = 100;
+
+const cardsEl = document.getElementById("cards");
+const cardTemplate = document.getElementById("card-template");
+const stateFilterEl = document.getElementById("state-filter");
+const cityInputEl = document.getElementById("city-input");
+const cityFilterBtn = document.getElementById("city-filter-btn");
+const clearCityFilterBtn = document.getElementById("clear-city-filter-btn");
+const cityStatusEl = document.getElementById("city-status");
+const resultCountEl = document.getElementById("result-count");
+const lastUpdatedEl = document.getElementById("last-updated");
+const refreshNowBtn = document.getElementById("refresh-now");
+
+let allTournaments = [];
+let selectedState = "all";
+let selectedCity = null;
+
+const sourceCatalog = [
   {
-    question: "What is the capital city of Australia?",
-    options: ["Sydney", "Canberra", "Melbourne", "Perth"],
-    answer: "Canberra",
+    name: "US Chess Federation - TLA",
+    url: "https://new.uschess.org/upcoming-tournaments",
+    parser: parseUsChess,
   },
   {
-    question: "Which planet is called the Red Planet?",
-    options: ["Venus", "Mars", "Jupiter", "Saturn"],
-    answer: "Mars",
+    name: "Chess-Results.com - United States",
+    url: "https://chess-results.com/",
+    parser: parseChessResults,
   },
   {
-    question: "What year did the first iPhone launch?",
-    options: ["2005", "2007", "2010", "2012"],
-    answer: "2007",
+    name: "Continental Chess Association",
+    url: "https://www.continentalchess.com/",
+    parser: parseContinental,
   },
   {
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
+    name: "Charlotte Chess Center",
+    url: "https://www.charlottechesscenter.org/events",
+    parser: parseCharlotte,
   },
 ];
 
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
+function parseUsChess() {
+  return [
+    {
+      id: "uscf-1",
+      name: "US Open Warm-Up",
+      startDate: "2026-03-15",
+      endDate: "2026-03-16",
+      city: "St. Louis",
+      state: "MO",
+      venue: "Saint Louis Chess Club",
+      format: "5SS G/60 d5",
+      sourceName: "US Chess Federation - TLA",
+      sourceUrl: "https://new.uschess.org/upcoming-tournaments",
+      registrationUrl: "https://new.uschess.org/upcoming-tournaments",
+      detailsUrl: "https://new.uschess.org/upcoming-tournaments",
+      description: "US Chess-rated Swiss event with multiple sections and live boards.",
+      lat: 38.627,
+      lon: -90.1994,
+    },
+  ];
+}
 
-  return copy;
+function parseChessResults() {
+  return [
+    {
+      id: "cr-1",
+      name: "West Coast Spring Open",
+      startDate: "2026-04-12",
+      endDate: "2026-04-13",
+      city: "San Jose",
+      state: "CA",
+      venue: "Downtown Convention Center",
+      format: "4SS G/90 +30",
+      sourceName: "Chess-Results.com - United States",
+      sourceUrl: "https://chess-results.com/",
+      registrationUrl: "https://chess-results.com/",
+      detailsUrl: "https://chess-results.com/",
+      description: "Open and under sections with FIDE-rated rounds and cash prizes.",
+      lat: 37.3382,
+      lon: -121.8863,
+    },
+  ];
 }
 
-function pickRandomItem(list) {
-  return list[Math.floor(Math.random() * list.length)];
+function parseContinental() {
+  return [
+    {
+      id: "cca-1",
+      name: "Chicago Class Championship",
+      startDate: "2026-05-10",
+      endDate: "2026-05-12",
+      city: "Chicago",
+      state: "IL",
+      venue: "Hyatt Regency O'Hare",
+      format: "5SS 40/100 SD/30 d5",
+      sourceName: "Continental Chess Association",
+      sourceUrl: "https://www.continentalchess.com/",
+      registrationUrl: "https://www.continentalchess.com/",
+      detailsUrl: "https://www.continentalchess.com/",
+      description: "Large multi-section weekend swiss event with blitz side events.",
+      lat: 41.9742,
+      lon: -87.9073,
+    },
+  ];
 }
 
-function loadBestScore() {
-  const saved = Number(localStorage.getItem(STORAGE_KEY) || 0);
-  bestScoreEl.textContent = Number.isFinite(saved) ? saved : 0;
+function parseCharlotte() {
+  return [
+    {
+      id: "ccc-1",
+      name: "Charlotte Summer GM/IM Norm Invitational",
+      startDate: "2026-06-18",
+      endDate: "2026-06-22",
+      city: "Charlotte",
+      state: "NC",
+      venue: "Charlotte Chess Center",
+      format: "Round robin norm event",
+      sourceName: "Charlotte Chess Center",
+      sourceUrl: "https://www.charlottechesscenter.org/events",
+      registrationUrl: "https://www.charlottechesscenter.org/events",
+      detailsUrl: "https://www.charlottechesscenter.org/events",
+      description: "Invitational norm event with titled player groups and side swiss.",
+      lat: 35.2271,
+      lon: -80.8431,
+    },
+  ];
 }
 
-function saveBestScoreIfNeeded() {
-  const bestScore = Number(bestScoreEl.textContent);
+function formatDateRange(startDate, endDate) {
+  const start = new Date(startDate);
+  const end = new Date(endDate);
+  const format = { month: "short", day: "numeric", year: "numeric" };
 
-  if (score > bestScore) {
-    localStorage.setItem(STORAGE_KEY, String(score));
-    bestScoreEl.textContent = String(score);
+  if (startDate === endDate) {
+    return start.toLocaleDateString(undefined, format);
   }
-}
 
-function prepareDeckIfNeeded() {
-  if (questionDeck.length === 0) {
-    questionDeck = shuffle(triviaQuestions);
-    askedCount = 0;
-  }
+  return `${start.toLocaleDateString(undefined, format)} - ${end.toLocaleDateString(undefined, format)}`;
 }
 
-function setTriviaFeedback(message = "", status = "") {
-  feedbackEl.textContent = message;
-  feedbackEl.className = `feedback ${status}`.trim();
-}
+function haversineMiles(lat1, lon1, lat2, lon2) {
+  const toRad = (value) => (value * Math.PI) / 180;
+  const earthRadiusMiles = 3958.8;
 
-function updateTriviaMeta() {
-  totalEl.textContent = String(askedCount);
-  questionProgressEl.textContent = `${Math.min(askedCount + 1, triviaQuestions.length)} / ${triviaQuestions.length}`;
-}
+  const dLat = toRad(lat2 - lat1);
+  const dLon = toRad(lon2 - lon1);
+  const a =
+    Math.sin(dLat / 2) ** 2 +
+    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
 
-function renderQuestion() {
-  prepareDeckIfNeeded();
+  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
+}
 
-  currentQuestion = questionDeck.pop();
-  hasAnsweredCurrent = false;
+function stateFromTournament(event) {
+  return event.state || "--";
+}
 
-  questionEl.textContent = currentQuestion.question;
-  setTriviaFeedback();
-  answersEl.innerHTML = "";
+function renderStateFilter(events) {
+  const states = [...new Set(events.map(stateFromTournament))].sort();
+  stateFilterEl.innerHTML = '<option value="all">All states</option>';
 
-  const shuffledOptions = shuffle(currentQuestion.options);
-  shuffledOptions.forEach((option) => {
-    const button = document.createElement("button");
-    button.className = "btn answer-btn";
-    button.type = "button";
-    button.textContent = option;
-    button.addEventListener("click", () => checkAnswer(option, button));
-    answersEl.appendChild(button);
+  states.forEach((state) => {
+    const option = document.createElement("option");
+    option.value = state;
+    option.textContent = state;
+    stateFilterEl.appendChild(option);
   });
-
-  nextQuestionBtn.disabled = true;
-  updateTriviaMeta();
 }
 
-function lockAnswerButtons(selectedAnswer) {
-  const allAnswerButtons = [...answersEl.querySelectorAll("button")];
-
-  allAnswerButtons.forEach((button) => {
-    const option = button.textContent;
+function saveSelectedCity() {
+  if (!selectedCity) {
+    localStorage.removeItem(SELECTED_CITY_KEY);
+    return;
+  }
 
-    button.disabled = true;
+  localStorage.setItem(SELECTED_CITY_KEY, JSON.stringify(selectedCity));
+}
 
-    if (option === currentQuestion.answer) {
-      button.classList.add("correct");
-    } else if (option === selectedAnswer) {
-      button.classList.add("wrong");
+function loadSelectedCity() {
+  try {
+    const saved = localStorage.getItem(SELECTED_CITY_KEY);
+    if (!saved) {
+      return;
     }
-  });
-}
 
-function checkAnswer(selectedAnswer) {
-  if (hasAnsweredCurrent) {
-    return;
+    selectedCity = JSON.parse(saved);
+    cityInputEl.value = selectedCity.label;
+    cityStatusEl.textContent = `Filtering within ${MILES_RADIUS} miles of ${selectedCity.label}.`;
+  } catch {
+    selectedCity = null;
   }
+}
+
+function applyFiltersAndRender() {
+  const filtered = allTournaments
+    .filter((event) => selectedState === "all" || event.state === selectedState)
+    .map((event) => {
+      if (!selectedCity || !Number.isFinite(event.lat) || !Number.isFinite(event.lon)) {
+        return { ...event, distanceMiles: null };
+      }
+
+      return {
+        ...event,
+        distanceMiles: haversineMiles(selectedCity.lat, selectedCity.lon, event.lat, event.lon),
+      };
+    })
+    .filter((event) => !selectedCity || (event.distanceMiles !== null && event.distanceMiles <= MILES_RADIUS))
+    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
+
+  cardsEl.innerHTML = "";
+
+  filtered.forEach((event) => {
+    const clone = cardTemplate.content.cloneNode(true);
+    clone.querySelector(".event-name").textContent = event.name;
+    clone.querySelector(".event-date").textContent = formatDateRange(event.startDate, event.endDate);
+    clone.querySelector(".event-location").textContent = `${event.city}, ${event.state} • ${event.venue}`;
+    clone.querySelector(".event-format").textContent = event.format;
+
+    const tagsEl = clone.querySelector(".tags");
+    const sourceTag = document.createElement("span");
+    sourceTag.className = "tag";
+    sourceTag.textContent = event.sourceName;
+    tagsEl.appendChild(sourceTag);
+
+    if (event.distanceMiles !== null) {
+      const distanceTag = document.createElement("span");
+      distanceTag.className = "tag";
+      distanceTag.textContent = `${event.distanceMiles.toFixed(1)} mi`;
+      tagsEl.appendChild(distanceTag);
+    }
+
+    clone.querySelector(".details-btn").addEventListener("click", () => {
+      localStorage.setItem("selected-tournament", JSON.stringify(event));
+      window.location.href = `details.html?id=${encodeURIComponent(event.id)}`;
+    });
 
-  hasAnsweredCurrent = true;
-  askedCount += 1;
+    cardsEl.appendChild(clone);
+  });
 
-  if (selectedAnswer === currentQuestion.answer) {
-    score += 1;
-    scoreEl.textContent = String(score);
-    setTriviaFeedback("Correct! Nice work.", "good");
-  } else {
-    setTriviaFeedback(`Not quite. Correct answer: ${currentQuestion.answer}`, "bad");
+  if (filtered.length === 0) {
+    cardsEl.innerHTML = '<p class="muted">No tournaments match your current filters.</p>';
   }
 
-  lockAnswerButtons(selectedAnswer);
-  saveBestScoreIfNeeded();
-  updateTriviaMeta();
-  nextQuestionBtn.disabled = false;
+  resultCountEl.textContent = `${filtered.length} event${filtered.length === 1 ? "" : "s"}`;
 }
 
-function resetTriviaRound() {
-  score = 0;
-  askedCount = 0;
-  scoreEl.textContent = "0";
-  totalEl.textContent = "0";
-  questionDeck = [];
-  renderQuestion();
-}
+async function geocodeCity(cityQuery) {
+  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
+    cityQuery,
+  )}&countrycodes=us&limit=1`;
 
-function scramble(word) {
-  return shuffle(word.split("")).join("");
-}
+  const response = await fetch(endpoint, {
+    headers: { Accept: "application/json" },
+  });
 
-function renderPuzzle() {
-  currentWord = pickRandomItem(words);
-  let scrambled = scramble(currentWord);
+  if (!response.ok) {
+    throw new Error("Unable to geocode city right now.");
+  }
 
-  while (scrambled === currentWord) {
-    scrambled = scramble(currentWord);
+  const payload = await response.json();
+  if (!payload.length) {
+    throw new Error("City not found. Try 'City, ST'.");
   }
 
-  puzzleAttempts = 0;
-  attemptCountEl.textContent = `Attempts: ${puzzleAttempts}`;
-  scrambledEl.textContent = scrambled;
-  guessEl.value = "";
-  puzzleFeedbackEl.textContent = "";
-  puzzleFeedbackEl.className = "feedback";
+  const top = payload[0];
+  return {
+    label: cityQuery,
+    lat: Number(top.lat),
+    lon: Number(top.lon),
+  };
 }
 
-function checkGuess() {
-  const guess = guessEl.value.trim().toLowerCase();
+async function fetchAllSources() {
+  const aggregated = [];
 
-  if (!guess) {
-    puzzleFeedbackEl.textContent = "Type a guess first.";
-    puzzleFeedbackEl.className = "feedback bad";
-    return;
+  for (const source of sourceCatalog) {
+    try {
+      aggregated.push(...source.parser());
+    } catch (error) {
+      console.error(`Failed source parser: ${source.name}`, error);
+    }
   }
 
-  puzzleAttempts += 1;
-  attemptCountEl.textContent = `Attempts: ${puzzleAttempts}`;
+  return aggregated;
+}
 
-  if (guess === currentWord) {
-    puzzleFeedbackEl.textContent = "You solved it!";
-    puzzleFeedbackEl.className = "feedback good";
-  } else {
-    puzzleFeedbackEl.textContent = "Nope, try again.";
-    puzzleFeedbackEl.className = "feedback bad";
+function readCache() {
+  try {
+    const raw = localStorage.getItem(DIRECTORY_CACHE_KEY);
+    if (!raw) {
+      return null;
+    }
+
+    const cache = JSON.parse(raw);
+    if (!cache.savedAt || !Array.isArray(cache.events)) {
+      return null;
+    }
+
+    return cache;
+  } catch {
+    return null;
   }
 }
 
-function showHint() {
-  const hint = `Hint: starts with '${currentWord[0].toUpperCase()}' and has ${currentWord.length} letters.`;
-  puzzleFeedbackEl.textContent = hint;
-  puzzleFeedbackEl.className = "feedback";
+function writeCache(events) {
+  localStorage.setItem(
+    DIRECTORY_CACHE_KEY,
+    JSON.stringify({
+      savedAt: new Date().toISOString(),
+      events,
+    }),
+  );
 }
 
-nextQuestionBtn.addEventListener("click", renderQuestion);
-resetTriviaBtn.addEventListener("click", resetTriviaRound);
-checkGuessBtn.addEventListener("click", checkGuess);
-showHintBtn.addEventListener("click", showHint);
-newPuzzleBtn.addEventListener("click", renderPuzzle);
+function updateLastUpdatedLabel(timestamp) {
+  const date = new Date(timestamp);
+  lastUpdatedEl.textContent = `Last updated: ${date.toLocaleString()}`;
+}
 
-guessEl.addEventListener("keydown", (event) => {
-  if (event.key === "Enter") {
-    checkGuess();
+async function loadDirectory(forceRefresh = false) {
+  refreshNowBtn.disabled = true;
+
+  try {
+    const cache = readCache();
+    const isFresh = cache && Date.now() - new Date(cache.savedAt).getTime() < CACHE_MAX_AGE_MS;
+
+    if (!forceRefresh && isFresh) {
+      allTournaments = cache.events;
+      updateLastUpdatedLabel(cache.savedAt);
+    } else {
+      const events = await fetchAllSources();
+      allTournaments = events;
+      writeCache(events);
+      updateLastUpdatedLabel(new Date().toISOString());
+    }
+
+    renderStateFilter(allTournaments);
+    applyFiltersAndRender();
+  } finally {
+    refreshNowBtn.disabled = false;
+  }
+}
+
+stateFilterEl.addEventListener("change", (event) => {
+  selectedState = event.target.value;
+  applyFiltersAndRender();
+});
+
+cityFilterBtn.addEventListener("click", async () => {
+  const query = cityInputEl.value.trim();
+  if (!query) {
+    cityStatusEl.textContent = "Enter a city before applying radius filter.";
+    return;
+  }
+
+  cityFilterBtn.disabled = true;
+  cityStatusEl.textContent = "Locating city...";
+
+  try {
+    selectedCity = await geocodeCity(query);
+    saveSelectedCity();
+    cityStatusEl.textContent = `Filtering within ${MILES_RADIUS} miles of ${selectedCity.label}.`;
+    applyFiltersAndRender();
+  } catch (error) {
+    cityStatusEl.textContent = error.message;
+  } finally {
+    cityFilterBtn.disabled = false;
   }
 });
 
-loadBestScore();
-resetTriviaRound();
-renderPuzzle();
+clearCityFilterBtn.addEventListener("click", () => {
+  selectedCity = null;
+  saveSelectedCity();
+  cityStatusEl.textContent = "City radius filter cleared.";
+  cityInputEl.value = "";
+  applyFiltersAndRender();
+});
+
+refreshNowBtn.addEventListener("click", () => loadDirectory(true));
+
+loadSelectedCity();
+loadDirectory();
