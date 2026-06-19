(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 6200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var list = document.querySelector('[data-filter-list]');
  var emptyTip = document.querySelector('[data-empty-tip]');
  if (filterInput && list) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      filterInput.value = initial;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var applyFilter = function () {
      var query = filterInput.value.trim().toLowerCase();
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var matched = (!query || haystack.indexOf(query) > -1) && (!year || card.getAttribute('data-year') === year);
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (emptyTip) {
        emptyTip.classList.toggle('is-visible', visible === 0);
      }
    };
    filterInput.addEventListener('input', applyFilter);
    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }
    applyFilter();
  }
})();
