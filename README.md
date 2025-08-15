# TikTok Multiviewer

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-blue?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/CiaranMcAleer/Tiktok-Multiviewer)

---

**Multiviewer grid webapp for TikTok Live, YouTube, TrafficWatchNI cameras, websites, and more!**

---

Next.js-based multiviewer grid webapp for TikTok Live. Modular and extendable to enable widgets for new providers to be easily added. The web-app features a sharing function where b64 can be used to encode a config into the link and share with others, enabling watchparty experiences.


![image](https://github.com/user-attachments/assets/47f504b1-6724-4d8b-93fa-cbd735c89919)

> **Note:** Due to platform limitations, TikTok Live links will be opened in a popup window.

![image](https://github.com/user-attachments/assets/1fe3a478-57b6-49b9-9310-8b190cd25697)

## 🧩 Widget Types
- **TikTok Live** (popup)
- **YouTube**
- **Twitch**
- **TrafficWatch NI** (auto-refreshing)
- **Website Embeds**
- **World Time Clocks**
- **Leaflet JS Maps** (with geolocation)
- **RSS Feeds**
- **Weather**
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
2. **Share:** Click 'Share' to get a link to your current layout(Link contains b64 encoding of your config)
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

## 📄 License
MIT — Ciaran McAleer

---
