// Discord sunucusundaki yetkili rollere sahip uyeleri ceker, hiyerarsiye
// gore siralayip staff.json olarak yazar. GitHub Actions tarafindan
// periyodik calistirilir (bkz. .github/workflows/sync-staff.yml).
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const GUILD_ID = '1526586632663334952';
const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
    console.error('DISCORD_BOT_TOKEN ortam degiskeni tanimli degil.');
    process.exit(1);
}

// En yetkiliden en az yetkiliye dogru — bu sira staff.json'daki sirayi
// ve bir uyenin birden fazla rolu varsa hangi rolle gosterilecegini belirler.
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
    { id: '1526740930307297400', name: 'İllegal Manager' },
    { id: '1526981887036362824', name: 'Business Manager' },
    { id: '1526741131155607653', name: 'Event Manager' },
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
});

client.once('ready', async () => {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const members = await guild.members.fetch({ withPresences: true });

        const staff = [];
        const seen = new Set();

        for (const roleInfo of ROLE_HIERARCHY) {
            const withRole = [...members.values()]
                .filter((m) => !m.user.bot && m.roles.cache.has(roleInfo.id))
                .sort((a, b) => a.displayName.localeCompare(b.displayName, 'tr'));

            for (const member of withRole) {
                if (seen.has(member.id)) continue;
                seen.add(member.id);

                // online/idle/dnd -> Discord'da "acik" sayilir, sadece
                // gercekten cevrimdisiysa (presence yok) kirmizi gosterilir
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

        const outPath = path.join(__dirname, 'staff.json');
        fs.writeFileSync(outPath, JSON.stringify(staff, null, 2) + '\n');
        console.log(`staff.json yazildi (${staff.length} kisi).`);
    } catch (err) {
        console.error('Senkronizasyon hatasi:', err);
        process.exitCode = 1;
    } finally {
        client.destroy();
    }
});

client.login(TOKEN);
