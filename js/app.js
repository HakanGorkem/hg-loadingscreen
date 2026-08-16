// --- Element references ---
const bgMediaContainer = document.getElementById('bg-media');
const serverEyebrow = document.getElementById('server-eyebrow');
const serverLogo = document.getElementById('server-logo');
const serverName = document.getElementById('server-name');
const bgMusic = document.getElementById('bg-music');
const staffListContainer = document.getElementById('staff-list');
const infoBtn = document.getElementById('info-btn');
const infoPanel = document.getElementById('info-panel');
const infoCloseBtn = document.getElementById('info-close-btn');
const panelTabs = document.querySelectorAll('.panel-tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const volumeIcon = document.getElementById('volume-icon');
const progressBar = document.getElementById('progress');
const loadingText = document.getElementById('loading-text');
const loadingPercentage = document.getElementById('loading-percentage');
const socialLinksContainer = document.getElementById('social-links');
const announceSlider = document.getElementById('announce-slider');
const announceTrack = document.getElementById('announce-track');
const announceDots = document.getElementById('announce-dots');
const changelogList = document.getElementById('changelog-list');
const langSwitcher = document.getElementById('lang-switcher');
const langBtn = document.getElementById('lang-btn');
const langDropdown = document.getElementById('lang-dropdown');

// --- Helpers ---
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

// --- Language system ---
const LANG_STORAGE_KEY = 'hg_loadscreen_lang';
let currentLoadingKey = 'loadingDefault';

function getCurrentLanguage() {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && Translations[saved]) return saved;
    const configured = Config.Language && Config.Language.Default;
    return Translations[configured] ? configured : 'en';
}

function applyLanguage(lang) {
    if (!Translations[lang]) lang = 'en';
    const dict = Translations[lang];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
        const key = el.getAttribute('data-i18n-alt');
        if (dict[key]) el.setAttribute('alt', dict[key]);
    });

    document.querySelectorAll('.lang-option').forEach((opt) => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    document.documentElement.lang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    setLoadingText(currentLoadingKey);
}

function buildLanguageDropdown() {
    Object.keys(Translations).forEach((code) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'lang-option';
        option.dataset.lang = code;
        option.textContent = LanguageNames[code] || code;
        option.addEventListener('click', () => {
            applyLanguage(code);
            langDropdown.classList.remove('active');
        });
        langDropdown.appendChild(option);
    });
}

function setLoadingText(key) {
    currentLoadingKey = key;
    const lang = getCurrentLanguage();
    const dict = Translations[lang] || Translations.en;
    loadingText.textContent = dict[key] || Translations.en[key];
}

langBtn.addEventListener('click', () => {
    langDropdown.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!langSwitcher.contains(e.target)) {
        langDropdown.classList.remove('active');
    }
});

// --- Init ---
function init() {
    serverEyebrow.textContent = Config.Server.Name;
    serverName.textContent = Config.Server.Name;
    serverName.style.display = Config.Server.ShowNameLabel ? '' : 'none';
    serverLogo.src = Config.Server.Logo;

    const hexPattern = /^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/;
    let brandColor = Config.Server.ThemeColor;
    if (!hexPattern.test(brandColor)) {
        console.warn('Config.Server.ThemeColor is not a valid HEX color, falling back to #ff0000.');
        brandColor = '#ff0000';
    }
    const root = document.documentElement;
    root.style.setProperty('--brand-color', brandColor);
    root.style.setProperty('--brand-color-rgb', hexToRgb(brandColor));

    if (Config.Server.BackgroundType === 'video') {
        bgMediaContainer.innerHTML = `
            <video autoplay loop muted id="bg-video" style="width: 100%; height: 100%; object-fit: cover;">
                <source src="${Config.Server.BackgroundMedia}" type="video/mp4">
            </video>`;
    } else {
        bgMediaContainer.innerHTML = `<img src="${Config.Server.BackgroundMedia}" style="width: 100%; height: 100%; object-fit: cover;" alt="Background">`;
    }

    bgMusic.src = Config.Server.Music;
    bgMusic.volume = Config.Server.MusicVolume;
    bgMusic.play().catch(() => {
        volumeIcon.className = 'fa-solid fa-volume-xmark';
    });

    if (Config.Language && Config.Language.ShowSelector === false) {
        langSwitcher.style.display = 'none';
    } else {
        buildLanguageDropdown();
    }
    applyLanguage(getCurrentLanguage());

    loadStaff();
    loadSocialLinks();
    loadAnnouncements();
    loadChangelog();
}

