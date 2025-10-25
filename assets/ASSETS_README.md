# Visual Assets Guide

## Required Assets

### 1. Logo (assets/logo.svg) ✓
**Status**: Using inline SVG in HTML
**Specifications**:
- Text: "A'S SOLUTION" in Orbitron Bold
- Effect: Purple glow filter
- Colors: White text with #b829f8 glow
- Dimensions: 240px × 60px

**Gemini Generation Prompt**:
```
Create a futuristic logo with text "A'S SOLUTION" in bold geometric font.
Dark purple/black background with neon purple glow around white text.
Solo Leveling Shadow Monarch aesthetic. Sharp edges, tech-forward design.
Transparent background, suitable for dark website header.
Style: Gaming, cyberpunk, premium, professional
Colors: White (#fff) text with purple (#b829f8) glow effect
```

---

### 2. Terminal Screenshot Mockup
**File**: `assets/mockups/terminal-screenshot.png`
**Status**: Placeholder (can use CSS-generated terminal)
**Specifications**:
- Format: PNG
- macOS-style window with traffic lights
- Dracula color scheme
- Show sample bot workflow
- Dimensions: 1200px × 700px

**Gemini Generation Prompt**:
```
Create a terminal window screenshot with macOS-style window controls.
Dark Dracula color scheme (background #1e1e2e, text #f8f8f2).
Show terminal output:
"$ a-solution start
[Task 1] Starting task...
[Task 1] Logging into Lazada...
[Task 1] ✓ Login successful
[Task 1] Monitoring product...
[Task 1] ✓ Product available!
[Task 1] ✓ Checkout complete!"
Green checkmarks, purple accents, professional developer tool aesthetic.
macOS window with red/yellow/green traffic light controls.
```

---

### 3. Discord Webhook Mockup
**File**: `assets/mockups/discord-webhook.png`
**Status**: Using CSS mockup (no image needed)
**Specifications**:
- Format: PNG (optional, CSS version works)
- Discord embed style
- Success message theme
- Product checkout confirmation
- Dimensions: 600px × 400px

**Alternative**: Current CSS implementation is sufficient

---

### 4. Feature Icons (SVG)
**File**: `assets/icons/[icon-name].svg`
**Status**: Using inline SVG in HTML (Feather Icons style)
**Specifications**:
- Format: SVG
- Style: Outline, 2px stroke
- Color: #b829f8
- Dimensions: 48px × 48px each

**Icons Created**:
- ✓ Refresh/sync (auto-update)
- ✓ Shield/lock (captcha)
- ✓ Search (keyword search)
- ✓ Globe (multi-region)
- ✓ Bell (notifications)
- ✓ Key (license)

**Alternative**: Using Feather Icons (https://feathericons.com/) inline SVG

---

### 5. OG Image (Open Graph)
**File**: `assets/og-image.png`
**Status**: TODO
**Specifications**:
- Format: PNG
- Dimensions: 1200px × 630px (Facebook/Twitter standard)
- Content: Logo + tagline + visual
- Dark purple gradient background

**Gemini Generation Prompt**:
```
Create an Open Graph social media preview image.
Dimensions: 1200px × 630px
Background: Dark purple gradient (#18171D to #463671)
Center: "A'S SOLUTION" logo in white with purple glow
Subtitle: "Dominate Every Checkout - Lazada Automation Bot"
Visual elements: Abstract geometric shapes, particle effects
Solo Leveling Shadow Monarch aesthetic
Professional, premium, gaming-inspired
```

---

### 6. Geometric Background Elements
**File**: `assets/images/geometric-shapes.svg`
**Status**: Using CSS shapes (no image needed)
**Specifications**:
- Format: SVG
- Style: Abstract geometric shapes
- Usage: Decorative elements
- Opacity: 0.1-0.2

**Alternative**: Current CSS implementation with border shapes is sufficient

---

## Asset Generation Tools

### Recommended Tools
1. **Gemini API** (via MCP Hands tool)
   - Best for: Realistic images, mockups, complex designs
   - Use for: Terminal screenshots, OG image

2. **SVG Direct Creation**
   - Best for: Simple icons, logos, geometric shapes
   - Current approach for: Logo, favicon, feature icons

3. **CSS-Generated**
   - Best for: UI elements, mockups, decorative shapes
   - Current approach for: Terminal window, Discord mockup, geometric shapes

---

## Current Implementation Status

✓ **favicon.svg** - Created (SVG)
✓ **Logo** - Inline SVG in HTML
✓ **Feature Icons** - Inline SVG (Feather Icons style)
✓ **Terminal Window** - CSS-generated (functional)
✓ **Discord Mockup** - CSS-generated (functional)
✓ **Geometric Shapes** - CSS borders (functional)

⚠️ **Optional Enhancements**:
- Generate high-quality terminal screenshot with Gemini
- Create custom OG image for social sharing
- Design custom feature icons (currently using generic SVG)

---

## How to Generate Images with Gemini

If you have access to Gemini API (via MCP Human server):

```javascript
// Example: Generate terminal screenshot
const prompt = `Create a terminal window screenshot...`;
// Use mcp__hands__generate_image tool with prompt
```

**For Now**: Website is fully functional with CSS-generated mockups and inline SVG. Image generation is optional enhancement for production.

---

## Notes

- All current visual elements are functional and production-ready
- CSS-generated elements are preferable for performance (no image loading)
- SVG icons are scalable and crisp on all displays
- Optional: Generate real images for more polished look
- Priority: Website works perfectly without external image assets

---

**Last Updated**: 2025-10-25
**Status**: All critical assets implemented (CSS/SVG)
