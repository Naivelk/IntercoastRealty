# InterCoast Realty — Developer Handoff
**Project:** intercoast_homepage_v2.html  
**Client:** Celina Landaverde  
**Date:** April 2026  
**Prepared for:** Kevin (developer)

---

## What's in this package

```
intercoast_package/
├── intercoast_homepage_v2.html   ← Complete HTML reference (open in browser)
├── README.md                     ← This file
└── assets/
    ├── celina-portrait.jpg       ← Hero image (blue blazer, portrait crop)
    ├── celina-standing.jpg       ← About/contact section (full body)
    ├── prop-casa-residencial.jpg ← Property: Casa $150K
    ├── prop-terreno-beach.jpg    ← Property: Terreno 2 min playa $198K
    ├── prop-terreno-amatal.jpg   ← Property: Terreno El Amatal
    ├── prop-taquillo.jpg         ← Property: Playa Taquillo (wide card)
    └── prop-san-vicente.jpg      ← Property: San Vicente 249 manzanas
```

Open `intercoast_homepage_v2.html` directly in any browser to see the full design.  
The HTML has images embedded as base64 — the `/assets/` folder contains the originals for Framer.

---

## Brand Identity

> ⚠️ This is a SEPARATE brand from Costa Hermana. Do NOT share components, color tokens, or fonts between the two Framer projects.

### Colors

| Token         | Hex       | Usage                                      |
|---------------|-----------|--------------------------------------------|
| Navy          | `#0B1C2E` | Primary background, nav, footer, buttons   |
| Navy Mid      | `#122540` | Hover states, about section background     |
| Navy Light    | `#1A3352` | Card hover states                          |
| Navy Faint    | `#E8EDF3` | Feature chips, light backgrounds           |
| Gold          | `#C9952A` | Primary accent, tags, section labels, CTAs |
| Gold Light    | `#E8B84B` | Hero headings, gradient accent             |
| Gold Pale     | `#F5E9CC` | Light gold tint                            |
| Off White     | `#F8F6F2` | Page background                            |
| White         | `#FFFFFF` | Card backgrounds                           |
| Text          | `#0B1C2E` | Body text                                  |
| Text Mid      | `#3A4E63` | Secondary text                             |
| Text Muted    | `#7A8FA3` | Descriptions, labels                       |

### Typography

| Use              | Font        | Weight(s)         | Notes                          |
|------------------|-------------|-------------------|--------------------------------|
| Nav, body, tags  | Montserrat  | 400, 500, 600, 700, 800 | Google Fonts              |
| Headings, hero   | Lora        | 400, 600 + italic | Google Fonts, serif            |

Google Fonts link:
```
https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap
```

---

## Page Structure (section order)

1. **Nav** — Fixed, transparent → navy on scroll. Logo left, links + EN/ES toggle right.
2. **Hero** — Split 50/50. Left: headline, body, 2 CTAs, stats bar. Right: Celina portrait full height.
3. **Trust Strip** — Gold background. 4 items: CA DRE Licensed, Bilingual, La Libertad, NAR member.
4. **About** — White bg. Left: text + credential box. Right: Celina standing photo + "20+ Years" accent card.
5. **Properties** — Off-white bg. 3-column grid. Cards with photo, tag, location, features, price, WhatsApp button.
6. **Why El Salvador** — Navy bg. 4-stat row + 3 reason cards.
7. **Contact** — White bg. Left: headline + WhatsApp + call buttons. Right: Celina portrait + CA DRE gold box.
8. **Footer** — Navy. Brand name left, legal disclaimer right.

---

## Default Language

**Spanish first.** The page loads in Spanish by default.  
The EN/ES toggle in the nav switches to English.

Implementation: `<body>` has no class by default (= Spanish). Clicking toggle adds class `en` to `<body>`.
- Elements with `data-es` show by default
- Elements with `data-en` are hidden by default (`display: none`)
- When `body.en`: `data-es` hidden, `data-en` shown

---

## Properties — Full Data

