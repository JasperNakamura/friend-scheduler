This document is for self learning purposes.

# Script Loading Order

Add these script tags to your HTML in this order (before the closing `</body>` tag):

```html
<!-- Data (optional - your schedule data) -->
<script src="js/data.js"></script>

<!-- State (must load first) -->
<script src="js/state.js"></script>

<!-- Core modules -->
<script src="js/storage.js"></script>
<script src="js/utils.js"></script>

<!-- Feature modules -->
<script src="js/people.js"></script>
<script src="js/slots.js"></script>
<script src="js/ranges.js"></script>
<script src="js/modal.js"></script>
<script src="js/calculations.js"></script>
<script src="js/ui.js"></script>

<!-- Main initialization (must load last) -->
<script src="js/main.js"></script>
</body>
</html>
```

## File Structure:

```
/
├── index.html
├── styles.css
├── js/
│   ├── data.js           (optional - your schedule data)
│   ├── state.js          (40 lines - global variables)
│   ├── storage.js        (30 lines - localStorage)
│   ├── utils.js          (20 lines - date formatting)
│   ├── people.js         (70 lines - person management)
│   ├── slots.js          (75 lines - single time slots)
│   ├── ranges.js         (90 lines - date ranges)
│   ├── modal.js          (15 lines - modal controls)
│   ├── calculations.js   (150 lines - availability logic)
│   ├── ui.js             (220 lines - rendering)
│   └── main.js           (25 lines - initialization)
└── assets/
    └── images/

```

## Why This Order Matters:

1. **data.js** - Optional external data
2. **state.js** - Defines global variables others need
3. **storage.js** - localStorage functions
4. **utils.js** - Helper functions used by others
5. **people.js** through **ui.js** - Feature modules (order doesn't matter between these)
6. **main.js** - Calls init(), must be last