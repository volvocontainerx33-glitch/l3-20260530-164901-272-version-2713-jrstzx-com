(function () {
  const searchForms = document.querySelectorAll("[data-global-search]");
  const movies = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function renderSearch(panel, keyword) {
    const query = normalize(keyword);
    if (!query) {
      panel.hidden = true;
      panel.innerHTML = "";
      return [];
    }

    const matches = movies
      .filter(function (movie) {
        return normalize(movie.title + " " + movie.region + " " + movie.year + " " + movie.genre + " " + movie.tags).includes(query);
      })
      .slice(0, 8);

    if (matches.length === 0) {
      panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
      panel.hidden = false;
      return [];
    }

    panel.innerHTML = matches
      .map(function (movie) {
        return [
          '<a class="search-result-item" href="./' + movie.url + '">',
          '<img src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '">',
          '<span>',
          '<strong>' + escapeHtml(movie.title) + '</strong>',
          '<em>' + escapeHtml(movie.genre + ' · ' + movie.region + ' · ' + movie.year) + '</em>',
          '</span>',
          '</a>'
        ].join("");
      })
      .join("");
    panel.hidden = false;
    return matches;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  searchForms.forEach(function (form) {
    const input = form.querySelector("[data-search-input]");
    const panel = form.querySelector("[data-search-panel]");
    let currentMatches = [];

    if (!input || !panel) {
      return;
    }

    input.addEventListener("input", function () {
      currentMatches = renderSearch(panel, input.value);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      currentMatches = renderSearch(panel, input.value);
      if (currentMatches[0]) {
        window.location.href = "./" + currentMatches[0].url;
      }
    });

    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        panel.hidden = true;
      }
    });
  });

  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.hidden = !mobilePanel.hidden;
    });
  }

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function show(index) {
      if (slides.length === 0) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  document.querySelectorAll("[data-list-tools]").forEach(function (tools) {
    const input = tools.querySelector("[data-list-filter]");
    const list = document.querySelector("[data-card-list]");
    if (!input || !list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll("[data-card]"));

    input.addEventListener("input", function () {
      const query = normalize(input.value);
      cards.forEach(function (card) {
        const text = normalize(card.getAttribute("data-keywords") || card.textContent);
        card.hidden = query && !text.includes(query);
      });
    });
  });
})();
