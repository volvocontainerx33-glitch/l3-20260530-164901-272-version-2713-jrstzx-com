import { H as Hls } from './hls-vendor-dru42stk.js';

const menuButton = document.querySelector('[data-menu-toggle]');
const mainNav = document.querySelector('[data-main-nav]');

if (menuButton && mainNav) {
    menuButton.addEventListener('click', () => {
        mainNav.classList.toggle('is-open');
    });
}

function setupHeroCarousel() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
        return;
    }

    let current = 0;
    let timer = null;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === current);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function setupFilters() {
    const scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
        return;
    }

    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-filter-year]');
    const region = scope.querySelector('[data-filter-region]');
    const category = scope.querySelector('[data-filter-category]');
    const count = scope.querySelector('[data-filter-count]');
    const cards = Array.from(document.querySelectorAll('[data-card-grid] .movie-card'));

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && input) {
        input.value = query;
    }

    const apply = () => {
        const q = (input?.value || '').trim().toLowerCase();
        const selectedYear = year?.value || '';
        const selectedRegion = region?.value || '';
        const selectedCategory = category?.value || '';
        let visible = 0;

        cards.forEach((card) => {
            const text = card.dataset.search || '';
            const matchesText = !q || text.includes(q);
            const matchesYear = !selectedYear || card.dataset.year === selectedYear;
            const matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
            const matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
            const shouldShow = matchesText && matchesYear && matchesRegion && matchesCategory;
            card.classList.toggle('is-filtered-out', !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = `${visible} 部`;
        }
    };

    [input, year, region, category].forEach((control) => {
        if (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        }
    });

    apply();
}

function setupPlayers() {
    const players = Array.from(document.querySelectorAll('video[data-hls-src]'));

    players.forEach((video) => {
        const src = video.dataset.hlsSrc;
        const shell = video.closest('.player-shell');
        const button = shell?.querySelector('[data-player-button]');

        if (src && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hlsInstance = hls;
        } else if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        }

        if (button) {
            button.addEventListener('click', async () => {
                button.classList.add('is-hidden');
                try {
                    await video.play();
                } catch (error) {
                    button.classList.remove('is-hidden');
                    video.controls = true;
                }
            });
        }

        video.addEventListener('play', () => {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    });
}

function setupImageFallback() {
    document.querySelectorAll('img').forEach((image) => {
        image.addEventListener('error', () => {
            image.style.opacity = '0';
            image.closest('.poster-link, .category-card, .hero-poster, .category-cover, .poster-card')?.classList.add('image-pending');
        }, { once: true });
    });
}

setupHeroCarousel();
setupFilters();
setupPlayers();
setupImageFallback();
