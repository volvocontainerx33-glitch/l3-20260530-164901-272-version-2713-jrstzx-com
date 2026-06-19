(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var url = "./search.html";
            if (query) {
                url += "?q=" + encodeURIComponent(query);
            }
            window.location.href = url;
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        var activate = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        var start = function () {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                activate((current + 1) % slides.length);
            }, 5000);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                start();
            });
        });

        start();
    }

    var localInput = document.querySelector("[data-local-search]");
    var filterSelect = document.querySelector("[data-filter-select]");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
    var noResults = document.querySelector("[data-no-results]");

    var params = new URLSearchParams(window.location.search);
    var preset = params.get("q") || "";
    if (localInput && preset) {
        localInput.value = preset;
    }

    var runFilter = function () {
        var query = localInput ? localInput.value.trim().toLowerCase() : "";
        var category = filterSelect ? filterSelect.value : "";
        var visible = 0;

        items.forEach(function (item) {
            var text = item.textContent.toLowerCase();
            var itemCategory = item.getAttribute("data-category") || "";
            var matchedText = !query || text.indexOf(query) !== -1;
            var matchedCategory = !category || itemCategory === category;
            var matched = matchedText && matchedCategory;
            item.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.hidden = visible !== 0;
        }
    };

    if (localInput || filterSelect) {
        runFilter();
    }
    if (localInput) {
        localInput.addEventListener("input", runFilter);
    }
    if (filterSelect) {
        filterSelect.addEventListener("change", runFilter);
    }
})();

var MoviePlayer = {
    start: function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var cover = document.querySelector(".player-cover");
        var startButton = document.querySelector("[data-start-play]");
        var loaded = false;
        var hls = null;

        if (!video) {
            return;
        }

        var load = function () {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        };

        var play = function () {
            load();
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        };

        if (startButton) {
            startButton.addEventListener("click", play);
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
};
