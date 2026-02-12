const detailsNameEl = document.getElementById("details-name");
const detailsDateEl = document.getElementById("details-date");
const detailsLocationEl = document.getElementById("details-location");
const detailsFormatEl = document.getElementById("details-format");
const detailsSourceEl = document.getElementById("details-source");
const detailsDistanceEl = document.getElementById("details-distance");
const detailsDescriptionEl = document.getElementById("details-description");
const detailsLinksEl = document.getElementById("details-links");

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const format = { month: "short", day: "numeric", year: "numeric" };

  if (startDate === endDate) {
    return start.toLocaleDateString(undefined, format);
  }

  return `${start.toLocaleDateString(undefined, format)} - ${end.toLocaleDateString(undefined, format)}`;
}

function addLink(label, href) {
  if (!href) {
    return;
  }

  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  li.appendChild(link);
  detailsLinksEl.appendChild(li);
}

function renderDetails() {
  const raw = localStorage.getItem("selected-tournament");

  if (!raw) {
    detailsNameEl.textContent = "Tournament not found";
    detailsDescriptionEl.textContent = "Go back to the directory and pick an event card first.";
    return;
  }

  const tournament = JSON.parse(raw);

  detailsNameEl.textContent = tournament.name;
  detailsDateEl.textContent = `Dates: ${formatDateRange(tournament.startDate, tournament.endDate)}`;
  detailsLocationEl.textContent = `Location: ${tournament.venue}, ${tournament.city}, ${tournament.state}`;
  detailsFormatEl.textContent = `Format: ${tournament.format}`;
  detailsSourceEl.textContent = `Source: ${tournament.sourceName}`;
  detailsDistanceEl.textContent = tournament.distanceMiles
    ? `Distance from city filter center: ${tournament.distanceMiles.toFixed(1)} miles`
    : "";
  detailsDescriptionEl.textContent = tournament.description;

  addLink("Source page", tournament.sourceUrl);
  addLink("Registration", tournament.registrationUrl);
  addLink("Event details", tournament.detailsUrl);
}

renderDetails();
