(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));
  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var stream = shell.getAttribute('data-stream');
    var prepared = false;
    var hlsInstance = null;

    var prepare = function () {
      if (prepared || !video || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      prepared = true;
      shell.__hls = hlsInstance;
    };

    var start = function () {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!prepared || video.paused) {
          start();
        }
      });
    }
  });
})();
