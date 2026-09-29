/* =========================================================
   Home Lotts — interactions: modals, forms, filters, exports
   ------------------------------------------------------------
   All UI wiring lives here: one delegated click handler, one
   delegated submit handler, and one delegated change handler.
   Views only render markup; they never attach listeners.
   ========================================================= */
(function (global) {
  'use strict';
  var A = global.HLApp, H = global.HL, S = global.HLStore;
  var h = A.helpers;
  var ui = A.ui;
  var $ = h.$, $$ = h.$$;

  // ================= render helpers =================
  // Re-render the current route in place, optionally keeping the
  // scroll position and keyboard focus (used while typing in filters).
  function refresh(focusId) {
    A.render({ keepScroll: true });
    if (!focusId) return;
    var el = document.getElementById(focusId);
    if (!el) return;
    el.focus();
    if (el.setSelectionRange && el.type === 'search') {
      try { el.setSelectionRange(el.value.length, el.value.length); } catch (err) { /* unsupported type */ }
    }
  }

  var searchTimers = {};
  function refreshSearch(id, key, ms) {
    clearTimeout(searchTimers[id]);
    searchTimers[id] = setTimeout(function () {
      ui[key] = document.getElementById(id).value;
      refresh(id);
    }, ms || 220);
  }

  // ================= modal plumbing =================
  function openModal(html) {
    var root = $('#modal-root');
    root.innerHTML = '<div class="modal-backdrop" data-action="close-modal">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Dialog">' + html + '</div></div>';
    document.body.style.overflow = 'hidden';
    var first = root.querySelector('input,select,textarea,button');
    if (first) first.focus();
  }
  function closeModal() {
    var root = $('#modal-root');
    if (root) root.innerHTML = '';
    document.body.style.overflow = '';
  }
  function formError(form, msg) {
    var box = form.querySelector('#form-error');
    if (box) { box.textContent = msg; box.style.display = 'block'; }
  }
  function randomNumber() { return ('00000' + Math.floor(Math.random() * 1000000)).slice(-6); }

  // ================= ticket modal =================
  function ticketModal(id, presetLottery) {
    var t = id ? S.getTicket(id) : null;
    var open = H.lotteries.filter(function (x) { return H.nextDraw(x.id).status !== 'drawn'; });
    var l = t ? H.getLottery(t.lotteryId) : (H.getLottery(presetLottery) || open[0]);
    var lotteryId = l ? l.id : '';
    var d = t ? H.getDraw(t.drawId) : (l ? H.nextDraw(l.id) : null);

    openModal('<div class="m-head"><div><h2>' + (t ? 'Edit ticket ' + S.pad(t.number) : 'Add a ticket') + '</h2>' +
      '<p>' + (t ? 'Update the details you recorded for this entry.'
        : 'Record the number printed on your ticket stub. We track the draw, the result and how close you were.') + '</p></div>' +
      '<button class="icon-btn" type="button" data-action="close-modal" aria-label="Close">' + h.ic('x', 17) + '</button></div>' +
      '<form data-form="ticket"' + (t ? ' data-id="' + t.id + '"' : '') + '>' +
      '<div class="m-body"><div class="form-grid">' +
      h.fld('Lottery', 'lotteryId', 'select', lotteryId, '', H.lotteries.map(function (x) {
        var nd = H.nextDraw(x.id);
        return '<option value="' + x.id + '"' + (x.id === lotteryId ? ' selected' : '') + '>' + h.esc(x.charity) + ' — ' +
          h.esc(nd.status === 'drawn' ? 'drawn ' + h.fmtDateShort(nd.date) : 'draws ' + h.fmtDateShort(nd.date)) + '</option>';
      }).join(''), true) +
      h.fld('Draw', 'drawId', 'select', d ? d.id : '', 'Which draw this ticket is in', '', true) +
      h.fld('Ticket number', 'number', 'text', t ? t.number : randomNumber(), 'Six digits, e.g. 402193') +
      h.fld('Quantity', 'quantity', 'number', t ? t.quantity : 1, 'How many stubs in this purchase') +
      h.fld('Price each', 'unitPrice', 'number', t ? t.unitPrice : (l ? l.price : ''), 'Defaults to the listed ticket price') +
      h.fld('Date purchased', 'purchased', 'date', t ? t.purchased : S.todayISO(), '') +
      h.fld('Retailer', 'retailer', 'text', t ? t.retailer : S.state.profile.retailer || '', 'Newsagency, supermarket, online', true) +
      h.fld('Note', 'note', 'textarea', t ? t.note : '', 'Anything you want to remember about this entry', '', true) +
      '</div>' +
      '<div class="row tight" style="margin-top:14px">' +
      '<button class="btn btn--sm btn--ghost" type="button" data-action="random-number">' + h.ic('refresh', 14) + ' Generate a number</button>' +
      '<span id="price-hint" style="font-size:12.5px;color:var(--faint)"></span></div>' +
      '<div class="note plain" style="margin-top:14px"><span class="ic">' + h.ic('info', 16) + '</span><div>' +
      'We match your number against the drawn number as soon as results are published. Home Lotts does not sell tickets or hold your money.</div></div>' +
      '<div id="form-error" class="field-err" style="margin-top:10px;display:none"></div>' +
      '</div>' +
      '<div class="m-foot">' +
      (t ? '<button class="btn btn--danger left" type="button" data-action="delete-ticket" data-id="' + t.id + '">' +
        h.ic('trash', 15) + ' Delete</button>' : '') +
      '<button class="btn btn--ghost" type="button" data-action="close-modal">Cancel</button>' +
      '<button class="btn btn--primary" type="submit">' + (t ? 'Save changes' : 'Add ticket') + '</button>' +
      '</div></form>');

    syncDraws();
  }

  function ticketForm() { return $('form[data-form="ticket"]'); }

  function syncDraws() {
    var form = ticketForm();
    if (!form) return;
    var l = H.getLottery(form.lotteryId.value);
    if (!l) return;
    var current = form.drawId.value;
    form.drawId.innerHTML = l.draws.slice().sort(function (a, b) { return h.parseDate(b.date) - h.parseDate(a.date); })
      .map(function (d) {
        return '<option value="' + d.id + '"' + (d.id === current ? ' selected' : '') + '>' +
          h.fmtDate(d.date) + ' — ' + (d.status === 'drawn' ? 'already drawn' : 'upcoming') + '</option>';
      }).join('');
    if (!l.draws.some(function (d) { return d.id === current; })) {
      var next = H.nextDraw(l.id);
      if (next) form.drawId.value = next.id;
    }
    if (!form.dataset.touchedPrice) form.unitPrice.value = l.price;
    updatePriceHint();
  }

  function updatePriceHint() {
    var form = ticketForm();
    var hint = $('#price-hint');
    if (!form || !hint) return;
    hint.textContent = 'Total for this entry: ' +
      h.money((parseInt(form.quantity.value, 10) || 0) * (parseFloat(form.unitPrice.value) || 0));
  }

  // ================= prize tier modal =================
  function tierModal(id) {
    var t = S.getTicket(id);
    if (!t) return;
    var res = S.resolve(t);
    var l = res.lottery;
    openModal('<div class="m-head"><div><h2>Record the prize</h2><p>Ticket ' + S.pad(t.number) + ' · ' +
      h.esc(l.charity) + ' · ' + res.matched + ' of 6 digits matched</p></div>' +
      '<button class="icon-btn" type="button" data-action="close-modal" aria-label="Close">' + h.ic('x', 17) + '</button></div>' +
      '<form data-form="set-tier" data-id="' + id + '"><div class="m-body"><div class="radio-cards">' +
      l.tiers.map(function (x) {
        return '<label class="radio-card"><input type="radio" name="tier" value="' + x.rank + '"' +
          (t.prizeRank === x.rank ? ' checked' : '') + '><span><span class="rc-t">' + h.esc(x.label) + ' — ' +
          h.esc(x.valueText) + '</span><span class="rc-d">Match ' + x.match + ' of 6 digits · you matched ' +
          res.matched + '</span></span></label>';
      }).join('') +
      '<label class="radio-card"><input type="radio" name="tier" value="0"' + (t.prizeRank ? '' : ' checked') + '>' +
      '<span><span class="rc-t">No prize</span><span class="rc-d">Record this ticket as checked with no win</span></span></label>' +
      '</div>' +
      '<div class="note plain" style="margin-top:16px"><span class="ic">' + h.ic('info', 16) + '</span><div>' +
      'Home Lotts records what you tell it. Prize claims are made directly with the organiser — we do not handle claims or payments.</div></div>' +
      '</div><div class="m-foot"><button class="btn btn--ghost" type="button" data-action="close-modal">Cancel</button>' +
      '<button class="btn btn--primary" type="submit">Save result</button></div></form>');
  }

  // ================= confirm modal =================
  function confirmModal(title, body, label, action, attrs) {
    openModal('<div class="m-head"><div><h2>' + h.esc(title) + '</h2><p>' + h.esc(body) + '</p></div>' +
      '<button class="icon-btn" type="button" data-action="close-modal" aria-label="Close">' + h.ic('x', 17) + '</button></div>' +
      '<div class="m-foot"><button class="btn btn--ghost" type="button" data-action="close-modal">Cancel</button>' +
      '<button class="btn btn--primary" type="button" data-action="' + action + '"' + (attrs || '') + '>' +
      h.esc(label) + '</button></div>');
  }

  // ================= report modal =================
  function reportModal(lotteryId, ticketId) {
    openModal('<div class="m-head"><div><h2>Report a problem</h2><p>Tell us what looks wrong and we will check it against the organiser’s draw sheet.</p></div>' +
      '<button class="icon-btn" type="button" data-action="close-modal" aria-label="Close">' + h.ic('x', 17) + '</button></div>' +
      '<form data-form="report"><div class="m-body"><div class="form-grid">' +
      h.fld('Type of issue', 'kind', 'select', 'result', '', ['result', 'details', 'draw-date', 'link', 'other'].map(function (k) {
        return '<option value="' + k + '">' + k.replace(/-/g, ' ') + '</option>';
      }).join(''), true) +
      h.fld('Lottery', 'lotteryId', 'select', lotteryId || '', '', '<option value="">— not sure —</option>' +
        H.lotteries.map(function (x) {
          return '<option value="' + x.id + '"' + (x.id === lotteryId ? ' selected' : '') + '>' + h.esc(x.charity) + '</option>';
        }).join(''), true) +
      h.fld('Ticket number', 'number', 'text', ticketId && S.getTicket(ticketId) ? S.getTicket(ticketId).number : '', 'If it is about a specific ticket', '', true) +
      h.fld('What did you find?', 'detail', 'textarea', '', 'For example: the number on the organiser’s page is different from the one shown here', '', true) +
      h.fld('Your email (optional)', 'email', 'email', S.state.profile.email || '', 'Only if you would like a reply', '', true) +
      '</div><div id="form-error" class="field-err" style="margin-top:10px;display:none"></div></div>' +
      '<div class="m-foot"><button class="btn btn--ghost" type="button" data-action="close-modal">Cancel</button>' +
      '<button class="btn btn--primary" type="submit">Send report</button></div></form>');
  }

  // ================= actions =================
  function logOutbound(lotteryId) {
    var l = H.getLottery(lotteryId);
    S.state.activity.unshift({ text: 'Opened the organiser site for ' + (l ? l.charity : 'a lottery'), at: new Date().toISOString() });
    S.state.activity = S.state.activity.slice(0, 25);
    S.save();
  }

  function checkOne(id) {
    var t = S.getTicket(id);
    if (!t) return;
    var res = S.resolve(t);
    if (!res.draw || res.draw.status !== 'drawn') {
      A.toast('That draw has not been held yet, so there is nothing to check.', 'warn');
      return;
    }
    var r = S.tierFor(res.lottery, res.draw, t.number);
    if (r.tier) {
      S.markWinner(id, r.tier);
      A.toast('Winner recorded — ' + r.tier.valueText + ' (' + r.tier.label + ').');
    } else {
      S.updateTicket(id, { checked: true, won: false, prizeRank: null, prizeText: '', prizeValue: 0 });
      A.toast('Checked: no prize. ' + r.matched + ' of 6 digits matched ' + r.howClose.nearest + '.');
    }
  }

  function download(filename, content, type) {
    var blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function toggleIn(arr, val) {
    var i = arr.indexOf(val);
    if (i > -1) arr.splice(i, 1); else arr.push(val);
  }

  var SETTING_LABELS = {
    drawAlerts: 'Draw reminders',
    closingAlerts: 'Closing soon alerts',
    resultAlerts: 'Result alerts',
    resultsAutoCheck: 'Auto-check',
    reduceMotion: 'Reduce motion',
    demoBanner: 'Demo banner',
    useAffiliateLinks: 'Custom links'
  };

  var handlers = {
    'open-drawer': function () { A.openDrawer(); },
    'close-drawer': function () { A.closeDrawer(); },
    'close-modal': function (el, e) {
      if (el.classList.contains('modal-backdrop') && e.target !== el) return;
      closeModal();
    },

    'enter': function (el) { logOutbound(el.getAttribute('data-lottery')); },

    'add-ticket': function (el) { ticketModal(null, el.getAttribute('data-lottery')); },
    'edit-ticket': function (el) { ticketModal(el.getAttribute('data-id')); },
    'random-number': function () {
      var form = ticketForm();
      if (form) form.number.value = randomNumber();
    },

    'delete-ticket': function (el) {
      var t = S.getTicket(el.getAttribute('data-id'));
      if (!t) return;
      var l = H.getLottery(t.lotteryId) || {};
      closeModal();
      confirmModal('Delete this ticket?',
        'Ticket ' + S.pad(t.number) + ' from ' + (l.charity || 'this lottery') + ' will be removed from this browser. This cannot be undone.',
        'Delete ticket', 'confirm-delete', ' data-id="' + t.id + '"');
    },
    'confirm-delete': function (el) {
      S.removeTicket(el.getAttribute('data-id'));
      closeModal();
      A.toast('Ticket deleted.');
      if (A.route.name === 'ticket') location.hash = '#/tickets';
      else refresh();
    },

    'check-ticket': function (el) { checkOne(el.getAttribute('data-id')); refresh(); },

    'check-all': function () {
      var waiting = S.listTickets().map(function (t) { return S.resolve(t); })
        .filter(function (r) { return r && r.status === 'unclaimed'; });
      var wins = 0;
      waiting.forEach(function (r) {
        var t = r.ticket;
        var m = S.tierFor(r.lottery, r.draw, t.number);
        if (m.tier) { S.markWinner(t.id, m.tier); wins++; }
        else S.updateTicket(t.id, { checked: true, won: false, prizeRank: null, prizeText: '', prizeValue: 0 });
      });
      if (!waiting.length) { A.toast('Nothing to check — no tickets are waiting on a result.', 'warn'); return; }
      A.toast('Checked ' + waiting.length + ' ticket' + (waiting.length === 1 ? '' : 's') + ' — ' + wins + ' winner' + (wins === 1 ? '' : 's') + '.');
      refresh();
    },

    'uncheck-ticket': function (el) {
      S.updateTicket(el.getAttribute('data-id'), { checked: false, won: false, prizeRank: null, prizeText: '', prizeValue: 0 });
      A.toast('Result re-opened — check it again any time.', 'warn');
      refresh();
    },

    'set-tier': function (el) { tierModal(el.getAttribute('data-id')); },

    'copy': function (el) {
      var v = el.getAttribute('data-value');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(
          function () { A.toast('Copied ' + v + ' to your clipboard.'); },
          function () { A.toast('Could not copy automatically — the number is ' + v, 'warn'); });
      } else { A.toast('Ticket number: ' + v); }
    },

    'print': function () { global.print(); },

    'report': function (el) { reportModal(el.getAttribute('data-lottery'), el.getAttribute('data-ticket')); },

    'notify-me': function (el) {
      S.setProfile({ drawAlerts: true, resultAlerts: true });
      A.toast('Reminders switched on for ' + (H.getLottery(el.getAttribute('data-lottery')) || {}).charity + '.');
      refresh();
    },

    'export-csv': function () { download('home-lotts-tickets.csv', S.exportCSV(), 'text/csv;charset=utf-8'); A.toast('CSV exported.'); },
    'export-json': function () { download('home-lotts-backup.json', S.exportJSON(), 'application/json'); A.toast('Backup downloaded.'); },
    'import-json': function () { $('#import-file').click(); },

    'load-demo': function () {
      var n = S.seedDemo();
      A.toast(n ? 'Loaded ' + n + ' sample tickets.' : 'Sample tickets are already loaded.');
      refresh();
    },
    'clear-demo': function () {
      var n = S.clearDemo();
      A.toast(n ? 'Removed ' + n + ' demo tickets.' : 'No demo tickets to remove.', 'warn');
      refresh();
    },
    'clear-all': function () {
      var n = S.listTickets().length;
      confirmModal('Delete every ticket?',
        'All ' + n + ' entries will be removed from this browser. Export a backup first if you might want them later.',
        'Delete everything', 'confirm-clear-all', '');
    },
    'confirm-clear-all': function () {
      S.clearAll();
      closeModal();
      A.toast('All tickets deleted.', 'warn');
      refresh();
    },

    'clear-affiliate': function (el) {
      S.setAffiliate(el.getAttribute('data-lottery'), '');
      A.toast('Link reset to the catalogue default.');
      refresh();
    },
    'clear-affiliate-default': function () {
      S.setProfile({ affiliateDefault: '' });
      A.toast('Default affiliate link removed.');
      refresh();
    },

    'dismiss-banner': function () {
      S.setProfile({ demoBanner: false });
      A.toast('Banner hidden — switch it back on in Profile.');
    },

    'ticket-tab': function (el) { ui.ticketTab = el.getAttribute('data-tab'); refresh(); },
    'clear-ticket-filters': function () {
      ui.ticketTab = 'all'; ui.ticketQ = ''; ui.ticketLottery = ''; ui.ticketSort = 'draw';
      refresh();
    },
    'res-mine': function () { ui.resMine = !ui.resMine; refresh(); },
    'draw-mine': function () { ui.drawMine = !ui.drawMine; refresh(); },
    'clear-draw-filters': function () {
      ui.drawQ = ''; ui.drawState = ''; ui.drawSort = 'soon'; ui.drawMine = false;
      refresh();
    },
    'lot-state': function (el) { toggleIn(ui.lotStates, el.getAttribute('data-state')); refresh(); },
    'lot-cat': function (el) { toggleIn(ui.lotCats, el.getAttribute('data-cat')); refresh(); },
    'lot-soon': function () { ui.lotSoon = !ui.lotSoon; refresh(); },
    'lot-view': function (el) { ui.lotView = el.getAttribute('data-view'); refresh(); },
    'clear-lot-filters': function () {
      ui.lotQ = ''; ui.lotStates = []; ui.lotCats = []; ui.lotPrice = 'all';
      ui.lotSort = 'closing'; ui.lotSoon = false; ui.lotView = 'grid';
      refresh();
    }
  };

  // ================= delegated click =================
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el) return;
    var name = el.getAttribute('data-action');
    var fn = handlers[name];
    if (!fn) return;
    // the affiliate link is a real outbound link: never cancel it
    if (name !== 'enter') e.preventDefault();
    fn(el, e);
  });

  // ================= delegated submit =================
  document.addEventListener('submit', function (e) {
    var form = e.target;
    var kind = form.getAttribute('data-form');
    if (!kind) return;
    e.preventDefault();

    if (kind === 'ticket') {
      var number = form.number.value.replace(/\D/g, '');
      if (number.length !== 6) return formError(form, 'Enter the full six-digit ticket number from your stub.');
      if (!form.lotteryId.value) return formError(form, 'Choose which lottery this ticket is for.');
      var payload = {
        lotteryId: form.lotteryId.value,
        drawId: form.drawId.value,
        number: number,
        quantity: parseInt(form.quantity.value, 10) || 1,
        unitPrice: form.unitPrice.value === '' ? undefined : parseFloat(form.unitPrice.value),
        purchased: form.purchased.value || S.todayISO(),
        retailer: form.retailer.value,
        note: form.note.value
      };
      var id = form.getAttribute('data-id');
      if (id) {
        S.updateTicket(id, payload);
        closeModal();
        A.toast('Ticket ' + S.pad(number) + ' updated.');
      } else {
        var created = S.addTicket(payload);
        closeModal();
        A.toast('Ticket ' + S.pad(created.number) + ' added — we will track the draw for you.');
      }
      refresh();
      return;
    }

    if (kind === 'set-tier') {
      var tid = form.getAttribute('data-id');
      var rank = parseInt(form.tier.value, 10);
      if (!rank) {
        S.updateTicket(tid, { checked: true, won: false, prizeRank: null, prizeText: '', prizeValue: 0 });
        A.toast('Recorded as no prize.', 'warn');
      } else {
        var t = S.getTicket(tid);
        var chosen = (t ? H.getLottery(t.lotteryId).tiers : []).filter(function (x) { return x.rank === rank; })[0];
        if (!chosen) return formError(form, 'That prize tier is not available for this lottery.');
        S.markWinner(tid, chosen);
        A.toast('Prize recorded: ' + chosen.valueText + '.');
      }
      closeModal();
      refresh();
      return;
    }

    if (kind === 'profile') {
      S.setProfile({
        name: form.name.value.trim() || 'Sam Whitfield',
        email: form.email.value.trim(),
        state: form.state.value,
        region: form.region.value.trim(),
        retailer: form.retailer.value.trim(),
        digest: form.digest.value
      });
      A.toast('Details saved.');
      refresh();
      return;
    }

    if (kind === 'affiliate-default') {
      S.setProfile({ affiliateDefault: form.affiliateDefault.value.trim() });
      A.toast('Default affiliate link saved.');
      refresh();
      return;
    }

    if (kind === 'affiliate') {
      S.setAffiliate(form.getAttribute('data-lottery'), form.url.value.trim());
      A.toast('Link saved for that lottery.');
      refresh();
      return;
    }

    if (kind === 'report') {
      if (!form.detail.value.trim()) return formError(form, 'Tell us briefly what looks wrong.');
      closeModal();
      A.toast('Thanks — this demo build records the report locally instead of emailing it.');
    }
  });

  // ================= delegated input =================
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'tq') refreshSearch('tq', 'ticketQ');
    else if (el.id === 'rq') refreshSearch('rq', 'resQ');
    else if (el.id === 'dq') refreshSearch('dq', 'drawQ');
    else if (el.id === 'lq') refreshSearch('lq', 'lotQ');
    else if (el.form && el.form.getAttribute('data-form') === 'ticket' &&
      (el.name === 'quantity' || el.name === 'unitPrice')) updatePriceHint();
  });

  // ================= delegated change =================
  document.addEventListener('change', function (e) {
    var el = e.target;
    var id = el.id;

    if (id === 'tlot') { ui.ticketLottery = el.value; refresh('tlot'); return; }
    if (id === 'tsort') { ui.ticketSort = el.value; refresh('tsort'); return; }
    if (id === 'rlot') { ui.resLottery = el.value; refresh('rlot'); return; }
    if (id === 'dstate') { ui.drawState = el.value; refresh('dstate'); return; }
    if (id === 'dsort') { ui.drawSort = el.value; refresh('dsort'); return; }
    if (id === 'lprice') { ui.lotPrice = el.value; refresh('lprice'); return; }
    if (id === 'lsort') { ui.lotSort = el.value; refresh('lsort'); return; }

    if (el.getAttribute && el.getAttribute('data-setting')) {
      var key = el.getAttribute('data-setting');
      var patch = {};
      patch[key] = el.checked;
      S.setProfile(patch);
      A.toast((SETTING_LABELS[key] || 'Setting') + (el.checked ? ' on' : ' off'));
      refresh();
      return;
    }

    if (el.name === 'unitPrice' && el.form && el.form.getAttribute('data-form') === 'ticket') {
      el.form.dataset.touchedPrice = '1';
      return;
    }
    if (el.name === 'lotteryId' && el.form && el.form.getAttribute('data-form') === 'ticket') {
      el.form.dataset.touchedPrice = '';
      syncDraws();
      return;
    }
    if (el.name === 'quantity' && el.form && el.form.getAttribute('data-form') === 'ticket') {
      updatePriceHint();
      return;
    }

    if (id === 'import-file' && el.files && el.files[0]) {
      var file = el.files[0];
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var n = S.importJSON(String(reader.result));
          A.toast('Imported ' + n + ' ticket' + (n === 1 ? '' : 's') + '.');
          refresh();
        } catch (err) {
          A.toast('Could not import that file — ' + err.message, 'warn');
        }
      };
      reader.readAsText(file);
    }
  });

  // ================= keyboard =================
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (($('#modal-root') || {}).innerHTML) closeModal();
    else A.closeDrawer();
  });

  // ================= live countdowns =================
  setInterval(function () {
    var boxes = $$('[data-countdown]');
    if (!boxes.length) return;
    if (S.state.profile.reduceMotion) return;
    boxes.forEach(function (box) {
      var target = { date: box.getAttribute('data-countdown'), time: box.getAttribute('data-time') };
      var html = h.countdownHtml(target);
      if (html && html !== box.innerHTML) box.innerHTML = html;
    });
  }, 1000);
})(window);
