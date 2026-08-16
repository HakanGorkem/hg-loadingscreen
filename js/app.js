// --- DOM ELEMANLARINI TANIMLAMA ---
const bgMediaContainer = document.getElementById('bg-media');
const serverLogo = document.getElementById('server-logo');
const serverName = document.getElementById('server-name');
const bgMusic = document.getElementById('bg-music');
const staffListContainer = document.getElementById('staff-list');
const staffBtn = document.getElementById('staff-btn');
const staffSidebar = document.getElementById('staff-sidebar');
const closeBtn = document.getElementById('close-btn');
const volumeIcon = document.getElementById('volume-icon');
const progressBar = document.getElementById('progress');
const loadingText = document.getElementById('loading-text');
const loadingPercentage = document.getElementById('loading-percentage');
const socialLinksContainer = document.getElementById('social-links');
const announceSlider = document.getElementById('announce-slider');
const announceTrack = document.getElementById('announce-track');
const announceDots = document.getElementById('announce-dots');
const changelogBtn = document.getElementById('changelog-btn');
const changelogSidebar = document.getElementById('changelog-sidebar');
const changelogCloseBtn = document.getElementById('changelog-close-btn');
const changelogList = document.getElementById('changelog-list');

// --- RGB ÇEVİRİCİ (CSS GÖLGELERİ İÇİN) ---
// Hex renk kodunu CSS'in kullanabileceği şeffaf gölgelere çevirir
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

// --- SİSTEMİ BAŞLATMA (INIT) ---
function init() {
    // 1. Temel Ayarları Yükle
    serverName.innerText = Config.Server.Name;
    serverLogo.src = Config.Server.Logo;
    
    // 2. Dinamik Marka Rengini CSS'e Gönder
    const hexPattern = /^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/;
    let brandColor = Config.Server.ThemeColor;
    if (!hexPattern.test(brandColor)) {
        console.warn("Config.Server.ThemeColor geçersiz bir HEX kodu, varsayılan renk (#ff0000) kullanılıyor.");
        brandColor = "#ff0000";
    }
    const rgbColor = hexToRgb(brandColor);
    const root = document.documentElement;
    
    // Değişkenleri kök dizine tanımlıyoruz
    root.style.setProperty('--brand-color', brandColor);
    root.style.setProperty('--brand-color-rgb', rgbColor);

    // 3. Arka Planı Ayarla
    if (Config.Server.BackgroundType === "video") {
        bgMediaContainer.innerHTML = `
            <video autoplay loop muted id="bg-video" style="width: 100%; height: 100%; object-fit: cover;">
                <source src="${Config.Server.BackgroundMedia}" type="video/mp4">
            </video>`;
    } else {
        bgMediaContainer.innerHTML = `<img src="${Config.Server.BackgroundMedia}" style="width: 100%; height: 100%; object-fit: cover;" alt="Arka Plan">`;
    }

    // 4. Müziği Ayarla
    bgMusic.src = Config.Server.Music;
    bgMusic.volume = Config.Server.MusicVolume;
    bgMusic.play().catch((e) => {
        console.log("Otomatik müzik tarayıcı tarafından engellendi.");
        volumeIcon.className = "fa-solid fa-volume-xmark";
    });

    // 5. Yönetim Kadrosunu Yükle
    loadStaff();

    // 6. Sosyal / Harici Bağlantı Butonlarını Yükle
    loadSocialLinks();

    // 7. Duyuru Slaytını Yükle
    loadAnnouncements();

    // 8. Güncelleme Notlarını Yükle
    loadChangelog();
}

