(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("media-off");
      });
    });
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-slide]"),
    );
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    var thumbs = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-thumb]"),
    );
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setActive(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        setActive(Number(thumb.getAttribute("data-hero-thumb")) || 0);
        stop();
      });
      thumb.addEventListener("mouseleave", start);
    });
    if (next) {
      next.addEventListener("click", function () {
        setActive(index + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        setActive(index - 1);
        start();
      });
    }
    start();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(
      document.querySelectorAll(".movie-search"),
    );
    var lists = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-list]"),
    );
    if (!inputs.length || !lists.length) {
      return;
    }
    var activeCategory = "all";
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-category]"),
    );

    function applyFilters(value) {
      var query = normalize(value);
      lists.forEach(function (list) {
        Array.prototype.slice
          .call(list.querySelectorAll(".movie-card"))
          .forEach(function (card) {
            var text = normalize(
              [
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-category"),
                card.getAttribute("data-tags"),
                card.textContent,
              ].join(" "),
            );
            var category = card.getAttribute("data-category") || "";
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchCategory =
              activeCategory === "all" || category === activeCategory;
            card.classList.toggle("is-hidden", !(matchQuery && matchCategory));
          });
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        inputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        applyFilters(input.value);
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          var target =
            document.querySelector("#movies") ||
            document.querySelector("[data-filter-list]");
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-filter-category") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters(inputs[0] ? inputs[0].value : "");
      });
    });
  }

  function initPlayer() {
    var shell = document.querySelector("[data-player]");
    var video = document.querySelector("#movie-player");
    var trigger = document.querySelector(".play-trigger");
    if (!shell || !video || !trigger) {
      return;
    }
    var src = video.getAttribute("data-play");
    var hlsInstance = null;

    function startVideo() {
      if (!src) {
        shell.classList.add("player-error");
        return;
      }
      trigger.disabled = true;
      shell.classList.add("is-playing");
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              shell.classList.add("player-error");
            }
          });
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", src);
        }
      } else {
        video.setAttribute("src", src);
      }
      video.play().catch(function () {
        trigger.disabled = false;
        shell.classList.remove("is-playing");
      });
    }

    trigger.addEventListener("click", startVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        startVideo();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
  }

  onReady(function () {
    initImages();
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
