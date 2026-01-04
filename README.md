# slack_for_life

Welcome to slack_for_life!

This repository was automatically initialized by the Slack Bot.

---
*Created automatically by Slack Bot 🤖*

---

## CineScope TSPDT Dashboard Demo

A self-contained interactive mock for the Internet Movie Analysis system now lives in `mockups/tspdt-dashboard-demo.html`.  
To preview the UI locally:

1. Clone the repository (or fetch latest changes).
2. Open `mockups/tspdt-dashboard-demo.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Interact with the filters, review summary insights, log watched films, and inspect the recommendation engine output.

No build tooling or server setup is required for the demo preview.

### Embedded Smoke Tests

The dashboard executes six automated smoke checks on load to ensure key interactions continue working:

- Country, genre, decade, and director filters return expected result counts.
- Recommendations always exclude already-watched titles.
- Predicted watch totals never fall below the number of films logged by the user.

Test outcomes are rendered inside the “Embedded smoke tests” panel within the demo UI for quick verification.