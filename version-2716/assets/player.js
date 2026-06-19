(function () {
  function setupMoviePlayer(source) {
    const video = document.querySelector("[data-player-video]");
    const button = document.querySelector("[data-player-start]");
    const message = document.querySelector("[data-player-message]");
    let hls = null;

    if (!video || !source) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.hidden = false;
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function showButton() {
      if (button) {
        button.classList.remove("is-hidden");
      }
    }

    function attach() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage("网络暂时不稳定，请稍后重试");
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          showMessage("播放暂时不可用");
          hls.destroy();
        });
        return;
      }

      video.src = source;
    }

    async function play() {
      hideButton();
      try {
        await video.play();
      } catch (error) {
        showButton();
      }
    }

    attach();

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("play", hideButton);
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showButton();
      }
    });
    video.addEventListener("error", function () {
      showMessage("播放暂时不可用");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
