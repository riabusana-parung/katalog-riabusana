const humberger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

humberger.addEventListener('click', () => {
    menu.classList.toggle('menu-active');
    humberger.classList.toggle('active'); // Animasi X
});

// Scroll to Top Logic
const scrollTopBtn = document.querySelector('.scroll-top');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Select semua tombol melayang
    const floatingBtns = document.querySelectorAll('.music-toggle, .theme-toggle, .chat-widget, .scroll-top');

    menu.classList.remove('menu-active');
    humberger.classList.remove('active'); // Reset animasi X saat scroll

    // 1. Logic Munculkan Tombol Scroll Top jika sudah scroll 300px
    if (scrollTop > 300) {
        scrollTopBtn.classList.add('active');
    } else {
        scrollTopBtn.classList.remove('active');
    }

    // 2. Logic Hide/Show Floating Buttons berdasarkan Arah Scroll
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scroll ke Bawah -> Sembunyikan
        floatingBtns.forEach(btn => btn.classList.add('hide-floating'));
    } else {
        // Scroll ke Atas -> Munculkan
        floatingBtns.forEach(btn => btn.classList.remove('hide-floating'));
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Update posisi terakhir
});

scrollTopBtn.onclick = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// --- THEME SWITCHER ---
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggleBtn.querySelector('i');

// Daftar tema: Light -> Dark -> Purple -> Bubu -> Ramadhan
const themes = ['light', 'dark', 'purple', 'bubu', 'ramadhan'];

// --- DATA JADWAL IMSAKIYAH (API & Fallback) ---
const jadwalFallback = { imsak: "04:31", subuh: "04:41", dzuhur: "12:00", ashar: "15:15", maghrib: "18:08", isya: "19:18" };

