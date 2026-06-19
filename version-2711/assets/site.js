document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var activeIndex = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === activeIndex);
      });
    };

    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    };

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var nextIndex = parseInt(thumb.getAttribute('data-hero-thumb'), 10);
        showSlide(nextIndex);
        start();
      });
    });

    showSlide(0);
    start();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && searchInput) {
    searchInput.value = query;
  }

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  var applyFilters = function () {
    var keyword = normalize(searchInput && searchInput.value);
    var category = normalize(categoryFilter && categoryFilter.value);
    var type = normalize(typeFilter && typeFilter.value);
    var year = normalize(yearFilter && yearFilter.value);

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type')
      ].map(normalize).join(' ');
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var ok = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        ok = false;
      }
      if (category && cardCategory !== category) {
        ok = false;
      }
      if (type && cardType.indexOf(type) === -1) {
        ok = false;
      }
      if (year && cardYear.indexOf(year) === -1) {
        ok = false;
      }

      card.hidden = !ok;
    });
  };

  [searchInput, categoryFilter, typeFilter, yearFilter].forEach(function (item) {
    if (item) {
      item.addEventListener('input', applyFilters);
      item.addEventListener('change', applyFilters);
    }
  });

  if (cards.length) {
    applyFilters();
  }
});
