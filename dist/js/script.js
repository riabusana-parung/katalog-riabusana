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

// Daftar tema: Light -> Dark -> Purple
const themes = ['light', 'dark', 'purple', 'bubu'];

// --- PARTICLE SYSTEM (Bubu Mode) ---
let particleInterval;

const startParticles = () => {
    if (particleInterval) return; // Mencegah duplikasi interval
    particleInterval = setInterval(() => {
        const particle = document.createElement('div');
        particle.classList.add('falling-particle');
        
        // Acak bentuk: Hati, Bintang, Bunga, Kilau
        const shapes = ['❤️', '⭐', '🌸', '✨', '💖'];
        particle.innerText = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Random posisi dan animasi
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.fontSize = (Math.random() * 20 + 10) + 'px'; // Ukuran 10px - 30px
        const duration = Math.random() * 3 + 3; // Durasi 3s - 6s
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
    body.classList.remove('dark-mode', 'purple-mode', 'bubu-mode');
    themeIcon.className = ''; // Reset icon class
    
    // Stop partikel secara default (hanya nyala di bubu mode)
    stopParticles();

    if (themeName === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.classList.add('ri-palette-line'); // Icon next: Purple
    } else if (themeName === 'purple') {
        body.classList.add('purple-mode');
        themeIcon.classList.add('ri-emotion-happy-line'); // Icon next: Bubu
    } else if (themeName === 'bubu') {
        body.classList.add('bubu-mode');
        themeIcon.classList.add('ri-sun-line'); // Icon next: Light
        startParticles(); // Jalankan animasi partikel
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
    }, 3000); // Diperlama jadi 3 detik agar slider sempat terlihat
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
        // Deteksi otomatis: Jika localhost pakai PHP, jika online pakai JSON
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const endpoint = isLocalhost ? './get_products.php' : './products.json';
        
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
initCatalog();

// Event Listener Tombol Load More
loadMoreBtn.onclick = () => {
    itemsToShow += loadIncrement;
    const activeFilter = document.querySelector('.produk-box ul li.active').getAttribute('data-filter-key');
    updateProductVisibility(activeFilter, false); // Tidak perlu animasi reset penuh, cukup item baru
};

// --- PROMO POPUP LOGIC ---
window.addEventListener('load', () => {
    const promoPopup = document.getElementById('promo-popup');
    const closePromo = document.querySelector('.close-promo');

    if (promoPopup) {
        // 1. Munculkan popup setelah 4 detik (setelah preloader & user melihat hero sebentar)
        setTimeout(() => {
            promoPopup.classList.add('show');
        }, 4000);

        // 2. Hilangkan otomatis setelah 10 detik tampil (total 14 detik dari load)
        setTimeout(() => {
            promoPopup.classList.remove('show');
        }, 14000);

        // 3. Tombol Close Manual
        closePromo.onclick = () => promoPopup.classList.remove('show');
    }
});