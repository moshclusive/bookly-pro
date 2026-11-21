# Bookly Pro — New Tab Dashboard & Bookmark Manager

> A Chrome extension (Manifest V3, v4.0.25) that replaces the New Tab page with a productivity dashboard: a folder-based bookmark manager, live clock and quotes, wallpaper, multi-engine search, news, sports, weather, and an optional Google Sheets backup.

## ✨ Features

- **Bookmark manager** — Folders and subfolders, pin/favorite, tags, notes, folder passwords, custom icons, and drag-to-reorder. Import/export your collection as JSON.
- **New Tab dashboard** — Greeting with live clock and date, 28 motivational quotes, and wallpaper from the gallery, a solid color, a URL, or your own upload (with opacity and blur controls).
- **Search** — One search box with Google suggestions, plus quick search across Google, Yandex, DuckDuckGo, Bing, YouTube, Pinterest, Behance, ChatGPT, Gemini, and stock sites (Freepik, Adobe Stock, Shutterstock, and more).
- **Widgets** — Trending news (Google News headlines), Sports Radar for football and cricket (ESPN public scoreboards), a Google Calendar month quick-view (local grid only — it does not read your account events), calculator, weather via Open-Meteo for a location you pick, voice typing, and Search by Image (Google Lens).
- **AI speed dial** — One-click access to ChatGPT, Gemini, Copilot, Kimi, DeepSeek, and Qwen.
- **Google Sheets backup & 2-way sync (optional)** — Deploy the included Apps Script as your own web app and paste your own URL into Settings → Backup & Sync. Your bookmarks, folders, tags, notes, favorites, quick-access dock, and To Do tasks sync to your own Sheet. Each user uses their own Sheet — there is no shared server.
- **Windows Shutdown Timer (optional)** — Schedule or cancel a Windows shutdown (1 minute to 24 hours) from the extension, using the small C# native-messaging host in `Shutdown Helper/`. Run `Install-BooklyShutdownHost.bat` once to build and register it (it compiles the `.cs` on your machine).
- **Shortcuts** — `Ctrl+B` add bookmark, `Ctrl+F` search bookmarks, `Ctrl+Shift+Y` open a fresh Bookly tab.

> **Note:** By default, the extension redirects `facebook.com` to the Pinterest home feed (`redirect.js`). Turn it off in Settings if you do not want that.

## 📥 Install

There is no installer — this is a Chrome extension you load unpacked:

1. Download this repository (Code → Download ZIP) and extract it, or clone it:
   ```bash
   git clone https://github.com/moshclusive/bookly-pro.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `bookly-pro` folder.
5. Open a new tab — Bookly Pro is your New Tab page.

To use the Shutdown Timer on Windows, also run `Shutdown Helper/Install-BooklyShutdownHost.bat` once (requires .NET Framework's `csc` compiler).

## 🖥️ How to Use

1. **Bookmarks:** Click a folder in the sidebar, or press `Ctrl+B` on any page to save it. Right-click a bookmark for pin, favorite, tag, and note options.
2. **Import/export:** Settings → Backup & Sync → Import/Export. `Backup.json` in this repo is **demo data** (13 generic public links) showing the format — import it to try the manager, then replace it with your own export.
3. **Sheets sync:** Follow the Bengali guide `BOOKLY PRO GOOGLE SHEET BACKUP GUIDE.html` (English summary: create a Google Sheet, paste the included `Bookly_Backup_AppScript.gs` into Extensions → Apps Script, deploy as a web app, and paste your own URL into Settings → Backup & Sync).
4. **Wallpaper & quotes:** Settings → Appearance for wallpaper, and `quotes.txt` holds the quote pack.

## 🔒 Privacy

- Your bookmarks, folder passwords, and settings stay in your own Chrome storage. Folder passwords are local-only and are not synced.
- Nothing is sent to any server run by the author. The optional Sheets sync uses **your own** Google Sheet and Apps Script deployment.
- The dashboard reads public feeds only: Google News RSS, ESPN public scoreboards, Open-Meteo weather, and Google search suggestions. No account is needed for any of them.

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to fork, fix, and open a pull request.

## 📄 License

Source-available under the **PolyForm Noncommercial License 1.0.0** — free for personal, non-commercial use. You may use it, share it, and contribute improvements, but you may **not** sell it or claim it as your own. See [LICENSE](LICENSE).

## 👤 Author

**Moshiur Rahman ([@moshclusive](https://github.com/moshclusive))** — Graphic Designer, Fiverr Level 2 Seller, tool builder.

- Fiverr: https://www.fiverr.com/moshclusive
- LinkedIn: https://www.linkedin.com/in/moshclusive/