// --- Updates tab ---
function createChangelogEntry(entry) {
    const wrap = document.createElement('div');
    wrap.className = 'changelog-entry';

    if (entry.image && entry.image.trim() !== '') {
        const img = document.createElement('img');
        img.className = 'changelog-entry-image';
        img.src = entry.image;
        img.alt = entry.version || '';
        img.onerror = () => img.remove();
        wrap.appendChild(img);
    }

    const header = document.createElement('div');
    header.className = 'changelog-entry-header';

    const version = document.createElement('span');
    version.className = 'changelog-version';
    version.textContent = entry.version || '';

    const date = document.createElement('span');
    date.className = 'changelog-date';
    date.textContent = entry.date || '';

    header.appendChild(version);
    header.appendChild(date);

    const list = document.createElement('ul');
    list.className = 'changelog-changes';
    (entry.changes || []).forEach((change) => {
        const li = document.createElement('li');
        li.textContent = change;
        list.appendChild(li);
    });

    wrap.appendChild(header);
    wrap.appendChild(list);
    return wrap;
}

async function loadChangelog() {
    let entries = Config.ChangelogFallback || [];

    if (Config.ChangelogSyncUrl) {
        try {
            const response = await fetch(Config.ChangelogSyncUrl, { cache: 'no-store' });
            if (response.ok) {
                const remote = await response.json();
                if (Array.isArray(remote) && remote.length > 0) {
                    entries = remote;
                }
            }
        } catch (e) {
            // Network error or unreachable — fall back to the static list below.
        }
    }

    entries.forEach((entry) => {
        changelogList.appendChild(createChangelogEntry(entry));
    });
}

// --- Announcement slider ---
function loadAnnouncements() {
    const settings = Config.AnnouncementSlider || {};
    const items = (settings.Items || []).filter((a) => a && a.image && a.image.trim() !== '');

    if (items.length === 0) {
        announceSlider.style.display = 'none';
        return;
    }

    items.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'announce-slide';

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.alt || '';

        slide.appendChild(img);
        announceTrack.appendChild(slide);
    });

    if (items.length === 1) return;

    items.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'announce-dot' + (i === 0 ? ' active' : '');
        announceDots.appendChild(dot);
    });

    let index = 0;
    const interval = typeof settings.Interval === 'number' ? settings.Interval : 4500;
    setInterval(() => {
        index = (index + 1) % items.length;
        announceTrack.style.transform = `translateX(-${index * 100}%)`;
        [...announceDots.children].forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }, interval);
}

// --- Staff tab ---
// Discord member data is untrusted user input (custom nicknames), so it is
// rendered with textContent/DOM APIs rather than innerHTML to avoid XSS.
function createStaffCard(person) {
    const card = document.createElement('div');
    card.className = 'staff-card';

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'staff-avatar-wrap';

    const avatar = document.createElement('div');
    avatar.className = 'staff-avatar';

    const initial = (person.name || '?').charAt(0).toUpperCase();

    if (person.image && person.image.trim() !== '') {
        const img = document.createElement('img');
        img.src = person.image;
        img.alt = person.name || '';
        img.onerror = () => {
            img.remove();
            avatar.prepend(document.createTextNode(initial));
        };
        avatar.appendChild(img);
    } else {
        avatar.appendChild(document.createTextNode(initial));
    }

    avatarWrap.appendChild(avatar);

    if (person.status === 'online' || person.status === 'offline') {
        const statusDot = document.createElement('span');
        statusDot.className = 'staff-status-dot ' + person.status;
        avatarWrap.appendChild(statusDot);
    }

    const info = document.createElement('div');
    info.className = 'staff-info';

    const nameEl = document.createElement('h4');
    nameEl.textContent = person.name;
    info.appendChild(nameEl);

    card.appendChild(avatarWrap);
    card.appendChild(info);

    return card;
}

