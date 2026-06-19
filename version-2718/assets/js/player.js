(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playButton");
    var overlay = document.querySelector("[data-player-overlay]");

    if (!video) {
      return;
    }

    var source = video.getAttribute("data-video");
    var started = false;
    var hlsInstance = null;

    function attachSource() {
      if (!source || started) {
        return;
      }
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playMovie() {
      attachSource();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", playMovie);
    }

    video.addEventListener("click", function () {
      if (!started || video.paused) {
        playMovie();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
