# TikTok Multiviewer

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-blue?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-repo/Tiktok-Multiviewer)

---

**Multiviewer grid for TikTok Live, YouTube, traffic cameras, websites, and more!**

---

Next.js-based multiviewer grid for TikTok Live. Also supports YouTube, TrafficWatch NI, website embeds, world clocks, maps, and notes. Modular and extendable.

![image](https://github.com/user-attachments/assets/47f504b1-6724-4d8b-93fa-cbd735c89919)

## 🚀 Features

- **Multi-platform:** Watch TikTok Live, YouTube, traffic cameras, and more in a single grid.
- **Drag & Drop:** Arrange widgets freely with a modern drag-and-drop interface.
- **Modular Widgets:** Add maps, world clocks, notes, and website embeds.
- **Share Layouts:** Share your custom grid with a single base64-encoded link.
- **Persistent:** Layouts and notes are saved and can be shared or restored.
- **Dark/Light Theme:** Beautiful, responsive UI with theme toggle.
- **Easy to Extend:** Add your own widgets with minimal code.

> **Note:** Due to platform limitations, TikTok Live links must be opened in a popup window.

![image](https://github.com/user-attachments/assets/1fe3a478-57b6-49b9-9310-8b190cd25697)

## 🧩 Widget Types
- **TikTok Live** (popup)
- **YouTube**
- **TrafficWatch NI** (auto-refreshing)
- **Website Embeds**
- **World Time Clocks**
- **Maps** (with geolocation)
- **Notes**

## ✨ How to Use

### Adding Content
- **Paste URLs:** TikTok, YouTube, or traffic camera links automatically create appropriate widgets
- **Use Prefixes:** For clarity, use `tw:username`, `yt:channel`, or `@tiktokuser` 
- **Add Utilities:** Use the menu to add maps, clocks, websites, or notes

### Input Examples
- `https://www.tiktok.com/@user` → TikTok widget
- `tw:ninja` → Twitch channel widget  
- `yt:mkbhd` → YouTube channel widget
- `@charlidamelio` → TikTok widget
- `ninja` → Shows disambiguation dialog

### Layout Management
1. **Arrange:** Drag and drop widgets to organize your grid
2. **Share:** Click 'Share' to get a link to your current layout
3. **Restore:** Paste a shared layout link to restore a grid

## 🛠️ Local Development
```bash
pnpm install
pnpm dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## ☁️ Deploy
- **Vercel:** Click the Deploy button above or run `vercel` in your project directory.
- **Netlify:** Configure as a Next.js app, or use your preferred static host.

## 📚 Documentation

- **[Documentation Index](docs/README.md)** - Complete documentation overview and navigation
- **[Technical Documentation](docs/TECHNICAL.md)** - Architecture, components, and implementation details
- **[Username Disambiguation](docs/USERNAME_DISAMBIGUATION.md)** - How the input system works
- **[Testing Guide](docs/TESTING.md)** - Testing setup, running tests, and contributing
- **[Changelog](docs/CHANGELOG.md)** - Version history and recent improvements

## 📄 License
MIT — Ciaran McAleer

---
