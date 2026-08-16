const Config = {
    // Sunucu Temel Ayarları
    Server: {
        Name: "QUASAR ROLEPLAY",          // Oyuncuların yükleme ekranında/arayüzde göreceği sunucu adı
        Logo: "assets/logo.png",          // Sunucunuza ait logonun projedeki dosya yolu (PNG veya SVG önerilir)
        ThemeColor: "#ff0000",            // Arayüzün genel renk temasını belirleyen HEX renk kodu (Örn: Butonlar, vurgular için)
        BackgroundType: "video",          // Arka planın türü: Hareketli arka plan için "video", sabit görsel için "image" yazın
        BackgroundMedia: "assets/bg.mp4", // Arka planda oynatılacak medya dosyasının yolu (Video veya görsel dosyası)
        Music: "assets/music.mp3",        // Yükleme ekranında çalacak arka plan müzik dosyasının yolu
        MusicVolume: 0.3                  // Müziğin varsayılan ses seviyesi (0.0 ile 1.0 arasında bir değer girin, örn: 0.3 = %30 ses)
    },

    // Sosyal / Harici Bağlantılar (Buton olarak sol altta gösterilir)
    // Bir bağlantıyı gizlemek isterseniz değerini "" (boş) bırakmanız yeterli
    Links: {
        Store: "https://quasarv.com/market",      // Sunucunun bağış veya paket satış mağazasının web sitesi linki
        Discord: "https://discord.gg/quasarv", // Topluluk Discord sunucusunun davet bağlantısı
        Youtube: "https://www.youtube.com/@Game-Of-RedLine" // Sunucunun resmi YouTube kanalının bağlantısı
    },

    // Duyuru Slaytı — sosyal medya butonlarının altında otomatik kayan
    // görsel şeridi. Her görsel birkaç saniyede bir otomatik değişir.
    // Görsel eklemek için assets/ klasörüne dosyayı koyup buraya yolunu
    // yazmanız yeterli. Liste boş bırakılırsa slayt alanı hiç görünmez.
    Announcements: [
        { image: "assets/announce1.svg", alt: "QuasarV Roleplay - Kalitenin tek adresi" },
        { image: "assets/announce2.svg", alt: "Açılışa özel indirim - 28-31 Ağustos tüm donate ürünlerinde %25 indirim" },
        { image: "assets/announce3.svg", alt: "Açılışa özel etkinlikler - 28-31 Ağustos, detaylar için Discord duyurularını takip edin" },
    ],

    // Güncelleme Notları — sağ üstteki "Güncelleme Notları" panelinde
    // gösterilir. En yeni sürümü en üste ekleyin.
    Changelog: [
        {
            version: "v1.3.0",
            date: "16 Ağustos 2026",
            changes: [
                "Sosyal medya butonlarının altına otomatik kayan duyuru slaytı eklendi",
                "Yönetim kadrosu artık Discord'dan otomatik çekiliyor (rol ve çevrimiçi durumu dahil)",
                "Güncelleme notları paneli eklendi",
            ],
        },
        {
            version: "v1.2.0",
            date: "16 Ağustos 2026",
            changes: [
                "Arayüz baştan tasarlandı (sol konsol paneli + alt durum çubuğu)",
                "İlerleme çubuğundaki hesaplama hataları düzeltildi",
            ],
        },
        {
            version: "v1.0.0",
            date: "22 Temmuz 2026",
            changes: [
                "İlk sürüm yayınlandı",
            ],
        },
    ],

    // Yönetim Kadrosu — Discord sunucusundan otomatik çekilir
    // (bkz. discord-staff-sync/). Aşağıdaki adresteki JSON her ~20 dakikada
    // bir güncellenir. Kendi deposunu kurduktan sonra bu URL'yi
    // "KULLANICI_ADIN/REPO_ADIN" kısmını kendi GitHub kullanıcı adın ve
    // repo adınla değiştirerek güncelle.
    StaffSyncUrl: "https://raw.githubusercontent.com/HakanGorkem/hg-loadingscreen/main/discord-staff-sync/staff.json",

    // StaffSyncUrl'e erişilemezse (repo henüz kurulmadıysa, internet yoksa vb.)
    // kullanılacak yedek liste — Discord entegrasyonu çalışana kadar bu liste görünür.
    StaffFallback: [
        {
            name: "Hakan",                // Ekip üyesinin adı veya kullanıcı adı
            role: "Project Leader",       // Ekip içerisindeki yetki/pozisyon unvanı
            image: "assets/hakan.png"     // Ekip üyesine ait profil görselinin dosya yolu
        },
        {
            name: "Cenkerᑫᵘᵃˢᵃʳ",
            role: "Project Leader",
            image: "assets/cenker.png"                     // Görsel kullanılmayacaksa bu alanı boş bırakabilirsiniz ("")
        },
        {
            name: "Noetᑫᵘᵃˢᵃʳ",
            role: "Founder",
            image: ""
        },
        {
            name: "Tolgaᑫᵘᵃˢᵃʳ",
            role: "Management",
            image: ""
        },
        {
            name: "Deadzoneᑫᵘᵃˢᵃʳ",
            role: "Senior Developer",
            image: ""
        },
        {
            name: "Emreᑫᵘᵃˢᵃʳ",
            role: "Senior Developer",
            image: ""
        },
    ]
};