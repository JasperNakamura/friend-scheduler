# CSS Loading Order

Add these `<link>` tags to your HTML `<head>` in this order:

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>When can we hang?</title>
    
    <!-- CSS Files - Load in this order -->
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/forms.css">
    <link rel="stylesheet" href="css/buttons.css">
    <link rel="stylesheet" href="css/cards.css">
    <link rel="stylesheet" href="css/indicators.css">
    <link rel="stylesheet" href="css/modal.css">
    <link rel="stylesheet" href="css/results.css">
</head>
```

## CSS File Structure:

```
css/
├── base.css          (~80 lines - reset, typography, layout)
├── forms.css         (~70 lines - input fields)
├── buttons.css       (~150 lines - all buttons)
├── cards.css         (~180 lines - person cards, slots, ranges)
├── indicators.css    (~35 lines - status indicators)
├── modal.css         (~70 lines - modal overlay)
└── results.css       (~65 lines - results display)

Total: ~650 lines split into 7 focused files
```

## Why This Order:

1. **base.css** - Foundation styles first
2. **forms.css** - Form elements
3. **buttons.css** - Button styles
4. **cards.css** - Main UI components
5. **indicators.css** - Status displays
6. **modal.css** - Overlay components
7. **results.css** - Results section

## Alternative: Keep One File

If you prefer simplicity, you can still use the single `styles.css` file (works perfectly fine for this project size).

## Production Build (Optional):

For production, combine all CSS into one file:
```bash
cat css/*.css > dist/styles.min.css
```

Or use a build tool to minify and combine.
