
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    bindMobileMenu();
    bindHeroCarousel();
    bindCardFilters();
    bindSearchPage();
    bindPlayers();
  });

  function bindMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) return;
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) return;
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function bindCardFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-card-search]");
      var sort = scope.querySelector("[data-card-sort]");
      var grid = document.querySelector("[data-card-grid]");
      if (!grid) return;
      var cards = Array.prototype.slice.call(grid.children);
      cards.forEach(function (card, index) {
        card.setAttribute("data-default-order", String(index));
      });

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" ").toLowerCase();
          card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
        });

        var mode = sort ? sort.value : "default";
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === "year-desc") return numberYear(b) - numberYear(a);
          if (mode === "year-asc") return numberYear(a) - numberYear(b);
          if (mode === "title") return textValue(a, "data-title").localeCompare(textValue(b, "data-title"), "zh-CN");
          return Number(a.getAttribute("data-default-order")) - Number(b.getAttribute("data-default-order"));
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (search) search.addEventListener("input", apply);
      if (sort) sort.addEventListener("change", apply);
    });
  }

  function numberYear(card) {
    var raw = textValue(card, "data-year");
    var match = raw.match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  }

  function textValue(element, name) {
    return element.getAttribute(name) || "";
  }

  function bindSearchPage() {
    var results = document.getElementById("search-results");
    if (!results || !window.MOVIES) return;
    var params = new URLSearchParams(window.location.search);
    var input = document.querySelector("[data-search-input]");
    var typeSelect = document.querySelector("[data-search-type]");
    var yearSelect = document.querySelector("[data-search-year]");
    if (input) input.value = params.get("q") || "";

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var typeValue = typeSelect ? typeSelect.value : "";
      var yearValue = yearSelect ? yearSelect.value : "";
      var matched = window.MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okType = !typeValue || String(movie.type).indexOf(typeValue) !== -1;
        var okYear = !yearValue || String(movie.year).indexOf(yearValue) !== -1;
        return okKeyword && okType && okYear;
      }).slice(0, 120);

      if (!matched.length) {
        results.innerHTML = '<div class="empty-result">没有找到匹配内容</div>';
        return;
      }

      results.innerHTML = matched.map(function (movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join("");
        return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '">' +
          '<a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove()">' +
          '<span class="movie-year">' + escapeHtml(movie.year) + '</span><span class="movie-play">▶</span></a>' +
          '<div class="movie-info"><a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
          '<p>' + escapeHtml(movie.oneLine || "") + '</p><div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<div class="tag-row">' + tags + '</div></div></article>';
      }).join("");
    }

    if (input) input.addEventListener("input", render);
    if (typeSelect) typeSelect.addEventListener("change", render);
    if (yearSelect) yearSelect.addEventListener("change", render);
    render();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video[data-src]");
      var button = shell.querySelector("[data-play-target]");
      if (!video || !button) return;

      function loadSource() {
        if (video.getAttribute("data-loaded") === "true") return;
        var src = video.getAttribute("data-src");
        if (!src) return;
        video.setAttribute("data-loaded", "true");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.attachMedia(video);
          hls.loadSource(src);
          shell._hls = hls;
          return;
        }
        video.src = src;
      }

      function play(event) {
        if (event) event.preventDefault();
        loadSource();
        var promise = video.play();
        if (promise && promise.then) {
          promise.then(function () {
            shell.classList.add("is-playing");
          }).catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      shell.addEventListener("click", function (event) {
        if (event.target === video) return;
        play(event);
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
    });
  }
})();
