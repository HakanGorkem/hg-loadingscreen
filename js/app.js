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
}

// --- YÖNETİM KADROSU FONKSİYONU ---
// Discord'dan gelen isim/rol verisi artık üyelerin kendi belirlediği
// takma adlar (config.js gibi güvenilir bir kaynak değil) — bu yüzden
// innerHTML yerine textContent/DOM API kullanılıyor (XSS'e kapalı).
function createStaffCard(person) {
    const card = document.createElement('div');
    card.className = 'staff-card';

    const avatar = document.createElement('div');
    avatar.className = 'staff-avatar';

    if (person.image && person.image.trim() !== "") {
        const img = document.createElement('img');
        img.src = person.image;
        img.alt = person.name || "";
        // Discord CDN gecici olarak yanit vermezse veya avatar silinmisse
        // kirik resim yerine bas harfe dus
        img.onerror = () => {
            avatar.textContent = (person.name || "?").charAt(0).toUpperCase();
        };
        avatar.appendChild(img);
    } else {
        avatar.textContent = (person.name || "?").charAt(0).toUpperCase();
    }

    const info = document.createElement('div');
    info.className = 'staff-info';

    const nameEl = document.createElement('h4');
    nameEl.textContent = person.name;

    const roleEl = document.createElement('span');
    roleEl.textContent = person.role;

    info.appendChild(nameEl);
    info.appendChild(roleEl);

    card.appendChild(avatar);
    card.appendChild(info);

    return card;
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

    staff.forEach(person => {
        staffListContainer.appendChild(createStaffCard(person));
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
    staffSidebar.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    staffSidebar.classList.remove('active');
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