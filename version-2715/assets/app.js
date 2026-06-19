(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var current = 0;
      var show = function (next) {
        slides[current].classList.remove("is-active");
        if (dots[current]) {
          dots[current].classList.remove("is-active");
        }
        current = next;
        slides[current].classList.add("is-active");
        if (dots[current]) {
          dots[current].classList.add("is-active");
        }
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var runFilter = function () {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          ok = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          ok = false;
        }
        if (region && (card.getAttribute("data-region") || "").indexOf(region) === -1) {
          ok = false;
        }
        card.classList.toggle("hidden-by-filter", !ok);
      });
    };
    [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (el) {
      if (el) {
        el.addEventListener("input", runFilter);
        el.addEventListener("change", runFilter);
      }
    });
  });

  window.initMoviePlayer = function (videoId, coverId, buttonId, url) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var started = false;

    if (!video || !url) {
      return;
    }

    var start = function () {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    };

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", start);
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
