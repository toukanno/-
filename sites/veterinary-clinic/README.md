# さくら動物病院 - Website

A modern, responsive Japanese veterinary clinic website for さくら動物病院 (Sakura Animal Hospital).

## Overview

A single-page website built with semantic HTML5 and modern CSS. No external JavaScript frameworks or CSS libraries are required.

## Files

| File | Description |
|------|-------------|
| `index.html` | Main HTML page with all content sections |
| `style.css` | Complete stylesheet with CSS variables, responsive design |
| `README.md` | This file |

## Sections

- **Header** - Fixed navigation with hamburger menu for mobile (ホーム, 診療案内, 院長紹介, 施設紹介, アクセス)
- **Hero** - Full-viewport gradient banner (#4CAF50 to #81C784)
- **Services (診療案内)** - 6 service cards: 一般診療, 予防接種, 健康診断, 手術, トリミング, ペットホテル
- **Doctor (院長紹介)** - Profile section with credentials
- **Facility (施設紹介)** - Photo grid of clinic facilities
- **Hours (診療時間)** - Weekly schedule table
- **Emergency (緊急)** - After-hours contact information
- **Access (アクセス)** - Embedded Google Map and address details
- **Contact (お問い合わせ)** - Phone number and inquiry form
- **Footer** - Site links, hours summary, copyright

## Features

- CSS custom properties (variables) for theming
- Mobile-first responsive design with breakpoints at 480px, 768px, and 1024px
- Smooth scroll navigation with offset for fixed header
- Scroll-triggered entrance animations via IntersectionObserver
- Hamburger menu for mobile navigation
- Back-to-top button
- Google Fonts (Noto Sans JP)
- No build tools or dependencies required

## Usage

Open `index.html` in any modern browser. No server or build step is needed.
