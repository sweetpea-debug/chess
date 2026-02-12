diff --git a/README.md b/README.md
index 7f3e60533960835faf859d0690fb1c84a559e46e..815923428ac5d99e848d737cddb2158459380539 100644
--- a/README.md
+++ b/README.md
@@ -1,20 +1,33 @@
-# Trivia & Puzzles Website
+# US Chess Tournament Atlas
 
-A lightweight static website with two mini-games:
+A standalone front-end project for discovering U.S. chess tournaments.
 
-- **Daily Trivia**
-  - Multiple-choice questions
-  - Per-question answer locking and highlighted correct answer
-  - Running score + best score persisted in browser storage
-- **Word Unscramble Puzzle**
-  - Random scrambled words
-  - Attempt counter
-  - Optional hint button
+## What this project does
+
+- Displays tournaments in clickable cards.
+- Opens a dedicated details page with key links.
+- Filters by U.S. state.
+- Filters by events within 100 miles of a city.
+- Caches data and refreshes every 24 hours (with manual refresh).
+- Lists and links tournament sources.
+
+## Files
+
+- `index.html`: Directory UI
+- `app.js`: Directory logic and filters
+- `details.html`: Event details screen
+- `details.js`: Event detail rendering
+- `data.js`: Source catalog + seed events
+- `utils.js`: Shared utilities
+- `styles.css`: Styling
 
 ## Run locally
 
 ```bash
 python3 -m http.server 8000
 ```
 
-Then open <http://localhost:8000>.
+Then open:
+
+- `http://localhost:8000/index.html`
+

