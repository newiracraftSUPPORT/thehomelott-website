/* =========================================================
   Home Lotts — data store
   ------------------------------------------------------------
   Everything the user creates (tickets, notes, settings) is
   stored in this browser only (localStorage). Nothing is sent
   to a server, and demo entries are flagged so they can be
   separated from the user's own tickets at any time.
   ========================================================= */
(function (global) {
  'use strict';

  var KEY = 'homelott.v1';
  var listeners = [];

  function uid(prefix) {
    return (prefix || 't') + '-' + Math.random().toString(36).slice(2, 7) + Date.now().toString(36).slice(-4);
  }

  function defaultState() {
    return {
      version: 1,
      profile: {
        name: 'Sam Whitfield',
        email: 'sam@example.com',
        state: 'QLD',
        region: 'Brisbane & Moreton Bay',
        currency: 'AUD',
        retailer: 'Riverina Community Newsagency',
        digest: 'weekly',
        drawAlerts: true,
        closingAlerts: true,
        resultAlerts: true,
        resultsAutoCheck: true,
        reduceMotion: false,
        demoBanner: true,
        useAffiliateLinks: true,
        affiliateDefault: ''
      },
      tickets: [],
      affiliates: {},
      activity: [],
      seeded: false
    };
  }

  var state = defaultState();

  // ---- persistence ------------------------------------------------------
  function load() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        state = Object.assign(defaultState(), parsed);
        state.profile = Object.assign(defaultState().profile, parsed.profile || {});
        state.tickets = Array.isArray(parsed.tickets) ? parsed.tickets : [];
        state.affiliates = parsed.affiliates || {};
        state.activity = parsed.activity || [];
      }
    } catch (err) {
      state = defaultState();
    }
    if (!state.seeded) { seedDemo(); state.seeded = true; save(); }
    return state;
  }

  function save() {
    try {
      global.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      /* storage full or blocked — the app still works for this session */
    }
    listeners.forEach(function (fn) { fn(state); });
  }

  function onChange(fn) { listeners.push(fn); }

  // ---- demo data --------------------------------------------------------
  function seedDemo() {
    state.tickets = global.HL.demoTickets.map(function (t) {
      var copy = Object.assign({}, t);
      copy.id = uid('t');
      copy.createdAt = t.purchased;
      return copy;
    });
    log('Loaded sample demo portfolio');
  }

  function loadDemo() {
    var have = state.tickets.filter(function (t) { return t.demo; }).length;
    if (have) return 0;
    var added = global.HL.demoTickets.map(function (t) {
      var copy = Object.assign({}, t);
      copy.id = uid('t');
      copy.createdAt = t.purchased;
      return copy;
    });
    state.tickets = state.tickets.concat(added);
    log('Loaded sample demo portfolio');
    save();
    return added.length;
  }

  function clearDemo() {
    var before = state.tickets.length;
    state.tickets = state.tickets.filter(function (t) { return !t.demo; });
    var removed = before - state.tickets.length;
    if (removed) { log('Removed ' + removed + ' demo tickets'); save(); }
    return removed;
  }

  function clearAll() {
    state.tickets = [];
    state.activity = [];
    log('Cleared all saved tickets');
    save();
  }

  // ---- tickets ----------------------------------------------------------
  function listTickets(opts) {
    opts = opts || {};
    var rows = state.tickets.slice();
    if (opts.realOnly) rows = rows.filter(function (t) { return !t.demo; });
    if (opts.demoOnly) rows = rows.filter(function (t) { return t.demo; });
    return rows;
  }

  function getTicket(id) {
    return state.tickets.filter(function (t) { return t.id === id; })[0] || null;
  }

  function normaliseTicket(input) {
    var lottery = global.HL.getLottery(input.lotteryId);
    var draw = input.drawId ? global.HL.getDraw(input.drawId) : (lottery ? global.HL.nextDraw(lottery.id) : null);
    var number = String(input.number || '').replace(/\D/g, '').slice(0, 6);
    while (number.length < 6) number = '0' + number;
    var quantity = Math.max(1, parseInt(input.quantity, 10) || 1);
    var unitPrice = input.unitPrice !== undefined && input.unitPrice !== ''
      ? Math.max(0, parseFloat(input.unitPrice))
      : (lottery ? lottery.price : 0);
    return {
      id: input.id || uid('t'),
      demo: !!input.demo,
      lotteryId: lottery ? lottery.id : null,
      drawId: draw ? draw.id : null,
      number: number,
      quantity: quantity,
      unitPrice: unitPrice,
      purchased: input.purchased || todayISO(),
      retailer: (input.retailer || '').trim(),
      checked: !!input.checked,
      won: !!input.won,
      prizeRank: input.prizeRank || null,
      prizeText: input.prizeText || '',
      prizeValue: input.prizeValue || 0,
      note: (input.note || '').trim(),
      createdAt: input.createdAt || todayISO()
    };
  }

  function addTicket(input) {
    var t = normaliseTicket(input);
    // new ticket on a drawn draw starts unchecked (results to review)
    var draw = global.HL.getDraw(t.drawId);
    if (draw && draw.status === 'drawn') { t.checked = false; t.won = false; }
    state.tickets.push(t);
    log('Added ticket ' + t.number + ' — ' + (global.HL.getLottery(t.lotteryId) || {}).name);
    save();
    return t;
  }

  function updateTicket(id, patch) {
    var t = getTicket(id);
    if (!t) return null;
    var merged = normaliseTicket(Object.assign({}, t, patch, { id: id, demo: t.demo, createdAt: t.createdAt }));
    state.tickets = state.tickets.map(function (x) { return x.id === id ? merged : x; });
    log('Updated ticket ' + merged.number);
    save();
    return merged;
  }

  function removeTicket(id) {
    var t = getTicket(id);
    state.tickets = state.tickets.filter(function (x) { return x.id !== id; });
    if (t) log('Deleted ticket ' + t.number);
    save();
  }

  function setChecked(id, checked) {
    var t = getTicket(id);
    if (!t) return null;
    return updateTicket(id, { checked: checked, won: checked ? !!t.won : false });
  }

  function markWinner(id, tier) {
    return updateTicket(id, { checked: true, won: true, prizeRank: tier ? tier.rank : 1, prizeText: tier ? tier.valueText : '', prizeValue: tier ? tier.value : 0 });
  }

  // ---- affiliate links --------------------------------------------------
  function affiliateFor(lotteryId) {
    var l = global.HL.getLottery(lotteryId);
    var override = state.affiliates[lotteryId];
    if (state.profile.useAffiliateLinks) {
      if (override) return override;
      if (state.profile.affiliateDefault) return state.profile.affiliateDefault;
    }
    return l ? l.enterUrl : null;
  }

  function setAffiliate(lotteryId, url) {
    if (url) state.affiliates[lotteryId] = url; else delete state.affiliates[lotteryId];
    save();
  }

  function affiliateSource(lotteryId) {
    if (!state.profile.useAffiliateLinks) return 'direct';
    if (state.affiliates[lotteryId]) return 'custom';
    if (state.profile.affiliateDefault) return 'default';
    return 'catalogue';
  }

  // ---- matching / results ----------------------------------------------
  function pad(n) { return String(n).padStart(6, '0'); }

  function compare(number, winning) {
    var a = pad(number), b = pad(winning), left = 0, right = 0, i;
    for (i = 0; i < 6; i++) { if (a[i] === b[i]) left++; else break; }
    for (i = 1; i <= 6; i++) { if (a[6 - i] === b[6 - i]) right++; else break; }
    return { left: left, right: right };
  }

  // How close is a ticket to a winning number in a drawn draw?
  function howClose(number, draw) {
    if (!draw || !draw.winningNumbers || !draw.winningNumbers.length) {
      return { digits: 0, from: 'left', nearest: null, diff: null, total: 6 };
    }
    var best = { digits: -1, from: 'left', nearest: null, diff: null };
    draw.winningNumbers.forEach(function (w) {
      var c = compare(number, w);
      var diff = Math.abs(parseInt(pad(number), 10) - parseInt(pad(w), 10));
      var side = c.left >= c.right ? 'left' : 'right';
      var digits = Math.max(c.left, c.right);
      if (digits > best.digits || (digits === best.digits && diff < best.diff)) {
        best = { digits: digits, from: side, nearest: pad(w), diff: diff, lead: c.left, trail: c.right };
      }
    });
    best.total = 6;
    return best;
  }

  function tierFor(lottery, draw, number) {
    var hc = howClose(number, draw);
    var tier = null;
    (lottery.tiers || []).forEach(function (t) {
      if (!tier && hc.digits >= t.match) tier = t;
    });
    var next = (lottery.tiers || []).filter(function (t) { return t.match > hc.digits; })[0] || null;
    return { matched: hc.digits, tier: tier, next: next, howClose: hc };
  }

  // Status a ticket is currently in.
  function statusOf(ticket) {
    var lottery = global.HL.getLottery(ticket.lotteryId);
    var draw = global.HL.getDraw(ticket.drawId) || (lottery ? lottery.mainDraw : null);
    if (!draw) return 'orphan';
    if (draw.status !== 'drawn') return 'upcoming';
    if (!ticket.checked) return 'unclaimed';
    return ticket.won ? 'winner' : 'no-prize';
  }

  // Recompute prize tier for a drawn draw (used for auto-check and comparisons).
  function resolve(ticket) {
    var lottery = global.HL.getLottery(ticket.lotteryId);
    var draw = global.HL.getDraw(ticket.drawId) || (lottery ? lottery.mainDraw : null);
    if (!lottery) return null;
    var res = tierFor(lottery, draw, ticket.number);
    res.lottery = lottery;
    res.draw = draw;
    res.ticket = ticket;
    res.t = ticket;
    res.status = statusOf(ticket);
    res.spend = ticket.quantity * ticket.unitPrice;
    return res;
  }

  function statusLabel(s) {
    return {
      winner: 'Winner',
      'no-prize': 'No prize',
      unclaimed: 'Results available',
      upcoming: 'Upcoming',
      orphan: 'Unknown draw'
    }[s] || s;
  }

  // ---- summaries --------------------------------------------------------
  function summarise() {
    var s = {
      total: 0, active: 0, unclaimed: 0, winners: 0, noPrize: 0,
      upcoming: 0, drawsTracked: 0, spend: 0, prizeValue: 0, ticketCount: 0, demo: 0
    };
    var draws = {};
    state.tickets.forEach(function (t) {
      var r = resolve(t);
      s.total++;
      s.ticketCount += t.quantity;
      s.spend += t.quantity * t.unitPrice;
      if (t.demo) s.demo++;
      if (!r) return;
      draws[t.drawId] = true;
      s[r.status] = (s[r.status] || 0) + 1;
      if (r.status === 'winner') { s.winners++; s.prizeValue += r.t.prizeValue || 0; }
      if (r.status === 'no-prize') s.noPrize++;
    });
    s.active = s.upcoming + s.unclaimed;
    s.drawsTracked = Object.keys(draws).length;
    return s;
  }

  function closestTicket() {
    var best = null;
    state.tickets.forEach(function (t) {
      var r = resolve(t);
      if (!r || r.draw.status !== 'drawn' || r.status === 'winner') return;
      if (!best || r.matched > best.res.matched) best = { t: t, res: r };
    });
    return best;
  }

  function nextDraws() {
    var out = [];
    global.HL.lotteries.forEach(function (l) {
      l.draws.forEach(function (d) {
        if (d.status !== 'drawn') out.push({ lottery: l, draw: d });
      });
    });
    out.sort(function (a, b) { return new Date(a.draw.date) - new Date(b.draw.date); });
    return out;
  }

  // ---- import / export --------------------------------------------------
  function exportJSON() {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      app: 'Home Lotts',
      profile: state.profile,
      tickets: state.tickets,
      affiliates: state.affiliates
    }, null, 2);
  }

  function importJSON(text) {
    var data = JSON.parse(text);
    if (!data || !Array.isArray(data.tickets)) throw new Error('That file does not contain a Home Lotts ticket list.');
    var added = 0;
    data.tickets.forEach(function (t) {
      if (t.id && getTicket(t.id)) return;
      state.tickets.push(normaliseTicket(t));
      added++;
    });
    if (data.profile) state.profile = Object.assign(state.profile, data.profile);
    if (data.affiliates) state.affiliates = Object.assign(state.affiliates, data.affiliates);
    log('Imported ' + added + ' tickets');
    save();
    return added;
  }

  function exportCSV() {
    var head = ['Ticket', 'Lottery', 'Charity', 'State', 'Draw date', 'Quantity', 'Unit price', 'Total paid', 'Status', 'Prize', 'Prize value', 'Retailer', 'Purchased', 'Source'];
    var lines = [head.join(',')];
    state.tickets.forEach(function (t) {
      var r = resolve(t);
      var l = r ? r.lottery : null;
      lines.push([
        t.number,
        l ? l.name : '',
        l ? l.charity : '',
        l ? l.state : '',
        r && r.draw ? r.draw.date : '',
        t.quantity,
        t.unitPrice.toFixed(2),
        (t.quantity * t.unitPrice).toFixed(2),
        r ? statusLabel(r.status) : 'Unknown',
        t.prizeText || '',
        t.prizeValue ? t.prizeValue.toFixed(2) : '',
        t.retailer || '',
        t.purchased || '',
        t.demo ? 'Demo' : 'Own'
      ].map(csvCell).join(','));
    });
    return lines.join('\n');
  }

  function csvCell(v) {
    var s = v === undefined || v === null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  // ---- activity ---------------------------------------------------------
  function log(text) {
    state.activity.unshift({ text: text, at: new Date().toISOString() });
    state.activity = state.activity.slice(0, 25);
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  // ---- profile ----------------------------------------------------------
  function setProfile(patch) {
    state.profile = Object.assign(state.profile, patch);
    save();
  }

  global.HLStore = {
    get state() { return state; },
    load: load, save: save, onChange: onChange,
    listTickets: listTickets, getTicket: getTicket,
    addTicket: addTicket, updateTicket: updateTicket, removeTicket: removeTicket,
    setChecked: setChecked, markWinner: markWinner,
    resolve: resolve, statusOf: statusOf, statusLabel: statusLabel,
    howClose: howClose, tierFor: tierFor, compare: compare, pad: pad,
    summarise: summarise, closestTicket: closestTicket, nextDraws: nextDraws,
    seedDemo: loadDemo, clearDemo: clearDemo, clearAll: clearAll,
    setProfile: setProfile,
    affiliateFor: affiliateFor, setAffiliate: setAffiliate, affiliateSource: affiliateSource,
    exportJSON: exportJSON, importJSON: importJSON, exportCSV: exportCSV,
    todayISO: todayISO
  };
})(window);
