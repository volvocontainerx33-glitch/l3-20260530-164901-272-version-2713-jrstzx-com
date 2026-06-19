(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }
    }

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var list = document.querySelector("[data-filter-list]");
      var items = list ? Array.prototype.slice.call(list.querySelectorAll(".filter-item")) : [];

      if (!input || !items.length) {
        return;
      }

      function applyFilter() {
        var query = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var text = (item.getAttribute("data-filter-text") || item.textContent || "").toLowerCase();
          item.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
        });
      }

      input.addEventListener("input", applyFilter);
      form.addEventListener("reset", function () {
        setTimeout(applyFilter, 0);
      });
    });

    var searchInput = document.getElementById("search-page-input");
    var searchResults = document.getElementById("search-results");
    var searchStatus = document.getElementById("search-status");

    if (searchInput && searchResults && searchStatus && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      searchInput.value = initialQuery;

      function renderSearch() {
        var query = searchInput.value.trim().toLowerCase();
        var movies = window.SEARCH_MOVIES;
        var results = query
          ? movies.filter(function (movie) {
              return movie.searchText.indexOf(query) !== -1;
            }).slice(0, 120)
          : movies.slice(0, 60);

        searchStatus.textContent = query ? "搜索结果" : "热门推荐";
        searchResults.innerHTML = results.map(function (movie) {
          return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"" + movie.url + "\">",
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-shade\"></span>",
            "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
            "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"tag-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
            "</div>",
            "</article>"
          ].join("");
        }).join("");
      }

      searchInput.addEventListener("input", renderSearch);
      renderSearch();
    }
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var playLayer = document.querySelector(".play-layer");
      var started = false;
      var hlsInstance = null;

      if (!video || !streamUrl) {
        return;
      }

      function attachStream() {
        if (started) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }

        video.controls = true;
        started = true;
      }

      function beginPlayback() {
        attachStream();
        if (playLayer) {
          playLayer.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (playLayer) {
        playLayer.addEventListener("click", beginPlayback);
      }

      video.addEventListener("click", function () {
        if (!started) {
          beginPlayback();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  };
})();