// --- GÜNCELLEME NOTLARI PANELİ ---
function createChangelogEntry(entry) {
    const wrap = document.createElement('div');
    wrap.className = 'changelog-entry';

    const header = document.createElement('div');
    header.className = 'changelog-entry-header';

    const version = document.createElement('span');
    version.className = 'changelog-version';
    version.textContent = entry.version || "";

    const date = document.createElement('span');
    date.className = 'changelog-date';
    date.textContent = entry.date || "";

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

function loadChangelog() {
    (Config.Changelog || []).forEach((entry) => {
        changelogList.appendChild(createChangelogEntry(entry));
    });
}

// --- DUYURU SLAYTI ---
// Config.js -> Announcements dizisindeki gorselleri sirayla, kayarak
// gosterir. Dizi bossa slayt alani hic gorunmez.
function loadAnnouncements() {
    const items = (Config.Announcements || []).filter(
        (a) => a && a.image && a.image.trim() !== ""
    );

    if (items.length === 0) {
        announceSlider.style.display = "none";
        return;
    }

    items.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'announce-slide';

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.alt || "";

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
    setInterval(() => {
        index = (index + 1) % items.length;
        announceTrack.style.transform = `translateX(-${index * 100}%)`;
        [...announceDots.children].forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }, 4500);
}

// --- YÖNETİM KADROSU FONKSİYONU ---
// Discord'dan gelen isim/rol verisi artık üyelerin kendi belirlediği
// takma adlar (config.js gibi güvenilir bir kaynak değil) — bu yüzden
// innerHTML yerine textContent/DOM API kullanılıyor (XSS'e kapalı).
function createStaffCard(person) {
    const card = document.createElement('div');
    card.className = 'staff-card';

    // Avatar, kose kirpma efekti (clip-path) uyguladigi icin durum
    // noktasini avatarin ICINE degil, disina/kardesine koyuyoruz —
    // yoksa clip-path onu da kirpip gorunmez yapar.
    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'staff-avatar-wrap';

    const avatar = document.createElement('div');
    avatar.className = 'staff-avatar';

    const initial = (person.name || "?").charAt(0).toUpperCase();

    if (person.image && person.image.trim() !== "") {
        const img = document.createElement('img');
        img.src = person.image;
        img.alt = person.name || "";
        // Discord CDN gecici olarak yanit vermezse veya avatar silinmisse
        // kirik resim yerine bas harfe dus
        img.onerror = () => {
            img.remove();
            avatar.prepend(document.createTextNode(initial));
        };
        avatar.appendChild(img);
    } else {
        avatar.appendChild(document.createTextNode(initial));
    }

    avatarWrap.appendChild(avatar);

    // Discord'dan cevrimici/cevrimdisi bilgisi geldiyse kucuk bir durum
    // noktasi ekle; StaffFallback (statik yedek liste) icin bu bilgi
    // yok, o yuzden nokta hic gosterilmiyor.
    if (person.status === 'online' || person.status === 'offline') {
        const statusDot = document.createElement('span');
        statusDot.className = 'staff-status-dot ' + person.status;
        statusDot.title = person.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı';
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

// Rolü ne olursa olsun (Discord'dan gelen sira zaten hiyerarsik, ama
// StaffFallback karisik siralanmis olsa bile) herkesi kendi rolunun
// altinda, rolun ilk gorundugu sirayla gruplar.
function groupStaffByRole(staff) {
    const order = [];
    const groups = new Map();

    staff.forEach(person => {
        const role = person.role || "";
        if (!groups.has(role)) {
            groups.set(role, []);
            order.push(role);
        }
        groups.get(role).push(person);
    });

    return order.map(role => ({ role, members: groups.get(role) }));
}

async function loadStaff() {
    let staff = Config.StaffFallback || [];

    if (Config.StaffSyncUrl) {
        try {
            const response = await fetch(Config.StaffSyncUrl, { cache: "no-store" });
            if (response.ok) {
                const remoteStaff = await response.json();
                if (Array.isArray(remoteStaff) && remoteStaff.length > 0) {
                    staff = remoteStaff;
                }
            }
        } catch (e) {
            console.log("Discord yönetim kadrosu çekilemedi, yedek liste kullanılıyor.");
        }
    }

    groupStaffByRole(staff).forEach(group => {
        staffListContainer.appendChild(createStaffGroupHeading(group.role));
        group.members.forEach(person => {
            staffListContainer.appendChild(createStaffCard(person));
        });
    });
}

// --- SOSYAL / HARİCİ BAĞLANTI BUTONLARI ---
// Config.js -> Server.Links içindeki her bağlantı için otomatik buton oluşturur.
// Bir bağlantı boş ("") bırakılırsa ilgili buton hiç oluşturulmaz.
function loadSocialLinks() {
    if (!socialLinksContainer || !Config.Links) return;

    // key: Config.Links içindeki alan adı
    // icon: Font Awesome sınıfı, label: buton üzerindeki yazı
    const linkDefinitions = [
        { key: "Store", icon: "fa-solid fa-cart-shopping", label: "Web Mağaza" },
        { key: "Discord", icon: "fa-brands fa-discord", label: "Discord" },
        { key: "Youtube", icon: "fa-brands fa-youtube", label: "YouTube" }
    ];

    linkDefinitions.forEach(def => {
        const url = Config.Links[def.key];
        if (!url || url.trim() === "") return;

        const link = document.createElement('a');
        link.className = 'social-btn';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `<i class="${def.icon}"></i><span>${def.label}</span>`;

        socialLinksContainer.appendChild(link);
    });
}

// --- MENÜ VE TUŞ ETKİLEŞİMLERİ ---
staffBtn.addEventListener('click', () => {
    changelogSidebar.classList.remove('active');
    staffSidebar.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    staffSidebar.classList.remove('active');
});

changelogBtn.addEventListener('click', () => {
    staffSidebar.classList.remove('active');
    changelogSidebar.classList.add('active');
});

changelogCloseBtn.addEventListener('click', () => {
    changelogSidebar.classList.remove('active');
});

bgMusic.addEventListener('play', () => {
    volumeIcon.className = "fa-solid fa-volume-high";
});

bgMusic.addEventListener('pause', () => {
    volumeIcon.className = "fa-solid fa-volume-xmark";
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

// --- FIVEM NATIVE YÜKLEME BARI BAĞLANTISI ---
let count = 0;
let thisCount = 0;

const handlers = {
    startInitFunctionOrder(data) { count = data.count; },
    initFunctionInvoking(data) {
        loadingText.innerText = "Sistemler Yükleniyor...";
        let progress = (data.idx / count) * 100;
        updateProgress(progress);
    },
    startDataFileEntries(data) {
        loadingText.innerText = "Dosyalar Yükleniyor...";
        count = data.count;
        thisCount = 0;
    },
    performMapLoadFunction(data) {
        ++thisCount;
        let progress = (thisCount / count) * 100;
        updateProgress(progress);
    }
};

window.addEventListener('message', function (e) {
    (handlers[e.data.eventName] || function () { })(e.data);
});

function updateProgress(progress) {
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + '%';
    loadingPercentage.innerText = Math.round(progress) + '%';
}

init();