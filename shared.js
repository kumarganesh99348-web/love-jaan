// ── shared.js ────────────────────────────────────────────────

// ── Favicon fix (removes 404 console error) ───────────────────
(function(){
  if (document.querySelector('link[rel="icon"]')) return;
  const lnk = document.createElement('link');
  lnk.rel  = 'icon';
  lnk.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💖</text></svg>';
  document.head.appendChild(lnk);
})();

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, duration=2800) {
  let t = document.getElementById('globalToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'globalToast'; t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// ── Pop overlay ───────────────────────────────────────────────
function showPop(icon, title, msg, btnText='Got it 💕', onClose=null) {
  let ov = document.getElementById('globalPop');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'globalPop'; ov.className = 'pop-overlay';
    ov.innerHTML = `<div class="pop-box">
      <span class="pop-icon" id="popIcon"></span>
      <div class="pop-title" id="popTitle"></div>
      <div class="pop-msg" id="popMsg"></div>
      <button class="pop-close" id="popClose"></button>
    </div>`;
    document.body.appendChild(ov);
  }
  document.getElementById('popIcon').textContent  = icon;
  document.getElementById('popTitle').textContent = title;
  document.getElementById('popMsg').innerHTML     = msg;
  document.getElementById('popClose').textContent = btnText;
  ov.classList.add('show');
  document.getElementById('popClose').onclick = () => {
    ov.classList.remove('show');
    if (onClose) onClose();
  };
}

// ── Sparkle ───────────────────────────────────────────────────
function sparkleAt(x, y, count=8) {
  const emojis = ['✨','💫','🌟','💖','🌸','💕'];
  for (let k = 0; k < count; k++) {
    const sp = document.createElement('div');
    sp.style.cssText = `position:fixed;left:${x+(-35+Math.random()*70)}px;top:${y+(-35+Math.random()*70)}px;font-size:${0.8+Math.random()*1.2}rem;pointer-events:none;z-index:9999;animation:sparkleAnim 0.9s ease forwards`;
    sp.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), 900);
  }
}
document.addEventListener('click', e => {
  if (e.target.closest('.pop-overlay') || e.target.closest('.audio-btn')) return;
  sparkleAt(e.clientX, e.clientY, 5);
});

// ── Continuous Music Player ───────────────────────────────────
// Saves position to sessionStorage on every timeupdate.
// On next page load, seeks to saved position BEFORE playing
// so the song never restarts from 0.

const _SONG     = 'sudarshanbeatz-2c25-tum-hi-ho-hindi-song-remix-house-mix-sudarshan-beatz-384024.mp3';
const _POS_KEY  = '_lovePos';
const _PLAY_KEY = '_lovePlaying';

let _audio = null;
let _btn   = null;

function _createAudio() {
  if (_audio) return;
  _audio = document.createElement('audio');
  _audio.src     = _SONG;
  _audio.loop    = true;
  _audio.volume  = 0.75;
  _audio.preload = 'auto';
  document.body.appendChild(_audio);

  // Save position frequently so next page resumes accurately
  _audio.addEventListener('timeupdate', () => {
    sessionStorage.setItem(_POS_KEY, _audio.currentTime);
  });
}

function _resumeAndPlay() {
  _createAudio();
  const saved = parseFloat(sessionStorage.getItem(_POS_KEY) || '0');

  function _doPlay() {
    // Seek first, then play — prevents restart from 0
    if (saved > 0 && Math.abs(_audio.currentTime - saved) > 1) {
      _audio.currentTime = saved;
    }
    _audio.play().then(() => {
      sessionStorage.setItem(_PLAY_KEY, '1');
      if (_btn) _btn.textContent = '🔊';
    }).catch(() => {});
  }

  // If audio is ready to seek, do it immediately
  // Otherwise wait for canplay so currentTime assignment works
  if (_audio.readyState >= 1) {
    _doPlay();
  } else {
    _audio.addEventListener('canplay', _doPlay, { once: true });
  }
}

function _pause() {
  if (!_audio) return;
  _audio.pause();
  sessionStorage.setItem(_PLAY_KEY, '0');
  if (_btn) _btn.textContent = '🎵';
}

// ── setupAudio — called on every page ────────────────────────
function setupAudio(src) {
  function _attach() {
    _btn = document.getElementById('audioBtn');
    if (!_btn) return;

    // Button toggle
    _btn.addEventListener('click', () => {
      if (_audio && !_audio.paused) _pause();
      else _resumeAndPlay();
    });

    // Was already playing on previous page → resume immediately
    if (sessionStorage.getItem(_PLAY_KEY) === '1') {
      _resumeAndPlay();
      return;
    }

    // Very first page — wait for first tap then start
    document.addEventListener('click', function _au() {
      _resumeAndPlay();
      document.removeEventListener('click', _au);
    }, { capture: true, once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _attach);
  } else {
    _attach();
  }
}