function createStaffGroupHeading(roleName) {
    const heading = document.createElement('div');
    heading.className = 'staff-group-heading';
    heading.textContent = roleName;
    return heading;
}

function groupStaffByRole(staff) {
    const order = [];
    const groups = new Map();

    staff.forEach((person) => {
        const role = person.role || '';
        if (!groups.has(role)) {
            groups.set(role, []);
            order.push(role);
        }
        groups.get(role).push(person);
    });

    return order.map((role) => ({ role, members: groups.get(role) }));
}

async function loadStaff() {
    let staff = Config.StaffFallback || [];

    if (Config.StaffSyncUrl) {
        try {
            const response = await fetch(Config.StaffSyncUrl, { cache: 'no-store' });
            if (response.ok) {
                const remoteStaff = await response.json();
                if (Array.isArray(remoteStaff) && remoteStaff.length > 0) {
                    staff = remoteStaff;
                }
            }
        } catch (e) {
            // Network error or unreachable — fall back to the static list below.
        }
    }

    groupStaffByRole(staff).forEach((group) => {
        staffListContainer.appendChild(createStaffGroupHeading(group.role));
        group.members.forEach((person) => {
            staffListContainer.appendChild(createStaffCard(person));
        });
    });
}

// --- Social links ---
function loadSocialLinks() {
    if (!socialLinksContainer || !Config.Links) return;

    const dict = Translations[getCurrentLanguage()] || Translations.en;

    // Discord and YouTube are brand names and stay untranslated; only the
    // "Store" label is UI chrome, so it gets a data-i18n hook to update
    // automatically when the player switches language.
    const linkDefinitions = [
        { key: 'Store', icon: 'fa-solid fa-cart-shopping', label: dict.socialStore, i18nKey: 'socialStore' },
        { key: 'Discord', icon: 'fa-brands fa-discord', label: 'Discord' },
        { key: 'Youtube', icon: 'fa-brands fa-youtube', label: 'YouTube' },
    ];

    linkDefinitions.forEach((def) => {
        const url = Config.Links[def.key];
        if (!url || url.trim() === '') return;

        const link = document.createElement('a');
        link.className = 'social-btn';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const icon = document.createElement('i');
        icon.className = def.icon;
        const label = document.createElement('span');
        label.textContent = def.label;
        if (def.i18nKey) label.setAttribute('data-i18n', def.i18nKey);

        link.appendChild(icon);
        link.appendChild(label);
        socialLinksContainer.appendChild(link);
    });
}

// --- UI interactions ---
infoBtn.addEventListener('click', () => {
    infoPanel.classList.add('active');
});

infoCloseBtn.addEventListener('click', () => {
    infoPanel.classList.remove('active');
});

panelTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        panelTabs.forEach((t) => t.classList.remove('active'));
        tabPanels.forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
});

bgMusic.addEventListener('play', () => {
    volumeIcon.className = 'fa-solid fa-volume-high';
});

bgMusic.addEventListener('pause', () => {
    volumeIcon.className = 'fa-solid fa-volume-xmark';
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (bgMusic.paused) {
            bgMusic.play();
        } else {
            bgMusic.pause();
        }
    }
});

// --- FiveM native loading progress ---
let count = 0;
let thisCount = 0;

const handlers = {
    startInitFunctionOrder(data) {
        count = data.count;
    },
    initFunctionInvoking(data) {
        setLoadingText('loadingSystems');
        updateProgress((data.idx / count) * 100);
    },
    startDataFileEntries(data) {
        setLoadingText('loadingFiles');
        count = data.count;
        thisCount = 0;
    },
    performMapLoadFunction() {
        ++thisCount;
        updateProgress((thisCount / count) * 100);
    },
};

window.addEventListener('message', (e) => {
    (handlers[e.data.eventName] || function () {})(e.data);
});

function updateProgress(progress) {
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + '%';
    loadingPercentage.textContent = Math.round(progress) + '%';
}

init();
