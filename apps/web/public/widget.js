// Helpbase embeddable widget loader. Usage:
//   <script src="https://YOUR-APP/widget.js" data-bot="pub_xxx" defer></script>
// Injects a launcher button + an iframe that hosts the chat UI (style-isolated).
(function () {
  var script = document.currentScript || document.querySelector('script[data-bot]');
  if (!script) return;
  var bot = script.getAttribute('data-bot');
  if (!bot) return;

  var appOrigin = new URL(script.src).origin;
  var host = encodeURIComponent(window.location.origin);
  var DEFAULT_ACCENT = '#c0492c';
  // Near 32-bit max so the launcher sits above stacking contexts on arbitrary host pages.
  var WIDGET_Z_INDEX = '2147483000';
  var FRAME_ID = 'helpbase-frame';
  var isOpen = false;
  var iframe = null;

  var button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Open chat');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', FRAME_ID);
  button.textContent = '💬';
  button.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border:none;border-radius:9999px;' +
    'background:' +
    DEFAULT_ACCENT +
    ';color:#fff;font-size:24px;cursor:pointer;z-index:' +
    WIDGET_Z_INDEX +
    ';box-shadow:0 6px 20px rgba(0,0,0,.25);';

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
    var frame = ensureFrame();
    isOpen = !isOpen;
    frame.style.display = isOpen ? 'block' : 'none';
    button.textContent = isOpen ? '×' : '💬';
    button.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  document.body.appendChild(button);
})();