### 1. Casa en Venta — Residencial Privado
- **Type:** Casa en Venta / House for Sale
- **Location:** Residencial Privado, El Salvador
- **Price:** $150,000
- **Features:** 203 m², 3 bedrooms, 2 bathrooms, A/C, BBQ, parking ×3
- **Image:** `prop-casa-residencial.jpg`
- **WhatsApp:** `me interesa la casa en Residencial Privado de $150,000`

### 2. Terreno — 2 Minutos de la Playa
- **Type:** Terreno en Venta / Land for Sale
- **Location:** La Libertad
- **Price:** $198,000 (all credits accepted)
- **Features:** 2 min to beach, tropical, development potential
- **Image:** `prop-terreno-beach.jpg`
- **WhatsApp:** `me interesa el terreno a 2 minutos de la playa de $198,000`

### 3. Terreno Exclusivo — Zona El Amatal
- **Type:** Terreno Exclusivo / Exclusive Land
- **Location:** Zona El Amatal, La Libertad
- **Price:** Consultar / Price on inquiry
- **Features:** 280 m², 4 min to beach, title ready (escritura lista), safe zone
- **Image:** `prop-terreno-amatal.jpg`
- **WhatsApp:** `me interesa el terreno exclusivo en Zona El Amatal`

### 4. Terreno Premium — Playa Taquillo ← WIDE CARD (spans 2 columns)
- **Type:** Terreno Premium / Premium Land
- **Location:** Playa Taquillo, La Libertad
- **Price:** Price per manzana / Precio por manzana
- **Features:** 4.5 manzanas, oceanfront, vehicle access, utilities, sold per manzana
- **Image:** `prop-taquillo.jpg`
- **WhatsApp:** `me interesa el terreno premium en Playa Taquillo, La Libertad`

### 5. San Vicente — 249 Manzanas
- **Type:** Gran Escala / Large Scale Investment
- **Location:** San Vicente, El Salvador
- **Price:** Investor inquiry / Precio al consultar
- **Features:** 249 manzanas, solar/mining potential, sold in entirety only
- **Image:** `prop-san-vicente.jpg`
- **WhatsApp:** `me interesa el terreno de 249 manzanas en San Vicente`

---

## WhatsApp Configuration

**Number:** `+17146121383`  
**Base URL:** `https://wa.me/17146121383?text=`  
All message text should be URL-encoded.

Pre-populated message template: `Hola Celina, [property-specific message]. ¿Podemos hablar?`

---

## Contact Info

| Item | Value |
|------|-------|
| Phone / WhatsApp | +1 (714) 612-1383 |
| Email | Landaverde568@gmail.com |
| CA DRE License | #01723218 |
| Broker | San Fernando Realty Inc. |
| NAR | #193510309 |

---

## Legal / Compliance (must appear on site)

Footer and contact section must include:

> Celina Landaverde · CA DRE #01723218 · Licensed Salesperson under San Fernando Realty Inc. · NAR #193510309  
> This site is for informational purposes and does not constitute a binding offer to sell real estate.

Spanish version:
> Celina Landaverde · CA DRE #01723218 · Agente licenciada bajo San Fernando Realty Inc. · Miembro NAR #193510309  
> Este sitio es solo informativo y no constituye una oferta vinculante de venta de bienes raíces.

---

## Nav Scroll Behavior

On load: nav is transparent (works over dark hero).  
On scroll (>40px): nav transitions to `rgba(11,28,46,0.95)` with `backdrop-filter: blur(14px)`.

```javascript
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});
```

---

## Scroll Animations

Elements with class `.fade-up` animate in on scroll:
- Start: `opacity: 0; transform: translateY(32px)`
- End: `opacity: 1; transform: none`
- Trigger: IntersectionObserver at threshold 0.1

---

## Notes for Framer

- Do not use the Costa Hermana Framer project as a base — start fresh
- Montserrat and Lora are both available in Framer's font picker
- The properties grid is 3 columns desktop, 2 tablet, 1 mobile
- Playa Taquillo card spans 2 columns on desktop and tablet
- The hero is a 2-column grid on desktop; on mobile the Celina photo is hidden and content goes full width
- All property card photos should use `object-fit: cover` with `object-position: top center`

