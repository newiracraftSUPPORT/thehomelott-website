/* =========================================================
   Home Lotts — core: helpers, icons, router, shell
   ========================================================= */
(function (global) {
  'use strict';

  var H = global.HL;
  var S = global.HLStore;

  // ================= helpers =================
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function money(n) {
    var v = Number(n || 0);
    return '$' + v.toLocaleString('en-AU', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(v) ? 0 : 2 });
  }
  function moneyShort(n) {
    var v = Number(n || 0);
    if (v >= 1000000) return '$' + (v / 1000000).toFixed(v % 1000000 ? 1 : 0) + 'M';
    if (v >= 1000) return '$' + Math.round(v / 1000) + 'k';
    return '$' + v;
  }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function parseDate(s) { return new Date(s + 'T00:00:00'); }
  function fmtDate(s) {
    if (!s) return '—';
    var d = parseDate(s);
    return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtDateShort(s) {
    if (!s) return '—';
    var d = parseDate(s);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  function fmtMonth(s) { var d = parseDate(s); return MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function daysUntil(s) {
    var t = parseDate(s); t.setHours(0, 0, 0, 0);
    var n = new Date(); n.setHours(0, 0, 0, 0);
    return Math.round((t - n) / 86400000);
  }
  function relative(s) {
    var d = daysUntil(s);
    if (d === 0) return 'today';
    if (d === 1) return 'tomorrow';
    if (d === -1) return 'yesterday';
    if (d < 0) return Math.abs(d) + ' days ago';
    return 'in ' + d + ' days';
  }
  function drawMoment(draw) {
    var m = String(draw.time || '').match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    var d = parseDate(draw.date);
    if (m) {
      var h = parseInt(m[1], 10) % 12;
      if (/pm/i.test(m[3])) h += 12;
      d.setHours(h, parseInt(m[2], 10), 0, 0);
    } else { d.setHours(19, 0, 0, 0); }
    return d;
  }
  function cd(n, l) { return '<div class="cd"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }
  function countdownHtml(target, light) {
    var ms = drawMoment(target) - new Date();
    if (ms < 0) return '<span class="badge badge--soft">Draw complete</span>';
    var d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24;
    var m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    return '<div class="countdown' + (light ? ' light' : '') + '" data-countdown="' + esc(target.date) +
      '" data-time="' + esc(target.time || '') + '">' + cd(d, 'days') + cd(h, 'hrs') + cd(m, 'min') + cd(s, 'sec') + '</div>';
  }
  function unique(v, i, a) { return a.indexOf(v) === i; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

  // ================= icons =================
  var PATHS = {
    home: 'M5.5 9.8V20.5h13V9.8M3.5 11.5 12 4.2l8.5 7.3',
    ticket: 'M4.5 8.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1.6a2.2 2.2 0 0 0 0 4.4v1.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-1.5a2.2 2.2 0 0 0 0-4.4z M14.5 6.5v11',
    award: 'M12 3.5a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2z M8.8 12.2 7.3 20.5 12 17.6l4.7 2.9-1.5-8.3',
    calendar: 'M4 6.5h16v14H4z M4 10.5h16 M8.5 4v4 M15.5 4v4',
    grid: 'M4 4.5h6.5v6.5H4z M13.5 4.5H20v6.5h-6.5z M4 13.5h6.5V20H4z M13.5 13.5H20V20h-6.5z',
    list: 'M8.5 6.5h12 M8.5 12h12 M8.5 17.5h12 M4 6.5h.01 M4 12h.01 M4 17.5h.01',
    user: 'M12 11.5a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6z M4.5 20.5c0-3.9 3.4-6 7.5-6s7.5 2.1 7.5 6',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M16.2 16.2 21 21',
    plus: 'M12 5v14 M5 12h14',
    check: 'M4.8 12.6 9.6 17.4 19.4 7',
    x: 'M6 6l12 12 M18 6 6 18',
    chevron: 'M9.5 5.5 16 12l-6.5 6.5',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7.2V12l3.2 2',
    alert: 'M12 4 2.8 20h18.4z M12 10v4.2 M12 17.6h.01',
    trash: 'M4.5 7h15 M9.5 7V4.5h5V7 M6.5 7l1 13h9l1-13 M10.5 10.5v6 M13.5 10.5v6',
    edit: 'M4 20h4.2L20 8.2 15.8 4 4 15.8z M14.5 5.3 18.7 9.5',
    download: 'M12 4v11.5 M7.2 11.4 12 16.2l4.8-4.8 M4.5 20h15',
    upload: 'M12 16.5V5 M7.2 9.8 12 5l4.8 4.8 M4.5 20h15',
    shield: 'M12 3.2l7.5 2.8v5.6c0 4.6-3.2 7.9-7.5 9.2-4.3-1.3-7.5-4.6-7.5-9.2V6z M9 12l2.2 2.2 4-4.2',
    link: 'M13.6 10.4a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.3 1.3 M10.4 13.6a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.3-1.3',
    external: 'M14 4.5h5.5V10 M19.5 4.5 11 13 M18 14v4.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4.5',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5.2 M12 7.8h.01',
    menu: 'M4 7h16 M4 12h16 M4 17h16',
    car: 'M4.5 16.2v-3l2-5.2h11l2 5.2v3 M3 16.2h18 M4 16.2h3.2v2.3H4z M16.8 16.2H20v2.3h-3.2z M7.2 11.4h9.6',
    suitcase: 'M4 7.5h16v12H4z M8.5 7.5V5.6A1.6 1.6 0 0 1 10 4h4a1.6 1.6 0 0 1 1.6 1.6v1.9 M4 12.5h16',
    gift: 'M4 11h16v9H4z M3 7.5h18V11H3z M12 7.5V20 M12 7.5S9.4 3.5 7 3.5a2 2 0 0 0 0 4z M12 7.5s2.6-4 5-4a2 2 0 0 1 0 4z',
    dollar: 'M12 3.5v17 M16.4 7.6c0-1.7-1.9-2.6-4.4-2.6s-4.4.9-4.4 2.6 1.9 2.2 4.4 2.6 4.4 1 4.4 2.6-1.9 2.6-4.4 2.6-4.4-.9-4.4-2.6',
    pin: 'M12 20.5s7-5.4 7-11.1A7 7 0 1 0 5 9.4c0 5.7 7 11.1 7 11.1z M12 12.5a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z',
    lock: 'M5 11.5h14v9H5z M8.2 11.5V8a3.8 3.8 0 0 1 7.6 0v3.5 M12 15.5v2',
    mail: 'M3.5 5.5h17v13h-17z M3.8 6.2 12 12.6l8.2-6.4',
    arrow: 'M4.5 12h14 M13 6.5 18.5 12 13 17.5',
    refresh: 'M20 12a8 8 0 1 1-2.6-5.9 M20 3.5V9h-5.5',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z',
    trend: 'M4 16.5 9 11l3.5 3.5L20 7 M15.5 7H20v4.5',
    star: 'M12 3.8 14.5 9l5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4L9.5 9z',
    heart: 'M12 20.3s-7.2-4.3-7.2-9.4A3.9 3.9 0 0 1 12 8.2a3.9 3.9 0 0 1 7.2 2.7c0 5.1-7.2 9.4-7.2 9.4z',
    leaf: 'M20 4C10 4 4 8 4 14.2A5 5 0 0 0 9 19c6 0 11-6 11-15z M5.5 19.5c2.8-4 6-6.4 11-8.5',
    file: 'M6.5 3.5h7L18 8v12.5H6.5z M13.5 3.5V8H18',
    bell: 'M18 9.5a6 6 0 0 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5 M10.2 19.5a2 2 0 0 0 3.6 0',
    spark: 'M12 3.5 13.8 9 19 10.8 13.8 12.6 12 18.2 10.2 12.6 5 10.8 10.2 9z',
    copy: 'M9 9.2h10.2v10.2H9z M15.2 6.5A2 2 0 0 0 13.2 5H5.5v10.2a2 2 0 0 0 1.5 1.9',
    printer: 'M7 9.5V4h10v5.5 M4.5 9.5h15V17h-15z M7 14h10v6H7z',
    eye: 'M2.5 12S6.5 5.8 12 5.8 21.5 12 21.5 12 17.5 18.2 12 18.2 2.5 12 2.5 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    filter: 'M4 6h16 M7 12h10 M10 18h4',
    share: 'M12 16.5V4.5 M7.5 9 12 4.5 16.5 9 M5.5 14.5v4.5h13v-4.5'
  };
  function ic(name, size) {
    var p = PATHS[name] || PATHS.info;
    var s = size || 18;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + p + '"/></svg>';
  }
  function catIcon(id, size) {
    var c = (H.categories.filter(function (x) { return x.id === id; })[0] || {}).icon || 'gift';
    return ic(c, size || 14);
  }
  function catLabel(id) {
    return (H.categories.filter(function (x) { return x.id === id; })[0] || {}).label || id;
  }
  function artBg(art) { return 'art-' + (art || 'teal'); }

  // ================= navigation =================
  var NAV = [
    { id: 'home', href: '#/home', label: 'Home', icon: 'home' },
    { id: 'tickets', href: '#/tickets', label: 'My tickets', icon: 'ticket' },
    { id: 'results', href: '#/results', label: 'Results', icon: 'award' },
    { id: 'draws', href: '#/draws', label: 'Upcoming draws', icon: 'calendar' },
    { id: 'lotteries', href: '#/lotteries', label: 'Lotteries', icon: 'grid' },
    { id: 'profile', href: '#/profile', label: 'Profile', icon: 'user' }
  ];
  var MOB = ['home', 'tickets', 'draws', 'lotteries', 'profile'];
  var TITLES = {
    home: 'Home', tickets: 'My tickets', ticket: 'Ticket', results: 'Results',
    draws: 'Upcoming draws', lotteries: 'Lotteries', lottery: 'Lottery', profile: 'Profile', '404': 'Not found'
  };
  var ROUTES = ['home', 'tickets', 'ticket', 'results', 'draws', 'lotteries', 'lottery', 'profile'];

  function parseRoute() {
    var hash = location.hash.replace(/^#\/?/, '');
    var qi = hash.indexOf('?');
    var query = {};
    if (qi > -1) {
      hash.slice(qi + 1).split('&').forEach(function (pair) {
        var kv = pair.split('=');
        if (kv[0]) query[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      });
      hash = hash.slice(0, qi);
    }
    var parts = hash.split('/').filter(Boolean);
    var name = parts[0] || 'home';
    if (ROUTES.indexOf(name) === -1) name = '404';
    return { name: name, param: parts[1] || null, query: query };
  }

  // ================= shared view bits =================
  function statusBadge(status) {
    var map = {
      winner: ['badge--win', 'Winner'],
      'no-prize': ['badge--lost', 'No prize'],
      unclaimed: ['badge--pending', 'Results available'],
      upcoming: ['badge--soon', 'Upcoming']
    };
    var m = map[status] || ['badge--soft', S.statusLabel(status)];
    return '<span class="badge ' + m[0] + '"><span class="pip"></span>' + m[1] + '</span>';
  }
  function demoChip(tip) {
    return '<span class="badge badge--demo" title="' + esc(tip || 'Sample data') + '">DEMO</span>';
  }
  function howCloseBlock(res) {
    if (!res || !res.draw) return '';
    var hc = res.howClose;
    if (res.draw.status !== 'drawn') {
      return '<div class="howclose"><div class="top"><span class="val">' + esc(relative(res.draw.date)) + '</span>' +
        '<span class="lbl">until the draw</span></div>' +
        '<div class="meter"><i style="width:0%"></i></div>' +
        '<span class="lbl">' + fmtDate(res.draw.date) + (res.draw.time ? ' · ' + esc(res.draw.time) : '') + '</span></div>';
    }
    var digits = '';
    for (var i = 0; i < 6; i++) {
      digits += '<i class="' + (i < hc.digits ? 'on' : '') + '">' + S.pad(res.ticket.number)[i] + '</i>';
    }
    var pct = Math.round((hc.digits / 6) * 100);
    var meter = 'meter' + (res.status === 'winner' ? ' win' : (res.status === 'unclaimed' ? ' pending' : ' lost'));
    var head = hc.digits + '/6';
    var label;
    if (res.status === 'winner') label = 'Full match on drawn number ' + esc(hc.nearest);
    else if (res.tier) label = hc.digits + ' of 6 digits matched';
    else label = hc.digits + ' of 6 digits matched';
    var sub;
    if (res.status === 'winner') sub = '<span class="lbl">' + esc(res.t.prizeText || (res.tier ? res.tier.valueText : 'Prize won')) + '</span>';
    else if (res.tier) sub = '<span class="lbl">Tier: ' + esc(res.tier.label) + ' — ' + esc(res.tier.valueText) + '</span>';
    else sub = '<span class="lbl">Closest drawn number ' + esc(hc.nearest) + ' (' + hc.digits + ' leading digits)</span>';
    var next = res.next
      ? '<span class="lbl">' + (res.next.match - hc.digits) + ' more leading digit' + ((res.next.match - hc.digits) > 1 ? 's' : '') +
        ' for ' + esc(res.next.label.toLowerCase()) + ' (' + esc(res.next.valueText) + ')</span>'
      : '';
    return '<div class="howclose"><div class="top"><span class="val">' + head + '</span><span class="lbl">' + label + '</span></div>' +
      '<div class="' + meter + '"><i style="width:' + pct + '%"></i></div>' + sub +
      '<div class="digits">' + digits + '</div>' + next + '</div>';
  }
  function enterButton(lottery, size) {
    if (!lottery) return '';
    var sm = size === 'sm' ? 'btn--sm ' : '';
    var url = S.affiliateFor(lottery.id);
    if (!url) return '<a class="btn ' + sm + 'btn--ghost" href="#/lotteries/' + esc(lottery.id) + '">View draw details</a>';
    return '<a class="btn ' + sm + 'btn--primary" data-action="enter" data-lottery="' + esc(lottery.id) + '" href="' + esc(url) +
      '" target="_blank" rel="noopener sponsored nofollow">ENTER NEXT DRAW ' + ic('arrow', 15) + '</a>';
  }
  function pageHead(eyebrow, title, sub, actions) {
    return '<div class="page-head"><div><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1>' +
      (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>' +
      (actions ? '<div class="actions">' + actions + '</div>' : '') + '</div>';
  }
  function statCard(o) {
    return '<div class="stat' + (o.tone ? ' stat--' + o.tone : '') + '">' +
      (o.href ? '<a class="more" href="' + o.href + '">' + esc(o.more || 'View') + ' ' + ic('chevron', 12) + '</a>' : '') +
      '<div class="k"><span class="ic">' + ic(o.icon, 15) + '</span>' + o.label + '</div>' +
      '<div class="v">' + o.value + '</div>' +
      (o.sub ? '<div class="s">' + o.sub + '</div>' : '') + '</div>';
  }
  function emptyState(icon, title, body, action) {
    return '<div class="empty"><div class="ic">' + ic(icon, 24) + '</div><h3>' + title + '</h3><p>' + body + '</p>' +
      (action || '') + '</div>';
  }
  function fact(k, v, sub) {
    return '<div class="fact"><div class="k">' + k + '</div><div class="v">' + v + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div></div>';
  }
  function fld(label, name, type, value, hint, inner, full) {
    var control;
    if (type === 'select') {
      control = '<select class="input" name="' + name + '" id="f-' + name + '">' + (inner || '') + '</select>';
    } else if (type === 'textarea') {
      control = '<textarea class="textarea" name="' + name + '" id="f-' + name + '" placeholder="' + esc(hint || '') + '">' + esc(value || '') + '</textarea>';
    } else {
      control = '<input class="input" type="' + type + '" name="' + name + '" id="f-' + name + '" value="' + esc(value || '') + '" placeholder="' + esc(hint || '') + '"' +
        (type === 'number' ? ' inputmode="decimal" step="any" min="0"' : '') + '>';
    }
    return '<div class="field' + (full ? ' full' : '') + '"><label for="f-' + name + '">' + label + '</label>' + control +
      (hint && type !== 'textarea' ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</div>';
  }
  function sw(key, title, desc) {
    var on = !!S.state.profile[key];
    return '<label class="switch"><span class="sw-label"><span class="sw-t">' + title + '</span>' +
      '<span class="sw-d">' + desc + '</span></span><input type="checkbox" data-setting="' + key + '"' + (on ? ' checked' : '') + '></label>';
  }

  // ================= view state =================
  var ui = {
    ticketTab: 'all', ticketSort: 'draw', ticketQ: '', ticketLottery: '',
    lotQ: '', lotStates: [], lotCats: [], lotPrice: 'all', lotSort: 'closing', lotView: 'grid', lotSoon: false,
    resQ: '', resLottery: '', resMine: true,
    drawQ: '', drawState: '', drawSort: 'soon', drawMine: false
  };

  // ================= shell =================
  var app = {
    helpers: {
      $: $, $$: $$, esc: esc, money: money, moneyShort: moneyShort, fmtDate: fmtDate, fmtDateShort: fmtDateShort,
      fmtMonth: fmtMonth, daysUntil: daysUntil, relative: relative, parseDate: parseDate, unique: unique,
      plural: plural, ic: ic, catIcon: catIcon, catLabel: catLabel, artBg: artBg, MONTHS: MONTHS,
      statusBadge: statusBadge, demoChip: demoChip, howCloseBlock: howCloseBlock, enterButton: enterButton,
      pageHead: pageHead, statCard: statCard, emptyState: emptyState, fact: fact, fld: fld, sw: sw,
      countdownHtml: countdownHtml
    },
    NAV: NAV, ui: ui, views: {}, route: null,
    render: render, paintNav: paintNav, toast: toast, closeDrawer: closeDrawer, openDrawer: openDrawer
  };
  global.HLApp = app;

  function navCounts() {
    var all = S.listTickets().map(function (t) { return S.resolve(t); });
    return {
      tickets: all.length,
      unclaimed: all.filter(function (r) { return r && r.status === 'unclaimed'; }).length,
      draws: S.nextDraws().length,
      lotteries: H.lotteries.length,
      results: H.allDraws().filter(function (d) { return d.status === 'drawn'; }).length
    };
  }

  function paintRailNext() {
    var box = $('#rail-next');
    if (!box) return;
    var tickets = S.listTickets();
    var sum = S.summarise();
    var upcoming = S.nextDraws();
    var held = upcoming.filter(function (x) {
      return tickets.some(function (t) { return t.drawId === x.draw.id; });
    });
    var next = held[0] || upcoming[0];

    box.innerHTML = '<h4>Your portfolio</h4>' +
      '<div class="big">' + sum.total + ' <span style="font-size:13px;font-weight:500;color:var(--faint)">entries</span></div>' +
      '<p>' + money(sum.spend) + ' spent' + (sum.prizeValue ? ' · ' + money(sum.prizeValue) + ' won' : '') + '</p>' +
      (sum.unclaimed
        ? '<p style="color:var(--pending);font-weight:600">' + plural(sum.unclaimed, 'result') + ' waiting to check</p>'
        : '') +
      (next
        ? '<p style="margin-top:10px"><span style="color:var(--faint)">Next draw</span><br>' +
          '<a href="#/lotteries/' + esc(next.lottery.id) + '" style="color:var(--brand);font-weight:600">' +
          esc(next.lottery.charity) + '</a><br>' +
          fmtDateShort(next.draw.date) + ' · ' + esc(relative(next.draw.date)) + '</p>'
        : '<p style="margin-top:10px">No upcoming draws in the catalogue.</p>') +
      '<a class="btn btn--sm btn--ghost btn--block" style="margin-top:12px" href="#/tickets">Open my tickets</a>';
  }

  function paintNav(active) {
    var c = navCounts();
    var counts = { tickets: c.tickets, results: c.unclaimed, draws: c.draws, lotteries: c.lotteries, profile: null, home: null };
    $$('[data-nav]').forEach(function (a) {
      var id = a.getAttribute('data-nav');
      a.classList.toggle('active', id === active || (id === 'ticket' && active === 'ticket'));
      var slot = a.querySelector('.count');
      if (slot) {
        var n = counts[id];
        if (n) { slot.textContent = n; slot.hidden = false; if (id === 'results') slot.classList.toggle('alert', c.unclaimed > 0); }
        else slot.hidden = true;
      }
    });
    paintRailNext();
  }

  function render(opts) {
    var keepScroll = !!(opts && opts.keepScroll);
    var r = parseRoute();
    app.route = r;
    var view = app.views[r.name] || app.views['404'];
    var main = $('#view');
    main.innerHTML = view(r);
    var t = TITLES[r.name] || 'Home Lotts';
    document.title = (r.name === 'home' ? '' : t + ' · ') + 'Home Lotts — Australian charity lottery ticket tracker';
    paintNav(r.name === 'ticket' ? 'tickets' : (r.name === 'lottery' ? 'lotteries' : r.name));
    closeDrawer();
    if (!keepScroll) {
      main.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }

  function go() { render(); }

  function closeDrawer() {
    var d = $('#drawer');
    if (d) d.classList.remove('open');
    var b = $('#drawer-backdrop');
    if (b) b.style.display = 'none';
  }
  function openDrawer() {
    var d = $('#drawer');
    if (d) d.classList.add('open');
    var b = $('#drawer-backdrop');
    if (b) b.style.display = 'block';
  }

  // ================= toast =================
  function toast(msg, kind) {
    var wrap = $('#toasts');
    if (!wrap) return;
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.innerHTML = '<span class="ic">' + ic(kind === 'warn' ? 'alert' : 'check', 15) + '</span><span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s ease';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 260);
    }, 3200);
  }

  // ================= init =================
  function applyPrefs() {
    var p = S.state.profile;
    document.body.classList.toggle('reduce-motion', !!p.reduceMotion);
    if (p.demoBanner === false) document.body.classList.add('demo-strip-hidden');
    else document.body.classList.remove('demo-strip-hidden');
    var strip = $('#demo-strip-text');
    if (strip) strip.innerHTML = p.demoBanner === false
      ? 'Demo data is loaded. <a href="/about.html#demo">What is this?</a>'
      : 'This build ships with a <strong>fictional demo catalogue</strong> — every lottery, draw and result is sample data. <a href="/about.html#demo">How we label data</a>';
    var brandName = $('#brand-name');
    if (brandName) brandName.innerHTML = p.name ? esc(p.name.split(' ')[0].charAt(0).toUpperCase() + p.name.split(' ')[0].slice(1)) : 'Home Lotts';
    var av = $('#avatar');
    if (av) av.textContent = (p.name || 'H L').split(' ').map(function (x) { return x.charAt(0); }).slice(0, 2).join('').toUpperCase();
  }

  function init() {
    S.load();
    applyPrefs();
    global.addEventListener('hashchange', go);

    $('#mobile-nav').innerHTML = MOB.map(function (id) {
      var n = NAV.filter(function (x) { return x.id === id; })[0];
      return '<a href="' + n.href + '" data-nav="' + id + '">' + ic(n.icon, 19) + '<span>' + n.label.replace('Upcoming draws', 'Draws') + '</span><span class="count" hidden></span></a>';
    }).join('');

    $('#drawer-nav').innerHTML = NAV.map(function (n) {
      return '<a href="' + n.href + '" data-nav="' + n.id + '">' + ic(n.icon, 18) + '<span>' + n.label + '</span><span class="count" hidden></span></a>';
    }).join('');

    S.onChange(function () { applyPrefs(); });
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
