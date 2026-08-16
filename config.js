const Config = {
    // Core server settings
    Server: {
        Name: "QUASAR ROLEPLAY",          // Server name shown in the loading screen
        Logo: "assets/logo.png",          // Path to your logo (PNG or SVG recommended)
        ShowNameLabel: false,             // Set to true if your logo does NOT already contain your server name as text
        ThemeColor: "#ff0000",            // HEX color used for accents, buttons and highlights
        BackgroundType: "video",          // "video" for an animated background, "image" for a static one
        BackgroundMedia: "assets/bg.mp4", // Path to the background video or image
        Music: "assets/music.mp3",        // Path to the background music track
        MusicVolume: 0.3                  // Default volume, from 0.0 to 1.0 (e.g. 0.3 = 30%)
    },

    // Social / external links (shown as buttons on the left panel)
    // Leave a value as "" to hide that button entirely
    Links: {
        Store: "https://quasarv.com/market",
        Discord: "https://discord.gg/quasarv",
        Youtube: "https://www.youtube.com/@Game-Of-RedLine"
    },

    // Language settings for the interface (does not translate your own
    // content — server name, tagline, staff, announcements and changelog
    // are always shown exactly as you wrote them)
    Language: {
        Default: "en",       // Used the first time a player loads in. Supported: en, tr, es, pt, fr, de, ru, pl, it, ar
        ShowSelector: true   // Show the language switcher so players can change it themselves
    },

    // Announcement slider — an auto-sliding image strip below the social
    // links. Leave Items empty to hide the slider entirely.
    AnnouncementSlider: {
        Interval: 4500, // Milliseconds between slides
        Items: [
            { image: "assets/announce1.svg", alt: "QuasarV Roleplay - The one true home" },
            { image: "assets/announce2.svg", alt: "Launch discount - 25% off all store items, August 28-31" },
            { image: "assets/announce3.svg", alt: "Launch events - August 28-31, follow our Discord for details" },
        ]
    },

    // Update notes shown in the Info Center panel. Add new versions at the top.
    Changelog: [
        {
            version: "v1.3.0",
            date: "16 August 2026",
            changes: [
                "Added an auto-sliding announcement strip below the social links",
                "Staff list can now sync automatically from Discord (roles and online status included)",
                "Added the Updates panel",
            ],
        },
        {
            version: "v1.2.0",
            date: "16 August 2026",
            changes: [
                "Redesigned the interface (left console panel + bottom status bar)",
                "Fixed progress bar calculation bugs",
            ],
        },
        {
            version: "v1.0.0",
            date: "22 July 2026",
            changes: [
                "Initial release",
            ],
        },
    ],

    // Staff list — leave StaffSyncUrl empty to always use StaffFallback below.
    // To sync automatically from Discord instead, set up the bot in
    // discord-staff-sync/ (see README.md) and paste the raw GitHub URL
    // it publishes here, e.g.:
    // "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/discord-staff-sync/staff.json"
    StaffSyncUrl: "https://raw.githubusercontent.com/HakanGorkem/hg-loadingscreen/main/discord-staff-sync/staff.json",

    // Used when StaffSyncUrl is empty, or if it can't be reached
    StaffFallback: [
        {
            name: "Hakan",
            role: "Project Leader",
            image: "assets/hakan.png"     // Leave as "" to show the person's initial instead of a photo
        },
        {
            name: "Cenkerᑫᵘᵃˢᵃʳ",
            role: "Project Leader",
            image: "assets/cenker.png"
        },
        {
            name: "Deadzoneᑫᵘᵃˢᵃʳ",
            role: "Senior Developer",
            image: ""
        },
    ]
};
