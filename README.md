# A's Solution - Website

Production-ready marketing website for A's Solution Lazada automation bot. Inspired by Solo Leveling's "Shadow Monarch" aesthetic with dark purple theme, Three.js particle effects, and modern gaming UI.

---

## Quick Start

### 1. Open the Website

Simply open `index.html` in a modern web browser:

```bash
# Direct open
open index.html

# Or use a local server (recommended)
python -m http.server 8000
# Then visit: http://localhost:8000
```

### 2. Deploy

**Static Hosting Options**:

#### Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages
```bash
# Push to GitHub
git add .
git commit -m "Add website"
git push origin main

# Enable GitHub Pages in repository settings
# Set source to main branch / root
```

#### Traditional Web Hosting
- Upload all files via FTP/SFTP
- Ensure index.html is in root directory
- Configure .htaccess if needed (Apache)

---

## File Structure

```
website/
├── index.html              # Main HTML file (single-page)
├── css/
│   └── styles.css         # All styles (design system)
├── js/
│   ├── app.js             # Main interactions & animations
│   └── particles.js       # Three.js particle background
├── assets/
│   ├── favicon.svg        # Browser favicon
│   ├── icons/             # Feature icons (inline SVG used)
│   ├── images/            # Placeholder for images
│   ├── mockups/           # Placeholder for mockups
│   └── ASSETS_README.md   # Asset generation guide
└── README.md              # This file
```

---

## Features

