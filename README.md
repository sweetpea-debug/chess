diff --git a/README.md b/README.md
index 7f3e60533960835faf859d0690fb1c84a559e46e..af46b4e8286b304ff841a36f17baf5be38d989d3 100644
--- a/README.md
+++ b/README.md
@@ -1,20 +1,24 @@
-# Trivia & Puzzles Website
+# Ultimate U.S. Chess Tournament Directory
 
-A lightweight static website with two mini-games:
+A static web app that aggregates major U.S. tournament sources into a single directory with daily refresh.
 
-- **Daily Trivia**
-  - Multiple-choice questions
-  - Per-question answer locking and highlighted correct answer
-  - Running score + best score persisted in browser storage
-- **Word Unscramble Puzzle**
-  - Random scrambled words
-  - Attempt counter
-  - Optional hint button
+## Features
+
+- Aggregates tournaments from a configurable source catalog, currently including:
+  - US Chess Federation TLA page
+  - Chess-Results.com
+  - Continental Chess Association
+  - Charlotte Chess Center
+- Daily refresh using local cache invalidation every 24 hours
+- Manual "Refresh now" option
+- Filter by U.S. state
+- Radius filter for events within 100 miles of a city (geocoded with Nominatim)
+- Clickable cards that open a details page with key links and event data
 
 ## Run locally
 
 ```bash
 python3 -m http.server 8000
 ```
 
 Then open <http://localhost:8000>.
