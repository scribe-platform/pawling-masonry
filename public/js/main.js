// Estimate form. Posts to Scribe (the "Estimate Requests" inbox), with
// Cloudflare Turnstile and a retry queue so a request is never lost to a
// dropped connection.
(function () {
  var form = document.getElementById('estimate-form');
  var status = document.getElementById('form-status');
  if (!form) return;

  var site = form.dataset.site;
  var collection = form.dataset.collection;
  var endpoint = form.dataset.endpoint;
  var storageKey = 'scribe_pending_submission_' + site + '_' + collection;

  // Last resorts only. The endpoint puts visitor-facing copy in its error
  // replies, so these cover a reply with nothing usable or no reply at all.
  var GENERIC = "That didn't send. Please try again, or call or text Mark at (717) 286-3170.";
  var UNREACHABLE = "That didn't send yet. It's saved and will try again next time this page loads. To reach Mark now, call or text (717) 286-3170.";

  function say(message, kind) {
    status.textContent = message;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  function thanks(payload) {
    var first = (payload.name || '').split(' ')[0];
    say('Thanks' + (first ? ', ' + first : '') + '. Mark got your request and will be in touch.', 'ok');
  }

  function readPending() { try { return JSON.parse(localStorage.getItem(storageKey)); } catch (e) { return null; } }
  function savePending(p) { try { localStorage.setItem(storageKey, JSON.stringify(p)); } catch (e) {} }
  function clearPending() { try { localStorage.removeItem(storageKey); } catch (e) {} }

  function resetTurnstile() {
    if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} }
  }

  async function send(payload) {
    var url = endpoint + '?site=' + encodeURIComponent(site) + '&collection=' + encodeURIComponent(collection);
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return;
    // The server answered and said why, which is different from never
    // reaching it. Only a 5xx is worth retrying later.
    var body = await res.json().catch(function () { return {}; });
    var error = new Error(((body && body.error) || '').trim() || GENERIC);
    error.answered = true;
    error.retryable = res.status >= 500;
    throw error;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var payload = Object.fromEntries(new FormData(form).entries());
    payload.name = (payload.name || '').trim();
    payload.contact = (payload.contact || '').trim();

    if (!payload.name || !payload.contact) {
      say('Add your name and a phone number or email so Mark can reach you.', 'err');
      return;
    }
    if (!payload['cf-turnstile-response']) {
      say('One moment: the spam check is still loading. Try again in a few seconds.', 'err');
      return;
    }

    say('Sending…');
    try {
      await send(payload);
      clearPending();
      form.reset();
      resetTurnstile();
      thanks(payload);
    } catch (err) {
      // Never claim a success the server didn't give.
      resetTurnstile();
      if (err.answered) {
        if (err.retryable) savePending(payload);
        say(err.message, 'err');
        return;
      }
      savePending(payload);
      say(UNREACHABLE, 'err');
    }
  });

  // Replay a saved request on the next page load.
  (async function retryPending() {
    var pending = readPending();
    if (!pending) return;
    try {
      await send(pending);
      clearPending();
      thanks(pending);
    } catch (err) {
      // A rejection (bad field, expired spam-check token) would fail forever,
      // so drop it and show why. Anything else stays queued.
      if (err.answered && !err.retryable) {
        clearPending();
        say(err.message, 'err');
      }
    }
  })();
})();
