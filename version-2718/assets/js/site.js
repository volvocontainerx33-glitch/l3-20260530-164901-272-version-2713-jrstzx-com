(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
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

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
      var typeSelect = filterRoot.querySelector("[data-filter-type]");
      var yearSelect = filterRoot.querySelector("[data-filter-year]");
      var regionSelect = filterRoot.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty-result]");

      function valueOf(el) {
        return el ? el.value.trim().toLowerCase() : "";
      }

      function applyFilters() {
        var keyword = valueOf(keywordInput);
        var type = valueOf(typeSelect);
        var year = valueOf(yearSelect);
        var region = valueOf(regionSelect);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type")
          ].join(" ").toLowerCase();
          var ok = true;

          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (type && card.getAttribute("data-type") !== type) {
            ok = false;
          }
          if (year && card.getAttribute("data-year") !== year) {
            ok = false;
          }
          if (region && card.getAttribute("data-region") !== region) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [keywordInput, typeSelect, yearSelect, regionSelect].forEach(function (el) {
        if (el) {
          el.addEventListener("input", applyFilters);
          el.addEventListener("change", applyFilters);
        }
      });
    }

    var heroSearchForm = document.querySelector("[data-hero-search]");
    if (heroSearchForm) {
      heroSearchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = heroSearchForm.querySelector("input");
        var keyword = input ? input.value.trim() : "";
        var target = "search.html";
        if (keyword) {
          target += "?q=" + encodeURIComponent(keyword);
        }
        window.location.href = target;
      });
    }

    var query = new URLSearchParams(window.location.search).get("q");
    var pageKeyword = document.querySelector("[data-filter-keyword]");
    if (query && pageKeyword) {
      pageKeyword.value = query;
      pageKeyword.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
})();
