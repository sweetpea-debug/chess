import { SOURCE_CATALOG } from "./data.js";
import { prettyDateRange } from "./utils.js";

const dName = document.getElementById("d-name");
const dDates = document.getElementById("d-dates");
const dLocation = document.getElementById("d-location");
const dFormat = document.getElementById("d-format");
const dSource = document.getElementById("d-source");
const dDistance = document.getElementById("d-distance");
const dLinks = document.getElementById("d-links");
const dSummary = document.getElementById("d-summary");

function sourceName(sourceId) {
  return SOURCE_CATALOG.find((source) => source.id === sourceId)?.name ?? "Unknown source";
}

function appendLink(label, url) {
  if (!url) {
    return;
  }

  const li = document.createElement("li");
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.textContent = label;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  li.appendChild(anchor);
  dLinks.appendChild(li);
}

function renderMissing() {
  dName.textContent = "No tournament selected";
  dSummary.textContent = "Return to the directory and click an event card to load details.";
}

function renderTournament(event) {
  dName.textContent = event.name;
  dDates.textContent = `Dates: ${prettyDateRange(event.startDate, event.endDate)}`;
  dLocation.textContent = `Location: ${event.venue}, ${event.city}, ${event.state}`;
  dFormat.textContent = `Format: ${event.format}`;
  dSource.textContent = `Source: ${sourceName(event.sourceId)}`;

  if (Number.isFinite(event.distance)) {
    dDistance.textContent = `Distance from search city: ${event.distance.toFixed(1)} miles`;
  }

  dSummary.textContent = event.summary;
  appendLink("Organizer/source page", event.sourceUrl);
  appendLink("Registration", event.registrationUrl);
  appendLink("Event details", event.detailsUrl);
}

function init() {
  const raw = localStorage.getItem("atlas-selected-event");

  if (!raw) {
    renderMissing();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    renderTournament(parsed);
  } catch {
    renderMissing();
  }
}

init();
