// Helpbase embeddable widget loader. Usage:
//   <script src="https://YOUR-APP/widget.js" data-bot="pub_xxx" defer></script>
// Injects a launcher button + an iframe that hosts the chat UI (style-isolated).
(function () {
  const script = document.currentScript || document.querySelector('script[data-bot]');
  if (!script) return;
  const bot = script.getAttribute('data-bot');
  if (!bot) return;

  const appOrigin = new URL(script.src).origin;
  const host = encodeURIComponent(window.location.origin);
  const DEFAULT_ACCENT = '#c0492c';
  const DEFAULT_ICON = '💬';
  // Near 32-bit max so the launcher sits above stacking contexts on arbitrary host pages.
  const WIDGET_Z_INDEX = '2147483000';
  const FRAME_ID = 'helpbase-frame';
  let isOpen = false;
  let iframe = null;
  // Overridden by the bot's public config (Pro plan) once it loads. closedSvg wins over closedIcon.
  let closedIcon = DEFAULT_ICON;
  let closedSvg = null;

  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Open chat');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', FRAME_ID);
  button.textContent = closedIcon;
  button.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border:none;border-radius:9999px;' +
    'display:flex;align-items:center;justify-content:center;line-height:1;opacity:0;transition:opacity .15s ease;' +
    'background:' +
    DEFAULT_ACCENT +
    ';color:#fff;font-size:24px;cursor:pointer;z-index:' +
    WIDGET_Z_INDEX +
    ';box-shadow:0 6px 20px rgba(0,0,0,.25);';

  // Solar icons render as inline SVG (via innerHTML); a plain emoji renders as text.
  function renderClosed() {
    if (closedSvg) {
      button.innerHTML = closedSvg;
    } else {
      button.textContent = closedIcon;
    }
  }

  function ensureFrame() {
    if (iframe) return iframe;
    iframe = document.createElement('iframe');
    iframe.id = FRAME_ID;
    iframe.title = 'Helpbase chat';
    iframe.src = appOrigin + '/widget/' + encodeURIComponent(bot) + '?o=' + host;
    iframe.style.cssText =
      'position:fixed;bottom:88px;right:20px;width:380px;height:560px;max-width:calc(100vw - 40px);' +
      'max-height:calc(100vh - 120px);border:none;border-radius:16px;background:#fff;display:none;' +
      'z-index:' +
      WIDGET_Z_INDEX +
      ';box-shadow:0 14px 44px rgba(0,0,0,.3);';
    document.body.appendChild(iframe);
    return iframe;
  }

  button.addEventListener('click', function () {
    const frame = ensureFrame();
    isOpen = !isOpen;
    frame.style.display = isOpen ? 'block' : 'none';
    if (isOpen) {
      button.textContent = '×';
    } else {
      renderClosed();
    }
    button.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  document.body.appendChild(button);

  // The launcher starts hidden and is only revealed once styled, so it never flashes the
  // default red/💬 before the bot's config (accent, icon, icon color) loads.
  const reveal = () => {
    button.style.opacity = '1';
  };

  // Sets a style property only when the config supplies a non-empty string for it.
  const setStyle = (prop, value) => {
    if (typeof value === 'string' && value) button.style[prop] = value;
  };

  // Style the launcher from the bot's public config (accent, icon, icon color).
  const applyConfig = (cfg) => {
    setStyle('background', cfg.color);
    setStyle('color', cfg.iconColor);
    if (typeof cfg.launcherSvg === 'string' && cfg.launcherSvg) {
      closedSvg = cfg.launcherSvg;
    } else if (typeof cfg.launcherIcon === 'string' && cfg.launcherIcon) {
      closedIcon = cfg.launcherIcon;
    }
    if (!isOpen) renderClosed();
  };

  fetch(appOrigin + '/api/public/bots/' + encodeURIComponent(bot))
    .then((res) => (res.ok ? res.json() : null))
    .then((cfg) => {
      if (cfg) applyConfig(cfg);
      reveal();
    })
    .catch(reveal);
})();
