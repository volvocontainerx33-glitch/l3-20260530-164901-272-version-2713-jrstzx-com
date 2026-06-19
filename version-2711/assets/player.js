document.addEventListener('DOMContentLoaded', function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));

  shells.forEach(function (shell) {
    var video = shell.querySelector('video[data-stream]');
    var trigger = shell.querySelector('[data-play-trigger]');
    var status = shell.querySelector('[data-video-status]');
    var hlsInstance = null;

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    var setStatus = function (message, hidden) {
      if (!status) {
        return;
      }
      status.textContent = message || '';
      status.classList.toggle('is-hidden', !!hidden);
    };

    var hideTrigger = function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    };

    var showTrigger = function () {
      if (trigger) {
        trigger.classList.remove('is-hidden');
      }
    };

    var attachStream = function () {
      if (!stream || video.dataset.ready === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.dataset.ready = '1';
          setStatus('', true);
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络连接异常，正在重试...', false);
            hlsInstance.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('视频解码异常，正在恢复...', false);
            hlsInstance.recoverMediaError();
            return;
          }
          setStatus('视频加载失败', false);
          showTrigger();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.dataset.ready = '1';
        setStatus('', true);
      } else {
        setStatus('浏览器暂不支持此视频格式', false);
      }
    };

    var playVideo = function () {
      attachStream();
      var result = video.play();
      if (result && typeof result.then === 'function') {
        result.then(function () {
          hideTrigger();
          setStatus('', true);
        }).catch(function () {
          showTrigger();
        });
      } else {
        hideTrigger();
        setStatus('', true);
      }
    };

    attachStream();

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      hideTrigger();
      setStatus('', true);
    });

    video.addEventListener('pause', function () {
      showTrigger();
    });

    video.addEventListener('error', function () {
      setStatus('视频加载失败', false);
      showTrigger();
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
