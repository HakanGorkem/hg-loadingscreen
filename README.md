# HG Loading Screen

A configurable FiveM loading screen with a cinematic HUD-style interface, a 10-language selector, an auto-syncing Discord staff list, an announcement slider and an in-game updates panel.

![Version](https://img.shields.io/badge/version-1.3.0-red)

## Features

- **Split console layout** — logo, tagline, social links and an announcement slider on the left; a full-bleed background video or image on the right; a status/progress bar docked at the bottom.
- **10-language interface** — English, Turkish, Spanish, Portuguese, French, German, Russian, Polish, Italian and Arabic out of the box, with a switcher players can use themselves. Your own content (server name, tagline, staff, announcements, changelog) is never auto-translated.
- **Info Center panel** — a single tabbed panel for your staff roster and update notes, so the top-right corner stays uncluttered.
- **Live Discord staff sync (optional)** — automatically pulls your staff list from Discord, sorted by role, with avatars and online/offline status. Falls back to a static list if it's not set up or unreachable.
- **Announcement slider** — an auto-sliding image strip for promos, events or news.
- **Accurate progress bar** — wired to FiveM's real loading events (init functions, data file entries), not a fake timer.
- **Fully config-driven** — everything in this list is controlled from `config.js`; no code editing required for day-to-day use.

## Installation

1. Copy this folder into your server's `resources` directory.
2. Add to your `server.cfg`:
   ```
   ensure hg-loadingscreen
   ```
   (or whatever you name the resource folder)
3. Edit `config.js` to match your server (see below).
4. Replace the files in `assets/` with your own logo, background, music and announcement images — keep the same filenames, or update the paths in `config.js` to match new ones.

## Configuration

All settings live in `config.js`. Every field has an inline comment explaining what it does. A quick overview:

| Section | What it controls |
|---|---|
| `Server` | Name, logo, theme color, background media, music |
| `Links` | Store / Discord / YouTube buttons — leave a URL as `""` to hide that button |
| `Language` | Default language and whether players can switch it themselves |
| `AnnouncementSlider` | Slide interval and the list of images to rotate |
| `ChangelogSyncUrl` / `ChangelogFallback` | Live Discord sync URL (optional) and the static list shown in the Updates tab |
| `StaffSyncUrl` / `StaffFallback` | Live Discord sync URL (optional) and the static fallback list |

Theme color, logo and background accept any file you like — no fixed dimensions are required, but a landscape logo and a 16:9 background tend to look best.

## Optional: Live Discord Sync (Staff & Changelog)

By default the staff list and update notes use the static arrays in `config.js`. If you'd rather have them sync automatically from your Discord server, you can set that up with the included `discord-staff-sync/` bot script — it can pull your staff roster (roles, avatars, online status) and/or your changelog from a dedicated announcements channel. This is entirely optional — skip this section if the static lists are enough for you.

**What you'll need:** a Discord bot application, and a free GitHub account.

1. **Create or reuse a Discord bot** at [discord.com/developers/applications](https://discord.com/developers/applications). Open your bot's **Bot** tab and enable **Server Members Intent**, **Presence Intent**, and **Message Content Intent** (the last one is only needed for changelog sync). Copy the bot token.
2. **Invite the bot** to your server with permission to view members and read message history.
3. **Edit `discord-staff-sync/sync.js`** — at the top of the file, set `GUILD_ID` to your Discord server's ID, fill in `ROLE_HIERARCHY` with your staff role IDs (highest to lowest rank), and set `CHANGELOG_CHANNEL_ID` to your announcements channel's ID (leave it as `''` to skip changelog sync).
4. **Create a GitHub repository** and push this project to it (`git init`, `git add .`, `git commit`, `git remote add origin <your-repo-url>`, `git push`).
5. **Add your bot token as a secret** — in your repo, go to **Settings → Secrets and variables → Actions → New repository secret**, name it `DISCORD_BOT_TOKEN`, and paste the token as its value. Never commit the token to the repository itself.
6. **Set `StaffSyncUrl` and/or `ChangelogSyncUrl`** in `config.js` to:
   ```
   https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/discord-staff-sync/staff.json
   https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/discord-staff-sync/changelog.json
   ```
7. **Run it once manually** — in your repo's **Actions** tab, open **Discord Staff Sync** and click **Run workflow**. After it finishes, `staff.json` and `changelog.json` will exist in your repo and the loading screen will start using them automatically. From then on they refresh every 5 minutes on their own.

For changelog sync, write posts in your announcements channel like this:
```
v1.4.0
- Added X
- Fixed Y
```
The first line is used as the version if it looks like one (e.g. `v1.4.0` or `1.4.0`); every other line becomes a bullet point. The most recent 10 messages are synced.

If either sync URL is ever unreachable, the loading screen silently falls back to the static list — it never shows a broken panel.

## License

This resource is distributed under a commercial license — see [LICENSE](LICENSE) for the full terms. In short: you may use it on servers you own or operate; you may not resell, redistribute or share the source.

## Credits

Developed by **HG Store**.
