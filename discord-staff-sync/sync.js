// Discord Staff & Changelog Sync
// Fetches your staff roster and recent changelog posts from Discord and
// writes staff.json / changelog.json. Run periodically by GitHub Actions
// (see .github/workflows/sync-staff.yml). See README.md for full setup
// instructions — both are optional features; the loading screen falls
// back to config.js -> StaffFallback / ChangelogFallback if unused.
//
// ============================================================================
//  EDIT THIS SECTION FOR YOUR OWN SERVER
// ============================================================================

// Your Discord server ID (right-click your server icon -> Copy Server ID,
// requires Developer Mode enabled in Discord settings)
const GUILD_ID = '1526586632663334952';

// Roles to include, ordered from highest rank to lowest. This order
// controls both the sort order in staff.json and which role a member is
// shown under if they hold more than one of these roles.
const ROLE_HIERARCHY = [
    { id: '1526733929028124702', name: 'Project Leader' },
    { id: '1526734051698933770', name: 'Project Director' },
    { id: '1526734285434781786', name: 'Founder' },
    { id: '1527280023667605574', name: 'Senior Developer' },
    { id: '1526734412039979068', name: 'Management' },
    { id: '1526738836569329724', name: 'Master' },
    { id: '1526739956318339202', name: 'Admin' },
    { id: '1526740417079541931', name: 'Moderator' },
    { id: '1526740511971610816', name: 'Staff' },
    { id: '1526740915576639620', name: 'Legal Manager' },
    { id: '1526740930307297400', name: 'Illegal Manager' },
    { id: '1526981887036362824', name: 'Business Manager' },
    { id: '1526741131155607653', name: 'Event Manager' },
];

// Channel to pull changelog / update-notes posts from. Set to '' to skip
// changelog sync entirely. Write posts in this channel like:
//   v1.4.0
//   - Added X
//   - Fixed Y
// The first line is used as the version if it looks like one (e.g. "v1.4.0"
// or "1.4.0"); every other line becomes a bullet point.
const CHANGELOG_CHANNEL_ID = '1526993103146193006';
const CHANGELOG_MESSAGE_LIMIT = 10;

// ============================================================================
//  Below this line: sync logic. No changes needed.
// ============================================================================

const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
    console.error('DISCORD_BOT_TOKEN environment variable is not set.');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

function writeJson(fileName, data) {
    const outPath = path.join(__dirname, fileName);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');
}

async function syncStaff(guild) {
    const members = await guild.members.fetch({ withPresences: true });
    const staff = [];
    const seen = new Set();

    for (const roleInfo of ROLE_HIERARCHY) {
        const withRole = [...members.values()]
            .filter((m) => !m.user.bot && m.roles.cache.has(roleInfo.id))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        for (const member of withRole) {
            if (seen.has(member.id)) continue;
            seen.add(member.id);

            const presenceStatus = member.presence?.status;
            const isOnline =
                presenceStatus === 'online' ||
                presenceStatus === 'idle' ||
                presenceStatus === 'dnd';

            staff.push({
                name: member.displayName,
                role: roleInfo.name,
                image: member.displayAvatarURL({ extension: 'png', size: 128 }),
                status: isOnline ? 'online' : 'offline',
            });
        }
    }

    writeJson('staff.json', staff);
    console.log(`staff.json written (${staff.length} members).`);
}

function parseChangelogMessage(message) {
    const lines = message.content.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    let version = '';
    let bodyLines = lines;

    if (/^v?\d+(\.\d+){1,2}$/i.test(lines[0])) {
        version = lines[0].toLowerCase().startsWith('v') ? lines[0] : `v${lines[0]}`;
        bodyLines = lines.slice(1);
    }

    const changes = bodyLines.map((l) => l.replace(/^[-*•]\s*/, '')).filter(Boolean);
    if (changes.length === 0) return null;

    const date = message.createdAt.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return { version, date, changes };
}

async function syncChangelog() {
    if (!CHANGELOG_CHANNEL_ID) return;

    const channel = await client.channels.fetch(CHANGELOG_CHANNEL_ID);
    const messages = await channel.messages.fetch({ limit: CHANGELOG_MESSAGE_LIMIT });
    const changelog = [...messages.values()].map(parseChangelogMessage).filter(Boolean);

    writeJson('changelog.json', changelog);
    console.log(`changelog.json written (${changelog.length} entries).`);
}

client.once('ready', async () => {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await syncStaff(guild);
        await syncChangelog();
    } catch (err) {
        console.error('Sync failed:', err);
        process.exitCode = 1;
    } finally {
        client.destroy();
    }
});

client.login(TOKEN);