async function updateJadwalSholat() {
    const timeEls = document.querySelectorAll('.jadwal-item strong');
    const dateEl = document.getElementById('imsakiyah-date');
    const locationEl = document.getElementById('imsakiyah-location');
    if (timeEls.length < 6) return;

    // Set loading state sementara
    timeEls.forEach(el => el.innerText = "...");

    let jadwal = jadwalFallback; // Default ke fallback
    let apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=Bogor&country=Indonesia&method=20`;
    let locationText = "*Jadwal untuk wilayah Bogor & Sekitarnya";

    try {
        // Coba deteksi lokasi pengguna
        try {
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) reject(new Error("Geolocation not supported"));
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            // Gunakan endpoint koordinat jika lokasi diizinkan
            apiUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${long}&method=20`;
            
            // Reverse Geocoding untuk mendapatkan nama kota spesifik
            try {
                const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=id`);
                const geoData = await geoRes.json();
                const cityName = geoData.city || geoData.locality || "Lokasi Anda";
                locationText = `*Jadwal untuk wilayah ${cityName}`;
            } catch (e) {
                locationText = "*Jadwal disesuaikan dengan Lokasi Anda";
            }
        } catch (geoError) {
            console.log("Lokasi tidak dideteksi (Denied/Error), menggunakan default Bogor.");
        }

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.code === 200 && result.data && result.data.timings) {
            const timings = result.data.timings;
            const dateData = result.data.date;

            // Mapping data dari format Aladhan ke format aplikasi
            jadwal = {
                imsak: timings.Imsak,
                subuh: timings.Fajr,
                dzuhur: timings.Dhuhr,
                ashar: timings.Asr,
                maghrib: timings.Maghrib,
                isya: timings.Isha,
                tanggal: dateData.readable // Contoh: "21 Feb 2026"
            };

            if (dateEl) dateEl.innerText = jadwal.tanggal;
            if (locationEl) locationEl.innerText = locationText;
        } else {
            throw new Error("Data API tidak valid");
        }
    } catch (error) {
        console.error("Gagal memuat jadwal sholat:", error);
        
        if (dateEl) {
            const now = new Date();
            dateEl.innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    // Update Teks Waktu
    timeEls[0].innerText = jadwal.imsak + " WIB";
    timeEls[1].innerText = jadwal.subuh + " WIB";
    timeEls[2].innerText = jadwal.dzuhur + " WIB";
    timeEls[3].innerText = jadwal.ashar + " WIB";
    timeEls[4].innerText = jadwal.maghrib + " WIB";
    timeEls[5].innerText = jadwal.isya + " WIB";

    // --- LOGIC HIGHLIGHT OTOMATIS ---
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const timeToMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    const times = [
        { time: jadwal.imsak, index: 0 },
        { time: jadwal.subuh, index: 1 },
        { time: jadwal.dzuhur, index: 2 },
        { time: jadwal.ashar, index: 3 },
        { time: jadwal.maghrib, index: 4 },
        { time: jadwal.isya, index: 5 }
    ];

    let activeIndex = 5; // Default Isya (jika belum masuk waktu Imsak hari ini)

    for (let i = 0; i < times.length; i++) {
        if (currentMinutes < timeToMinutes(times[i].time)) {
            activeIndex = i - 1;
            break;
        }
    }

    if (activeIndex < 0) activeIndex = 5; // Sebelum Imsak -> Masih Isya

    const jadwalItems = document.querySelectorAll('.jadwal-item');
    jadwalItems.forEach(item => item.classList.remove('highlight'));
    if (jadwalItems[activeIndex]) {
        jadwalItems[activeIndex].classList.add('highlight');
    }
}

// --- PARTICLE SYSTEM ---
let particleInterval;
let clockInterval; // Variabel untuk interval jam

// Definisikan bentuk partikel untuk setiap tema
const particleShapes = {
    bubu: ['❤️', '⭐', '🌸', '✨', '💖'],
    ramadhan: ['🌙', '✨', '🕌', '🏮', '⭐'] // Bulan, kilau, masjid, lentera, bintang
};

const startParticles = (theme) => {
    if (particleInterval) return; // Mencegah duplikasi interval
    const shapes = particleShapes[theme];
    if (!shapes) return; // Jangan jalankan jika tema tidak punya partikel

    particleInterval = setInterval(() => {
        const particle = document.createElement('div');
        particle.classList.add('falling-particle');
        particle.classList.add(theme + '-particle'); // Tambahkan class spesifik tema (misal: ramadhan-particle)
        
        // Acak bentuk dari tema yang aktif
        particle.innerText = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Random posisi dan animasi
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.fontSize = (Math.random() * 20 + 10) + 'px'; // Ukuran 10px - 30px
        const duration = Math.random() * 3 + 3; // Durasi 3s - 6s (Normal speed)
        particle.style.animationDuration = duration + 's';
        
        document.body.appendChild(particle);
        
        // Hapus elemen setelah animasi selesai agar tidak memberatkan memori
        setTimeout(() => particle.remove(), duration * 1000);
    }, 400); // Muncul setiap 400ms
};

const stopParticles = () => {
    if (particleInterval) {
        clearInterval(particleInterval);
        particleInterval = null;
    }
    // Hapus semua partikel yang tersisa
    document.querySelectorAll('.falling-particle').forEach(p => p.remove());
};

// Fungsi untuk menerapkan tema
const applyTheme = (themeName) => {
    // Reset class
    body.classList.remove('dark-mode', 'purple-mode', 'bubu-mode', 'ramadhan-mode');
    themeIcon.className = ''; // Reset icon class
    
    // Stop partikel secara default
    stopParticles();

    // Stop Jam Digital jika ada (agar tidak jalan di background saat ganti tema)
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    if (themeName === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.classList.add('ri-palette-line'); // Icon next: Purple
    } else if (themeName === 'purple') {
        body.classList.add('purple-mode');
        themeIcon.classList.add('ri-emotion-happy-line'); // Icon next: Bubu
    } else if (themeName === 'bubu') {
        body.classList.add('bubu-mode');
        themeIcon.classList.add('ri-star-fill'); // Icon next: Ramadhan (Ganti ke Bintang karena Masjid tidak muncul)
        startParticles('bubu'); // Jalankan animasi partikel Bubu
    } else if (themeName === 'ramadhan') {
        body.classList.add('ramadhan-mode');
        themeIcon.classList.add('ri-sun-line'); // Icon next: Light (Matahari, tanda kembali ke awal)
        startParticles('ramadhan'); // Jalankan animasi partikel Ramadhan

        // Jalankan Jam Digital Realtime
        const updateClock = () => {
            const clockEl = document.getElementById('imsakiyah-clock');
            if (clockEl) {
                clockEl.innerText = new Date().toLocaleTimeString('en-GB', { hour12: false });
            }
        };
        updateClock(); // Jalankan langsung saat tema aktif
        clockInterval = setInterval(updateClock, 1000); // Update tiap detik
        
        // Munculkan Popup Imsakiyah Otomatis
        const imsakPopup = document.getElementById('imsakiyah-popup');
        if (imsakPopup) {
            // Ambil data terbaru dari API
            updateJadwalSholat();

            setTimeout(() => imsakPopup.classList.add('active'), 800); // Delay sedikit agar smooth
        }
    } else {
        // Light mode
        themeIcon.classList.add('ri-moon-line'); // Icon next: Dark
    }
    localStorage.setItem('theme', themeName);
};

// Load tema tersimpan
let currentTheme = localStorage.getItem('theme') || 'light';
if (!themes.includes(currentTheme)) currentTheme = 'light';
applyTheme(currentTheme);

// Event listener click
themeToggleBtn.addEventListener('click', () => {
    // Sembunyikan notifikasi jika tombol tema diklik
    const themeNotif = document.getElementById('theme-notification');
    if (themeNotif && themeNotif.classList.contains('show')) {
        themeNotif.classList.remove('show');
        localStorage.setItem('seen_ramadhan_theme', 'true'); // Simpan status sudah dilihat
    }

    let currentIndex = themes.indexOf(currentTheme);
    let nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    applyTheme(currentTheme);
});

// --- BACKGROUND MUSIC CONTROL ---
const musicToggleBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
const musicIcon = musicToggleBtn.querySelector('i');

// Set volume awal
bgMusic.volume = 0.3;

// Fungsi untuk play/pause musik
const toggleMusic = () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Autoplay dicegah browser."));
        musicIcon.className = 'ri-volume-up-line';
    } else {
        bgMusic.pause();
        musicIcon.className = 'ri-volume-mute-line';
    }
};

// Event listener untuk tombol mute/unmute
musicToggleBtn.addEventListener('click', toggleMusic);

// --- PRELOADER SLIDER ANIMATION ---
const initPreloaderSlider = () => {
    const slides = document.querySelectorAll('.image-slider img');
    if (slides.length === 0) return;
    
    let index = 0;
    setInterval(() => {
        slides[index].classList.remove('active');
        index = (index + 1) % slides.length;
        slides[index].classList.add('active');
    }, 800); // Ganti gambar setiap 0.8 detik
};
initPreloaderSlider();

// Coba putar musik setelah preloader selesai (setelah 2 detik)
// Ini untuk mencoba autoplay saat halaman pertama kali dibuka
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');

    // Sembunyikan preloader setelah 2 detik
    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('hide');
            if (typeof AOS !== 'undefined') AOS.refresh(); // Refresh animasi AOS
        }

        // SEGERA setelah preloader hilang, pasang listener untuk klik pertama.
        // Ini memastikan musik akan play pada klik pertama kali setelah loading.
        document.addEventListener('click', () => {
            if (bgMusic.paused) toggleMusic();
        }, { once: true }); // `{ once: true }` agar event ini hanya berjalan sekali.
    }, 500); // Waktu tunggu dikurangi agar preloader cepat hilang setelah load selesai
});

// --- DATA PRODUK (JSON Array) ---
// Variabel produk kosong, akan diisi otomatis dari PHP
let products = [];

// --- RENDER PRODUK KE HTML ---
const productContainer = document.querySelector('.produk-list');

// Elemen Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-lightbox');

// Fungsi Render dipisah agar bisa dipanggil setelah data dimuat
function renderProducts() {
    productContainer.innerHTML = ''; // Bersihkan container
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.setAttribute('data-filter', product.filter);

        const img = document.createElement('img');
        img.src = product.src;
        img.alt = "produk image";
        img.loading = "lazy"; // Mengaktifkan Native Lazy Loading
        
        // Handle jika gambar rusak/404 (Fallback ke Logo)
        img.onerror = function() {
            console.warn("Gambar tidak ditemukan (404):", product.src);
            this.src = './assets/icons/favicon.png'; // Ganti dengan path logo Anda
            this.style.objectFit = 'contain';
            this.style.padding = '20px';
        };

        img.onclick = () => {
            lightbox.classList.add('active');
            lightboxImg.src = product.src;
        };

        card.appendChild(img);

        if (product.isNew) {
            card.setAttribute('data-new', 'true');
            const badge = document.createElement('span');
            badge.classList.add('badge-new');
            badge.innerText = 'New';
            card.appendChild(badge);
        }

        productContainer.appendChild(card);
    });
}

// Event Listener: Tutup Lightbox
closeBtn.onclick = () => {
    lightbox.classList.remove('active');
};

// Tutup jika klik di area gelap (luar gambar)
lightbox.onclick = (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
    }
};

// --- LOGIKA FILTER & LOAD MORE ---
const btnfilter = document.querySelectorAll('.produk-box ul li');
let imgfilter = document.querySelectorAll('.produk-list .product-card'); // Select wrapper card
const loadMoreBtn = document.getElementById('load-more-btn');

let itemsToShow = 8; // Jumlah produk awal yang ditampilkan
const loadIncrement = 4; // Jumlah produk yang ditambah saat klik tombol

// Fungsi untuk mengatur visibilitas produk berdasarkan filter dan limit
const updateProductVisibility = (filterValue, animate = false) => {
    let visibleCount = 0;
    let totalMatch = 0;
    let staggerIndex = 0;

    // Animate out non-matching items first
    imgfilter.forEach((img) => {
        const cardFilter = img.getAttribute('data-filter');
        const isNew = img.getAttribute('data-new') === 'true';
        let match = (filterValue === 'all produk') || (filterValue === 'new arrival' && isNew) || (cardFilter === filterValue);

        if (match) totalMatch++;

        if (animate && !match && img.style.display !== 'none') {
            img.classList.add('anim-hide');
        }
    });

    // After a delay (for hide animation), update visibility and animate in new items
    setTimeout(() => {
        imgfilter.forEach((img) => {
            const cardFilter = img.getAttribute('data-filter');
            const isNew = img.getAttribute('data-new') === 'true';
            let match = (filterValue === 'all produk') || (filterValue === 'new arrival' && isNew) || (cardFilter === filterValue);

            if (match && visibleCount < itemsToShow) {
                // This item should be visible
                if (img.style.display === 'none') {
                    img.style.display = 'block';
                    img.classList.add('anim-hide'); // Start hidden
                    setTimeout(() => {
                        img.classList.remove('anim-hide'); // Animate in
                    }, 50 + staggerIndex * 50);
                    staggerIndex++;
                } else {
                    // If it was already visible, just ensure the hide class is removed
                    img.classList.remove('anim-hide');
                }
                visibleCount++;
            } else {
                // Hide items that don't match or are beyond the limit
                img.style.display = 'none';
            }
        });

        loadMoreBtn.style.display = (visibleCount >= totalMatch) ? 'none' : 'inline-block';

        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 400);
    }, animate ? 400 : 0); // Wait for hide animation to finish
};

// Fungsi Utama untuk Memuat Data dan Menyiapkan Filter
async function initCatalog() {
    try {
        // --- UPDATE: Kembali menggunakan File JSON/PHP (Tanpa Firebase) ---
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLiveServer = window.location.port.startsWith('55');
        const endpoint = (isLocalhost && !isLiveServer) ? './get_products.php' : './products.json';
        
        const response = await fetch(endpoint + '?v=' + new Date().getTime());
        products = await response.json();
        
        // Render produk ke HTML
        renderProducts();
        
        // Update selector imgfilter setelah elemen dirender agar filter mendeteksi produk
        imgfilter = document.querySelectorAll('.produk-list .product-card');

        // Update visibilitas awal
        updateProductVisibility('all produk');
        
        // Setup Filter Buttons
        btnfilter.forEach((btn) =>{
            const originalText = btn.textContent.split('(')[0].trim(); // Ambil nama kategori saja
            const filterKey = originalText.toLowerCase();
            let count = 0;

            if (filterKey === 'all produk') {
                count = products.length;
            } else if (filterKey === 'new arrival') {
                count = products.filter(p => p.isNew).length;
            } else {
                count = products.filter(p => p.filter === filterKey).length;
            }

            btn.textContent = `${originalText} (${count})`;
            btn.setAttribute('data-filter-key', filterKey);

            btn.onclick = () =>{
                btnfilter.forEach(b => b.className = "");
                btn.className = "active";
                itemsToShow = 8;
                updateProductVisibility(filterKey, true);
            };
        });

    } catch (error) {
        console.error("Gagal memuat produk:", error);
    }
}

// Jalankan inisialisasi
if (productContainer) {
    initCatalog();
}

// Event Listener Tombol Load More
if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
        itemsToShow += loadIncrement;
        const activeFilter = document.querySelector('.produk-box ul li.active').getAttribute('data-filter-key');
        updateProductVisibility(activeFilter, false); // Tidak perlu animasi reset penuh, cukup item baru
    };
}

// --- PROMO POPUP LOGIC ---
window.addEventListener('load', () => {
    // Fungsi Helper untuk menangani banyak popup
    const handlePopup = (id, showDelay, hideDelay) => {
        const popup = document.getElementById(id);
        if (!popup) return;

        const closeBtn = popup.querySelector('.close-promo');

        // Munculkan popup
        setTimeout(() => popup.classList.add('show'), showDelay);

        // Sembunyikan otomatis
        setTimeout(() => popup.classList.remove('show'), hideDelay);

        // Tombol Close Manual
        if (closeBtn) closeBtn.onclick = () => popup.classList.remove('show');
    };

    // Popup 1 (Slider Portrait): Muncul detik ke-4, Hilang detik ke-14
    handlePopup('promo-popup', 4000, 14000);

    // Popup 2 (Landscape): Muncul detik ke-15, Hilang detik ke-25
    handlePopup('promo-popup-2', 15000, 25000);

    // Logic Close Popup Imsakiyah
    const imsakPopup = document.getElementById('imsakiyah-popup');
    const closeImsak = document.querySelector('.close-imsakiyah');
    if (imsakPopup && closeImsak) {
        closeImsak.onclick = () => imsakPopup.classList.remove('active');
        // Tutup jika klik di luar area konten
        imsakPopup.onclick = (e) => { if (e.target === imsakPopup) imsakPopup.classList.remove('active'); };
    }

    // --- THEME NOTIFICATION LOGIC ---
    const themeNotif = document.getElementById('theme-notification');
    const closeThemeNotif = document.querySelector('.close-theme-notif');
    
    // Cek localStorage: Apakah user sudah pernah menutup notifikasi ini?
    const hasSeenTheme = localStorage.getItem('seen_ramadhan_theme');
    
    // Munculkan hanya jika belum pernah dilihat DAN tema saat ini bukan Ramadhan
    if (themeNotif && !hasSeenTheme && currentTheme !== 'ramadhan') {
        setTimeout(() => themeNotif.classList.add('show'), 3000); // Muncul detik ke-3
    }

    if (closeThemeNotif) {
        closeThemeNotif.onclick = () => {
            themeNotif.classList.remove('show');
            localStorage.setItem('seen_ramadhan_theme', 'true');
        };
    }
});

// --- PROMO BANNER SLIDER ---
const promoImages = document.querySelectorAll('.promo-banner img');
let currentPromoIndex = 0;

if (promoImages.length > 0) {
    setInterval(() => {
        currentPromoIndex = (currentPromoIndex + 1) % promoImages.length;
        // Geser semua gambar ke kiri berdasarkan index saat ini
        promoImages.forEach(img => {
            img.style.transform = `translateX(-${currentPromoIndex * 100}%)`;
        });
    }, 4000); // Ganti gambar setiap 4 detik
}

// --- PROMO POPUP SLIDER ---
const popupSliderWrapper = document.querySelector('.promo-slider-wrapper');
const popupImages = document.querySelectorAll('.promo-slider-wrapper img');
let currentPopupIndex = 0;

if (popupImages.length > 0) {
    setInterval(() => {
        currentPopupIndex = (currentPopupIndex + 1) % popupImages.length;
        popupSliderWrapper.style.transform = `translateX(-${currentPopupIndex * 100}%)`;
    }, 3000); // Geser setiap 3 detik
}

// --- TV MEDIA LOGIC (Slider & Grid Support) ---
let currentVideoIndex = 0;
let totalVideos = 0;
window.isGlobalMuted = false; // Default: Suara Nyala

async function loadVideos() {
    const sliderWrapper = document.getElementById('video-slider-wrapper'); // Untuk Index (Slider)
    const gridContainer = document.getElementById('video-container'); // Untuk Halaman TV Media (Grid)

    if (!sliderWrapper && !gridContainer) return;

    try {
        // Deteksi otomatis: Localhost pakai PHP, TAPI jika Live Server (Port 55xx) pakai JSON
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLiveServer = window.location.port.startsWith('55'); // Port default Live Server VS Code (5500)

        const endpoint = (isLocalhost && !isLiveServer) ? './get_video.php' : './videos.json';

        const response = await fetch(endpoint);
        const videos = await response.json();

        if (videos.length === 0) return;

        // --- LOGIKA SLIDER (Index Page) ---
        if (sliderWrapper) {
            sliderWrapper.innerHTML = '';
            window.totalVideos = videos.length;
            window.currentVideoIndex = 0;

            const ytPlayersToInit = []; // Tampung ID player YouTube untuk di-init API
 
            videos.forEach((video, index) => {
                const slide = document.createElement('div');
                slide.className = 'video-slide';
 
                const videoWrapper = document.createElement('div');
                videoWrapper.className = 'video-wrapper';
 
                const skeletonLoader = document.createElement('div');
                skeletonLoader.className = 'skeleton-loader';
                videoWrapper.appendChild(skeletonLoader);
 
                const hideSkeleton = () => {
                    skeletonLoader.style.opacity = '0';
                    setTimeout(() => skeletonLoader.remove(), 500);
                };
 
                if (video.type === 'youtube') {
                     const separator = video.src.includes('?') ? '&' : '?';
                     const origin = window.location.origin;
                     const iframeId = `yt-player-${index}`;
                     const autoplayParams = ''; // Matikan autoplay sementara
                     
 
                     const iframe = document.createElement('iframe');
                     iframe.id = iframeId;
                     iframe.className = 'slider-video';
                     iframe.src = `${video.src}${separator}enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&color=white&origin=${origin}${autoplayParams}`;
                     
                     // FIX: Tambahkan atribut allow agar YouTube tidak menganggap ini bot/spam
                     iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                     iframe.referrerPolicy = "strict-origin-when-cross-origin";
                     
                     iframe.allowFullscreen = true;
                     iframe.loading = 'lazy';
                     iframe.onload = hideSkeleton;
                     videoWrapper.appendChild(iframe);
                     ytPlayersToInit.push(iframeId);
                } else { // MP4
                    const videoEl = document.createElement('video');
                    videoEl.className = 'slider-video';
                    videoEl.controls = true;
                    videoEl.playsInline = true;
                    videoEl.preload = 'metadata';

                    const sourceEl = document.createElement('source');
                    sourceEl.src = video.src;
                    sourceEl.type = video.type;
                    videoEl.appendChild(sourceEl);

                    videoEl.addEventListener('loadeddata', hideSkeleton);
                    videoEl.muted = window.isGlobalMuted; 
                    videoEl.addEventListener('ended', () => moveVideoSlide(1));
                    videoWrapper.appendChild(videoEl);
                }
 
                const videoInfo = document.createElement('div');
                videoInfo.className = 'video-info';
                videoInfo.innerHTML = `<h3>${video.title}</h3>`;
 
                slide.appendChild(videoWrapper);
                slide.appendChild(videoInfo);
                sliderWrapper.appendChild(slide);
            });

            // Inisialisasi YouTube API untuk Autoplay Next Slide
            if (ytPlayersToInit.length > 0) {
                const initPlayers = () => {
                    ytPlayersToInit.forEach(id => {
                        if (document.getElementById(id)) {
                            new YT.Player(id, {
                                events: {
                                    'onStateChange': (event) => {
                                        if (event.data === 0) window.moveVideoSlide(1); // 0 = ENDED
                                    }
                                }
                            });
                        }
                    });
                };

                if (window.YT && window.YT.Player) {
                    initPlayers();
                } else {
                    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                        const tag = document.createElement('script');
                        tag.src = "https://www.youtube.com/iframe_api";
                        document.body.appendChild(tag);
                    }
                    window.onYouTubeIframeAPIReady = initPlayers;
                }
            }
        }

        // --- LOGIKA GRID (Halaman Khusus TV Media) ---
        if (gridContainer) {
            gridContainer.innerHTML = '';
            videos.forEach((video, index) => {
                const card = document.createElement('div');
                card.className = 'video-card';
                card.setAttribute('data-aos', 'fade-up');
                card.setAttribute('data-aos-delay', index * 100);

                const videoWrapper = document.createElement('div');
                videoWrapper.className = 'video-wrapper';

                const skeletonLoader = document.createElement('div');
                skeletonLoader.className = 'skeleton-loader';
                videoWrapper.appendChild(skeletonLoader);

                const hideSkeleton = () => {
                    skeletonLoader.style.opacity = '0';
                    setTimeout(() => skeletonLoader.remove(), 500);
                };

                if (video.type === 'youtube') {
                    const separator = video.src.includes('?') ? '&' : '?';
                    const iframe = document.createElement('iframe');
                    iframe.src = `${video.src}${separator}rel=0&modestbranding=1&iv_load_policy=3&fs=0&color=white`;
                    
                    // FIX: Tambahkan atribut allow untuk grid video juga
                    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                    iframe.referrerPolicy = "strict-origin-when-cross-origin";
                    
                    iframe.allowFullscreen = true;
                    iframe.loading = 'lazy';
                    iframe.onload = hideSkeleton;
                    videoWrapper.appendChild(iframe);
                } else {
                    const videoEl = document.createElement('video');
                    videoEl.controls = true;
                    videoEl.preload = 'metadata';
                    const sourceEl = document.createElement('source');
                    sourceEl.src = video.src;
                    sourceEl.type = video.type;
                    videoEl.appendChild(sourceEl);
                    videoEl.addEventListener('loadeddata', hideSkeleton);
                    videoWrapper.appendChild(videoEl);
                }

                card.innerHTML = `<div class="video-info"><h3>${video.title}</h3></div>`;
                card.prepend(videoWrapper);
                gridContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Gagal memuat video:', error);
    }
}

// Fungsi Navigasi Slider (Next/Prev)
function moveVideoSlide(direction) {
    if (!window.totalVideos) return;
    
    // Pause video saat ini sebelum geser
    const slides = document.querySelectorAll('.video-slide');
    const currentSlide = slides[window.currentVideoIndex];
    
    if (currentSlide) {
        const video = currentSlide.querySelector('video');
        const iframe = currentSlide.querySelector('iframe');

        if (video) { video.pause(); video.currentTime = 0; }
        // Kirim perintah pause ke YouTube via postMessage
        if (iframe) { iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', 'https://www.youtube.com'); }
    }

    window.currentVideoIndex += direction;
    if (window.currentVideoIndex < 0) window.currentVideoIndex = window.totalVideos - 1;
    if (window.currentVideoIndex >= window.totalVideos) window.currentVideoIndex = 0;

    const wrapper = document.getElementById('video-slider-wrapper');
    if (wrapper) wrapper.style.transform = `translateX(-${window.currentVideoIndex * 100}%)`;

    // Autoplay video baru (Slide Aktif)
    const newSlide = slides[window.currentVideoIndex];
    const newVideo = newSlide ? newSlide.querySelector('video') : null;
    const newIframe = newSlide ? newSlide.querySelector('iframe') : null;

    if (newVideo) { 
        newVideo.muted = window.isGlobalMuted; 
        newVideo.play().catch(e => console.log("Autoplay dicegah browser:", e));
    }

    if (newIframe) { 
        // Play video YouTube via API saat slide bergeser
        // Cek contentWindow sebelum postMessage untuk menghindari error
        try {
            if (newIframe.contentWindow) {
                newIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', 'https://www.youtube.com');
            }
        } catch (e) {
            // Abaikan error jika iframe diblokir browser/extension
        } 
    }
}

loadVideos();

// Fungsi Toggle Mute Global
function toggleVideoMute() {
    window.isGlobalMuted = !window.isGlobalMuted;
    const videos = document.querySelectorAll('.slider-video');
    const btnIcon = document.querySelector('.video-mute-btn i');

    // Update Ikon Tombol
    if (btnIcon) {
        btnIcon.className = window.isGlobalMuted ? 'ri-volume-mute-line' : 'ri-volume-up-line';
    }

    // Terapkan ke semua video di slider
    videos.forEach(v => {
        if (v.tagName === 'VIDEO') {
            v.muted = window.isGlobalMuted;
        } else if (v.tagName === 'IFRAME') {
            const command = window.isGlobalMuted ? 'mute' : 'unMute';
            try {
                if (v.contentWindow) {
                    v.contentWindow.postMessage(`{"event":"command","func":"${command}","args":""}`, 'https://www.youtube.com');
                }
            } catch (e) {
                // Abaikan error
            }
        }
    });
}

// --- EVENT LISTENERS FOR VIDEO CONTROLS (Fix ReferenceError) ---
const videoPrevBtn = document.querySelector('.video-nav.prev');
const videoNextBtn = document.querySelector('.video-nav.next');
const videoMuteBtn = document.querySelector('.video-mute-btn');

if (videoPrevBtn) videoPrevBtn.addEventListener('click', () => window.moveVideoSlide(-1));
if (videoNextBtn) videoNextBtn.addEventListener('click', () => window.moveVideoSlide(1));
if (videoMuteBtn) videoMuteBtn.addEventListener('click', () => window.toggleVideoMute());

// --- AUTO PAUSE VIDEO ON SCROLL ---
const videoSliderContainer = document.querySelector('.video-slider-container');
if (videoSliderContainer) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const slides = document.querySelectorAll('.video-slide');
            if (slides.length > 0 && typeof window.currentVideoIndex !== 'undefined') {
                const currentSlide = slides[window.currentVideoIndex];
                const currentVideo = currentSlide ? currentSlide.querySelector('video') : null;
                const currentIframe = currentSlide ? currentSlide.querySelector('iframe') : null;

                if (entry.isIntersecting) {
                    // Masuk viewport (50%) -> Play
                    if (currentVideo && currentVideo.paused) {
                        currentVideo.play().catch(e => console.log("Autoplay scroll dicegah:", e));
                    }
                    // Play YouTube juga saat di-scroll ke arahnya
                    if (currentIframe) {
                        currentIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', 'https://www.youtube.com');
                    }
                } else {
                    // Keluar viewport -> Pause
                    if (currentVideo && !currentVideo.paused) {
                        currentVideo.pause();
                    }
                    // Pause YouTube juga saat di-scroll lewat
                    if (currentIframe) {
                        currentIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', 'https://www.youtube.com');
                    }
                }
            }
        });
    }, { threshold: 0.5 }); // Trigger saat 50% elemen terlihat
    
    observer.observe(videoSliderContainer);
}

// --- EXPOSE GLOBALS (Karena script sekarang type="module") ---
window.moveVideoSlide = moveVideoSlide;
window.toggleVideoMute = toggleVideoMute;
// Pastikan fungsi lain yang dipanggil via onclick di HTML terekspos