### Visual Design
- ✅ Solo Leveling "Shadow Monarch" theme
- ✅ Dark purple/violet color palette (#18171D, #463671, #b829f8)
- ✅ Three.js animated particle background
- ✅ Geometric shapes and purple glow effects
- ✅ Responsive mobile-first design

### Sections
- ✅ Hero with dramatic entrance animation
- ✅ Terminal showcase with typing animation
- ✅ Feature grid (6 features)
- ✅ Supported regions (6 countries)
- ✅ Success metrics with animated counters
- ✅ Discord webhook mockup
- ✅ Single-tier pricing ($69/mo)
- ✅ FAQ accordion

### Interactions
- ✅ Smooth scroll navigation
- ✅ Terminal typing animation (auto-loop)
- ✅ FAQ accordion (expand/collapse)
- ✅ Scroll reveal animations
- ✅ Counter animations
- ✅ Button hover effects
- ✅ Mouse parallax (subtle)

### Performance
- ✅ Optimized Three.js particles (1800 on desktop, 600 on mobile)
- ✅ Lazy-loaded scripts (defer)
- ✅ CSS-generated mockups (no images)
- ✅ Inline SVG icons (no requests)
- ✅ Reduced motion support
- ✅ Accessibility (WCAG 2.1 AA)

---

## Browser Support

- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+
- ✅ Mobile Chrome 90+

**Note**: Three.js requires WebGL support. Fallback to static gradient on unsupported devices.

---

## Customization

### Update Content

**Edit HTML** (`index.html`):
- Hero title/subtitle
- Feature descriptions
- Pricing amount
- FAQ questions/answers
- Footer links

**Edit Links**:
- Search for `https://whop.com` and replace with your Whop URL
- Search for `https://discord.gg/yourdiscord` and replace with your Discord

### Update Branding

**Colors** (`css/styles.css`):
```css
:root {
    --color-shadow-black: #18171D;      /* Main background */
    --color-monarch-purple-dark: #463671; /* Cards, surfaces */
    --color-neon-purple: #b829f8;       /* Accents, CTAs */
    --color-ethereal-light: #EBBAF2;    /* Text highlights */
}
```

**Fonts** (`index.html` line 23-24):
```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### Update Terminal Animation

**Edit Terminal Lines** (`js/app.js` line 14-23):
```javascript
const terminalLines = [
    { text: '$ a-solution start', delay: 500, color: 'info' },
    { text: '[Task 1] Your custom text...', delay: 800, color: 'default' },
    // Add more lines...
];
```

### Adjust Particle Settings

**Edit Particle Config** (`js/particles.js` line 15-22):
```javascript
const CONFIG = {
    particleCount: 1800,       // Adjust count
    particleSize: 2.5,         // Adjust size
    particleColor: 0xb829f8,   // Change color
    particleOpacity: 0.6,      // Adjust opacity
    particleSpeed: 0.2,        // Adjust speed
    mouseInfluence: 0.15,      // Mouse parallax
};
```

---

## Performance Optimization

### Reduce Particle Count
For better performance on low-end devices:

```javascript
// js/particles.js line 26-32
function getParticleCount() {
    const width = window.innerWidth;
    if (width < 480) return 400;  // Reduced from 600
    if (width < 768) return 800;  // Reduced from 1000
    if (width < 1024) return 1000; // Reduced from 1200
    return 1500; // Reduced from 1800
}
```

### Disable Particles Entirely
Comment out in `index.html`:
```html
<!-- <canvas id="particles-canvas" aria-hidden="true"></canvas> -->
<!-- <script src="js/particles.js" defer></script> -->
```

### Optimize Images
If adding custom images:
```bash
# Convert to WebP
cwebp input.png -q 80 -o output.webp

# Or use online tools: squoosh.app
```

---

## SEO Optimization

### Update Meta Tags

**Edit `index.html` lines 6-19**:
```html
<meta name="description" content="Your custom description">
<meta name="keywords" content="your, keywords, here">
<meta property="og:title" content="Your Title">
<meta property="og:description" content="Your Description">
```

### Add Structured Data

Add before closing `</head>`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "A's Solution Lazada Bot",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "69.00",
    "priceCurrency": "USD"
  }
}
</script>
```

### Create sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2025-10-25</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## Analytics Setup

### Google Analytics 4

Add before closing `</head>`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Facebook Pixel

Add before closing `</head>`:
```html
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

---

## Accessibility

### Keyboard Navigation
- ✅ Tab through all interactive elements
- ✅ Enter/Space to activate buttons
- ✅ Arrow keys for FAQ navigation

### Screen Reader Support
- ✅ Semantic HTML5 elements
- ✅ ARIA labels on icon buttons
- ✅ Alt text on images
- ✅ Skip to content link

### Test Tools
- [WAVE](https://wave.webaim.org/) - Browser extension
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- Lighthouse (Chrome DevTools)

---

## Testing

### Manual Testing Checklist

**Visual**
- [ ] All colors render correctly
- [ ] Typography is readable (Vietnamese diacritics)
- [ ] Animations are smooth (60fps)
- [ ] Particles don't lag on mobile

**Functional**
- [ ] All links work
- [ ] CTAs lead to correct destinations
- [ ] FAQ accordion expands/collapses
- [ ] Terminal animation loops
- [ ] Smooth scroll works

**Responsive**
- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] Desktop 1920x1080

**Performance**
- [ ] Lighthouse score 90+ (Performance)
- [ ] First Contentful Paint < 1.5s
- [ ] No console errors

---

## Troubleshooting

### Particles Not Showing
1. Check browser console for errors
2. Verify Three.js CDN is loading
3. Check WebGL support: https://get.webgl.org/
4. Try disabling browser extensions

### Terminal Not Typing
1. Check browser console for errors
2. Verify `terminal-output` element exists
3. Check if script is deferred properly

### Scroll Animations Not Working
1. Check IntersectionObserver support
2. Verify `.reveal-on-scroll` classes exist
3. Check if `prefers-reduced-motion` is enabled

### Performance Issues
1. Reduce particle count (see Performance section)
2. Disable Three.js particles
3. Check network tab for slow requests
4. Optimize/compress images

---

## License

Copyright © 2025 A's Solution. All rights reserved.

Educational use only. Users responsible for compliance with applicable laws and terms of service.

---

## Support

- **Documentation**: See `../docs/` folder
- **Design System**: `../docs/design-guidelines.md`
- **Implementation Plan**: `../plans/251025-design-solo-leveling-website.md`

---

## Credits

**Design Inspiration**: Solo Leveling (Shadow Monarch aesthetic)
**Icons**: Feather Icons style (inline SVG)
**Fonts**: Google Fonts (Orbitron, Inter, JetBrains Mono)
**3D Library**: Three.js (r128)
**Color Scheme**: Custom (Shadow Monarch palette)

---

**Version**: 1.0.0
**Last Updated**: 2025-10-25
**Status**: Production Ready ✓
