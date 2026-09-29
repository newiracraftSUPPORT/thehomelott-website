/* =========================================================
   Home Lotts — lotteries catalogue + lottery detail
   ========================================================= */
(function (global) {
  'use strict';
  var A = global.HLApp, H = global.HL, S = global.HLStore;
  var h = A.helpers;
  var ui = A.ui;

  // ---------- CATALOGUE ----------
  A.views.lotteries = function (r) {
    if (r.query.q) ui.lotQ = r.query.q;
    if (r.query.state) ui.lotStates = [r.query.state];
    if (r.query.cat) ui.lotCats = [r.query.cat];

    var drawnIds = H.allDraws().filter(function (d) { return d.status === 'drawn'; }).map(function (d) { return d.lotteryId; });
    var rows = H.lotteries.filter(function (l) {
      if (ui.lotStates.length && ui.lotStates.indexOf(l.state) === -1) return false;
      if (ui.lotCats.length && !l.categories.some(function (c) { return ui.lotCats.indexOf(c) > -1; })) return false;
      if (ui.lotPrice === 'under5' && l.price >= 5) return false;
      if (ui.lotPrice === '5to20' && (l.price < 5 || l.price > 20)) return false;
      if (ui.lotPrice === 'over20' && l.price <= 20) return false;
      if (ui.lotSoon && h.daysUntil(l.close) > 21) return false;
      if (ui.lotQ) {
        var hay = (l.name + ' ' + l.charity + ' ' + l.state + ' ' + l.region + ' ' + l.cause + ' ' + l.headline + ' ' + l.categories.join(' ')).toLowerCase();
        if (hay.indexOf(ui.lotQ.toLowerCase()) === -1) return false;
      }
      return true;
    });
    rows.sort(function (a, b) {
      if (ui.lotSort === 'value') return (b.tiers[0].value || 0) - (a.tiers[0].value || 0);
      if (ui.lotSort === 'price') return a.price - b.price;
      if (ui.lotSort === 'popular') return (b.sold / b.total) - (a.sold / a.total);
      if (ui.lotSort === 'results') return drawnIds.indexOf(b.id) - drawnIds.indexOf(a.id);
      return h.parseDate(a.close) - h.parseDate(b.close);
    });

    var openCount = H.lotteries.length - drawnIds.length;
    var statesUsed = H.states.filter(function (s) { return H.lotteries.some(function (l) { return l.state === s; }); });
    var hasFilter = ui.lotStates.length || ui.lotCats.length || ui.lotQ || ui.lotPrice !== 'all' || ui.lotSoon;
    var out = h.pageHead('Demo catalogue', 'Lotteries',
      openCount + ' open for entries and ' + drawnIds.length + ' with published results, across ' +
      statesUsed.length + ' states and territories. Every entry is fictional sample data.',
      '<button class="btn btn--ghost" data-action="clear-lot-filters">' + h.ic('refresh', 15) + ' Reset filters</button>' +
      '<button class="btn btn--primary" data-action="add-ticket">' + h.ic('plus', 16) + ' Add ticket</button>');

    out += '<div class="toolbar">' +
      '<div class="search">' + h.ic('search', 15) + '<input type="search" id="lq" placeholder="Search charity, cause, prize or state" value="' + h.esc(ui.lotQ) + '" aria-label="Search lotteries"></div>' +
      '<select class="select" id="lprice" aria-label="Filter by ticket price"><option value="all">Any price</option>' +
      [['under5', 'Under $5'], ['5to20', '$5 to $20'], ['over20', 'Over $20']].map(function (o) {
        return '<option value="' + o[0] + '"' + (ui.lotPrice === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>' +
      '<select class="select" id="lsort" aria-label="Sort lotteries">' +
      [['closing', 'Closing soonest'], ['value', 'Top prize value'], ['popular', 'Most sold'], ['price', 'Lowest price'], ['results', 'With results']].map(function (o) {
        return '<option value="' + o[0] + '"' + (ui.lotSort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>' +
      '<div class="tabs" style="background:var(--bg-tint);border-radius:10px">' +
      '<button data-action="lot-view" data-view="grid" class="' + (ui.lotView === 'grid' ? 'active' : '') + '" aria-label="Grid view">' + h.ic('grid', 15) + '</button>' +
      '<button data-action="lot-view" data-view="list" class="' + (ui.lotView === 'list' ? 'active' : '') + '" aria-label="List view">' + h.ic('list', 15) + '</button>' +
      '</div></div>';

    out += '<div class="toolbar" style="align-items:flex-start">' +
      '<div style="display:flex;flex-direction:column;gap:7px"><span class="cell-label" style="font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);font-family:var(--mono)">State</span>' +
      '<div class="chips">' + statesUsed.map(function (s) {
        return '<button class="chip' + (ui.lotStates.indexOf(s) > -1 ? ' active' : '') + '" data-action="lot-state" data-state="' + s + '">' + s + '</button>';
      }).join('') + '</div></div>' +
      '<div style="display:flex;flex-direction:column;gap:7px"><span class="cell-label" style="font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);font-family:var(--mono)">Prize type</span>' +
      '<div class="chips">' + H.categories.map(function (c) {
        return '<button class="chip' + (ui.lotCats.indexOf(c.id) > -1 ? ' active' : '') + '" data-action="lot-cat" data-cat="' + c.id + '">' + h.catIcon(c.id) + ' ' + c.label + '</button>';
      }).join('') + '</div></div>' +
      '<div style="display:flex;flex-direction:column;gap:7px"><span class="cell-label" style="font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);font-family:var(--mono)">Timing</span>' +
      '<div class="chips"><button class="chip' + (ui.lotSoon ? ' active' : '') + '" data-action="lot-soon">' + h.ic('clock', 13) + ' Closing in 3 weeks</button></div></div>' +
      '</div>';

    out += '<div class="spread" style="margin:4px 0 14px"><span style="font-size:13.5px;color:var(--muted)">Showing <strong>' + rows.length +
      '</strong> of ' + H.lotteries.length + ' lotteries</span>' +
      (hasFilter ? '<button class="btn btn--sm btn--quiet" data-action="clear-lot-filters">Clear all filters</button>' : '') + '</div>';

    if (!rows.length) {
      out += '<div class="card">' + h.emptyState('search', 'No lotteries match',
        'Try a different search term, or clear the filters to see the whole demo catalogue.',
        '<button class="btn btn--ghost" data-action="clear-lot-filters">Clear filters</button>') + '</div>';
      return out;
    }

    out += ui.lotView === 'grid'
      ? '<div class="lot-grid">' + rows.map(lotCard).join('') + '</div>'
      : '<div class="lot-list">' + rows.map(lotListRow).join('') + '</div>';

    out += '<div class="note plain" style="margin-top:20px"><span class="ic">' + h.ic('info', 16) + '</span><div>' +
      'This catalogue is fictional demo data for illustration. Real lotteries appear once a charity publishes verified details including ' +
      'its regulator permit. Home Lotts never sells tickets — you always enter on the organiser’s own site.</div></div>';
    return out;
  };

  function lotCard(l) {
    var d = H.nextDraw(l.id);
    var left = h.daysUntil(l.close);
    var pct = Math.min(100, Math.round((l.sold / l.total) * 100));
    return '<article class="lot-card">' +
      '<div class="' + h.artBg(l.art) + '"><span class="state">' + l.state + '</span>' +
      (left <= 21 ? '<span class="close-tag">' + (left <= 0 ? 'Closed' : left + ' days left') + '</span>' : '') +
      '<h3>' + h.esc(l.charity) + '</h3></div>' +
      '<div class="body">' +
      '<div class="charity">' + h.catIcon(l.categories[0]) + '<span>' + h.esc(l.region) + '</span>' +
      '<span class="badge badge--demo">DEMO</span></div>' +
      '<div class="headline">' + h.esc(l.headline) + '</div>' +
      '<div class="tags">' + l.categories.map(function (c) {
        return '<span class="badge badge--cat">' + h.catIcon(c, 12) + ' ' + h.catLabel(c) + '</span>';
      }).join('') + '</div>' +
      '<div class="facts"><span><b>' + h.money(l.price) + '</b> per ticket</span><span><b>' + h.esc(l.odds) + '</b> odds</span></div>' +
      '<div class="sold"><div class="lbl"><span>Draw ' + h.fmtDate(d.date) + '</span><span>' + pct + '% sold</span></div>' +
      '<div class="track"><i style="width:' + pct + '%"></i></div></div></div>' +
      '<div class="foot">' + h.enterButton(l, 'sm') + '<a class="btn btn--sm btn--ghost" href="#/lotteries/' + l.id + '">Details</a></div>' +
      '</article>';
  }

  function lotListRow(l) {
    var d = H.nextDraw(l.id);
    var pct = Math.min(100, Math.round((l.sold / l.total) * 100));
    var icon = l.categories[0] === 'home' ? 'home' : l.categories[0] === 'car' ? 'car'
      : l.categories[0] === 'holiday' ? 'suitcase' : l.categories[0] === 'cash' ? 'dollar' : 'gift';
    return '<div class="lot-list-item">' +
      '<div class="' + h.artBg(l.art) + ' thumb">' + h.ic(icon, 24) + '</div>' +
      '<div><a class="nm" href="#/lotteries/' + l.id + '">' + h.esc(l.charity) + '</a>' +
      '<div class="sub">' + h.esc(l.headline) + '</div>' +
      '<div class="row tight" style="margin-top:7px"><span class="badge badge--soft">' + l.state + '</span>' +
      l.categories.map(function (c) { return '<span class="badge badge--cat">' + h.catLabel(c) + '</span>'; }).join('') +
      '<span class="badge badge--demo">DEMO</span></div></div>' +
      '<div class="hide-md"><div class="k">Draw</div><div style="font-size:13.5px;font-weight:600">' + h.fmtDate(d.date) + '</div>' +
      '<div class="sub">' + d.sold.toLocaleString('en-AU') + ' sold (' + pct + '%)</div></div>' +
      '<div class="hide-md"><div class="k">Ticket</div><div style="font-size:13.5px;font-weight:600">' + h.money(l.price) + '</div>' +
      '<div class="sub">' + h.esc(l.odds) + '</div></div>' +
      '<div class="row tight">' + h.enterButton(l, 'sm') + '<a class="btn btn--sm btn--quiet" href="#/lotteries/' + l.id + '" aria-label="View details">' + h.ic('chevron', 15) + '</a></div>' +
      '</div>';
  }

  // ---------- LOTTERY DETAIL ----------
  A.views.lottery = function (r) {
    var l = H.getLottery(r.param);
    if (!l) {
      return '<div class="breadcrumb"><a href="#/lotteries">Lotteries</a><span class="sep">/</span><span>Not found</span></div>' +
        '<div class="card">' + h.emptyState('search', 'Lottery not found',
          'That lottery is not in the catalogue. It may have closed, or the link may be out of date.',
          '<a class="btn btn--primary" href="#/lotteries">Browse all lotteries</a>') + '</div>';
    }
    var next = H.nextDraw(l.id);
    var myTickets = S.listTickets().filter(function (t) { return t.lotteryId === l.id; });
    var pct = Math.min(100, Math.round((l.sold / l.total) * 100));
    var drawn = l.draws.filter(function (d) { return d.status === 'drawn'; })
      .sort(function (a, b) { return h.parseDate(b.date) - h.parseDate(a.date); });
    var related = H.lotteries.filter(function (x) {
      return x.id !== l.id && (x.state === l.state || x.categories.some(function (c) { return l.categories.indexOf(c) > -1; }));
    }).slice(0, 3);
    var pool = l.tiers.reduce(function (a, t) { return a + t.value * t.winners; }, 0);
    var left = h.daysUntil(next.date);

    var out = '<div class="breadcrumb"><a href="#/home">Home</a><span class="sep">/</span><a href="#/lotteries">Lotteries</a>' +
      '<span class="sep">/</span><span>' + h.esc(l.charity) + '</span></div>';

    out += '<div class="hero-lot"><div class="' + h.artBg(l.art) + ' hero-top" style="color:#fff"><div class="spread" style="align-items:flex-start">' +
      '<div><div class="row tight" style="margin-bottom:10px"><span class="badge">' + l.state + '</span>' +
      '<span class="badge">' + h.esc(l.region) + '</span><span class="badge">DEMO CATALOGUE</span></div>' +
      '<h1>' + h.esc(l.name) + '</h1>' +
      '<div class="charity">' + h.ic('heart', 15) + ' ' + h.esc(l.cause) + '</div>' +
      '<div class="tags">' + l.categories.map(function (c) { return '<span class="badge">' + h.catIcon(c, 12) + ' ' + h.catLabel(c) + '</span>'; }).join('') + '</div></div>' +
      '<div style="text-align:right"><div class="eyebrow" style="color:rgba(255,255,255,.75);margin-bottom:8px">' +
      (left > 0 ? 'DRAW IN' : left === 0 ? 'DRAW TODAY' : 'DRAW COMPLETE') + '</div>' +
      '<div style="font-family:var(--display);font-weight:800;font-size:34px;line-height:1">' + (left > 0 ? left : 0) + '</div>' +
      '<div style="font-size:12px;opacity:.8">days · ' + h.fmtDate(next.date) + '</div></div></div></div>' +

      '<div class="hero-body"><div><div class="headline-prize">' + h.esc(l.headline) + '</div>' +
      '<p style="color:var(--muted);font-size:13.5px;margin-top:5px">Draw ' + h.fmtDate(next.date) + ' · ' + h.esc(next.time || '') +
      ' · ' + h.money(l.price) + ' per ticket · ' + h.esc(l.odds) + ' odds</p></div>' +
      '<div class="row">' + h.enterButton(l) +
      '<button class="btn btn--ghost" data-action="add-ticket" data-lottery="' + l.id + '">' + h.ic('plus', 16) + ' Track a ticket</button></div></div>' +

      '<div class="factgrid">' +
      h.fact('Ticket price', h.money(l.price), 'Min ' + l.min + ' · max ' + l.max) +
      h.fact('Draw date', h.fmtDate(next.date), next.time || '') +
      h.fact('Entries close', h.fmtDate(l.close), h.relative(l.close)) +
      h.fact('Odds per ticket', h.esc(l.odds), 'Chance of any prize') +
      h.fact('Tickets sold', l.sold.toLocaleString('en-AU'), 'of ' + l.total.toLocaleString('en-AU') + ' · ' + pct + '%') +
      h.fact('Prize pool', h.moneyShort(pool), l.tiers.length + ' tiers') +
      '</div></div>';

    out += '<div class="split"><div class="stack">';

    // prizes
    out += '<div class="card"><div class="card-head"><div><h3>Prize structure</h3><p>Match leading digits of your ticket number against a drawn number</p></div>' +
      '<span class="badge badge--soft">Pool ' + h.moneyShort(pool) + '</span></div><div class="prizes">' +
      l.tiers.map(function (t) {
        return '<div class="prize"><span class="rank">' + t.rank + '</span>' +
          '<span><span class="nm">' + h.esc(t.label) + '</span>' +
          '<span class="ds">' + t.winners + ' × ' + h.esc(t.valueText) + ' · match ' + t.match + ' of 6 digits</span></span>' +
          '<span class="val">' + h.esc(t.valueText) + '<small>' + t.match + '/6 digits</small></span></div>';
      }).join('') + '</div></div>';

    // results
    out += '<div class="card"><div class="card-head"><div><h3>Results</h3><p>' +
      (drawn.length ? drawn.length + ' published draw' + (drawn.length > 1 ? 's' : '') : 'No results published yet') + '</p></div>' +
      (drawn.length ? '<a class="btn btn--sm btn--ghost" href="#/results">All results</a>' : '') + '</div>';
    if (drawn.length) {
      drawn.forEach(function (d) {
        var mine = myTickets.filter(function (t) { return t.drawId === d.id; });
        out += '<div class="result-item"><div class="top"><div><div class="nm">' + h.fmtDate(d.date) + ' · ' + h.esc(d.time || '') + '</div>' +
          '<div class="meta">' + d.sold.toLocaleString('en-AU') + ' eligible tickets · published ' + h.fmtDate(d.published || d.date) + '</div></div>' +
          '<div class="row tight">' + h.demoChip('Fictional sample result') + '</div></div>' +
          '<div class="row" style="margin-top:11px;align-items:flex-start;gap:14px">' +
          '<span class="eyebrow muted" style="padding-top:7px;flex:0 0 auto">Winning numbers</span>' +
          '<div class="winning">' + d.winningNumbers.map(function (n) { return '<span class="n">' + S.pad(n) + '</span>'; }).join('') + '</div></div>' +
          (d.notes ? '<p style="font-size:12.5px;color:var(--faint);margin-top:10px">' + h.esc(d.notes) + '</p>' : '');
        if (mine.length) {
          out += '<div class="mine">' + mine.map(function (t) {
            var res = S.resolve(t);
            return '<div class="mine-row"><a class="tnum" href="#/tickets/' + t.id + '">' + S.pad(t.number) + '</a>' +
              h.statusBadge(res.status) + '<span style="color:var(--muted)">' + res.howClose.digits + '/6' +
              (res.tier ? ' · ' + h.esc(res.tier.valueText) : '') + '</span>' +
              '<a class="btn btn--sm btn--quiet" style="margin-left:auto" href="#/tickets/' + t.id + '">Open ticket</a></div>';
          }).join('') + '</div>';
        }
        out += '</div>';
      });
    } else {
      out += '<div class="card-body">' + h.emptyState('clock', 'The draw has not been held yet',
        'Results appear here on ' + h.fmtDate(next.date) + ' — the drawn numbers, the prize tier you matched, and how close you were.',
        '<button class="btn btn--primary" data-action="notify-me" data-lottery="' + l.id + '">' + h.ic('bell', 15) + ' Remind me on the day</button>') + '</div>';
    }
    out += '</div>';

    // about
    out += '<div class="card"><div class="card-head"><div><h3>About this draw</h3></div></div><div class="card-body">' +
      '<p style="font-size:14px;color:var(--ink-2);margin-bottom:14px">' + h.esc(l.supportLine) + '</p>' +
      '<dl class="kv">' +
      '<dt>Draw location</dt><dd>' + h.esc(String(l.terms[2] || '').replace('Draw conducted at ', '').replace('.', '')) + '</dd>' +
      '<dt>Entries open</dt><dd>' + h.fmtDate(l.open) + '</dd>' +
      '<dt>Entries close</dt><dd>' + h.fmtDate(l.close) + '</dd>' +
      '<dt>Maximum per person</dt><dd>' + l.max + ' tickets</dd>' +
      '<dt>Permit</dt><dd style="max-width:62%;text-align:right">' + h.esc(l.dta) + '</dd>' +
      '<dt>Cause</dt><dd>' + h.esc(l.cause) + '</dd></dl><div style="margin-top:8px">' +
      '<details class="accordion" open><summary>How winning works</summary><div class="acc-body">' +
      '<p>Each ticket is a six-digit number. On draw night ' + (drawn[0] ? drawn[0].winningNumbers.length + ' winning numbers' : 'several winning numbers') +
      ' are drawn. Home Lotts compares your number to each drawn number from the left, counting how many digits match in a row.</p>' +
      '<ul><li>6 of 6 digits matched — top prize</li><li>5 of 6 — second prize</li><li>4 of 6 — third prize</li><li>3 of 6 — community fund</li><li>Fewer than 3 — no prize</li></ul>' +
      '<p>We also check the same comparison from the right-hand end and keep the longer run, then show you the closest drawn number and exactly which digits matched.</p>' +
      '</div></details>' +
      '<details class="accordion"><summary>Terms of entry</summary><div class=\"acc-body\"><ul>' +
      l.terms.map(function (t) { return '<li>' + h.esc(t) + '</li>'; }).join('') + '</ul></div></details>' +
      '<details class="accordion"><summary>Responsible entry</summary><div class="acc-body"><p>Raffles and lotteries are games of chance. ' +
      'Only enter what you can afford to lose, and set yourself a budget you stick to. Home Lotts never sells tickets, never takes a share of winnings, and never uses gambling-style pressure. ' +
      'Read our <a href="/play-responsibly.html" style="text-decoration:underline">responsible play guide</a>.</p></div></details>' +
      '<details class="accordion"><summary>About this demo record</summary><div class="acc-body"><p>' +
      'This lottery is fictional sample data created to demonstrate the app. The charity, permit, prizes, sold counts and drawn numbers are invented. ' +
      'We label it <span class="badge badge--demo">DEMO</span> everywhere it appears.</p></div></details>' +
      '</div></div></div>';

    out += '</div><div class="stack">';

    // enter card
    out += '<div class="card"><div class="card-head"><div><h3>Enter this draw</h3><p>Opens the organiser’s site in a new tab</p></div></div>' +
      '<div class="card-body"><div class="row" style="margin-bottom:14px">' + h.enterButton(l) + '</div>' +
      '<dl class="kv"><dt>Ticket price</dt><dd>' + h.money(l.price) + '</dd>' +
      '<dt>Minimum</dt><dd>' + l.min + ' ticket' + (l.min > 1 ? 's' : '') + '</dd>' +
      '<dt>Maximum</dt><dd>' + l.max + ' tickets</dd>' +
      '<dt>Total entries</dt><dd>' + l.total.toLocaleString('en-AU') + '</dd>' +
      '<dt>Sold so far</dt><dd>' + l.sold.toLocaleString('en-AU') + ' (' + pct + '%)</dd></dl>' +
      '<div class="sold" style="margin-top:14px"><div class="lbl"><span>Selling progress</span><span>' + pct + '%</span></div>' +
      '<div class="track"><i style="width:' + pct + '%"></i></div></div>' +
      '<p style="font-size:11.5px;color:var(--faint);margin-top:12px">' + h.ic('link', 12) + ' Link source: <strong>' +
      h.esc(S.affiliateSource(l.id)) + '</strong> — change it in <a href="#/profile">Profile</a>. ' +
      'Home Lotts never handles payment or ticket delivery.</p></div></div>';

    // my tickets
    out += '<div class="card"><div class="card-head"><div><h3>Your tickets here</h3><p>' +
      (myTickets.length ? myTickets.length + ' entr' + (myTickets.length > 1 ? 'ies' : 'y') : 'Nothing tracked yet') + '</p></div>' +
      '<button class="btn btn--sm btn--quiet" data-action="add-ticket" data-lottery="' + l.id + '">Add</button></div>';
    if (myTickets.length) {
      out += '<div class="rows">' + myTickets.map(function (t) {
        var res = S.resolve(t);
        return '<div class="rowitem" style="grid-template-columns:minmax(0,1fr) auto;padding:12px 16px">' +
          '<div class="lead"><div class="name"><a class="tnum" href="#/tickets/' + t.id + '">' + S.pad(t.number) + '</a>' +
          (t.demo ? ' ' + h.demoChip() : '') + '</div><div class="meta">' + t.quantity + ' × ' + h.money(t.unitPrice) +
          ' · ' + h.fmtDate(res.draw.date) + '</div></div><div>' + h.statusBadge(res.status) + '</div></div>';
      }).join('') + '</div>';
    } else {
      out += '<div class="card-body" style="padding-top:14px">' +
        '<p style="font-size:13.5px;color:var(--muted)">Enter on the organiser’s site, then add your ticket number here and we will track the draw, the result and the digit comparison.</p>' +
        '<div class="row" style="margin-top:12px"><button class="btn btn--sm btn--primary" data-action="add-ticket" data-lottery="' + l.id + '">' +
        h.ic('plus', 15) + ' Add a ticket</button></div></div>';
    }
    out += '</div>';

    // organiser
    out += '<div class="card"><div class="card-head"><div><h3>Organiser</h3></div></div><div class="card-body">' +
      '<p style="font-weight:600">' + h.esc(l.charity) + '</p>' +
      '<p style="font-size:13.5px;color:var(--muted);margin-top:5px">' + h.esc(l.cause) + '</p>' +
      '<dl class="kv" style="margin-top:14px"><dt>Region</dt><dd>' + l.state + ' · ' + h.esc(l.region) + '</dd>' +
      '<dt>Authority</dt><dd>' + h.esc(l.dta.split('·')[0].trim()) + '</dd></dl>' +
      '<div class="row" style="margin-top:14px">' +
      '<a class="btn btn--sm btn--ghost" href="mailto:' + H.brand.email + '?subject=Question%20about%20' + encodeURIComponent(l.charity) + '">' +
      h.ic('mail', 14) + ' Ask a question</a>' +
      '<button class="btn btn--sm btn--ghost" data-action="report" data-lottery="' + l.id + '">' + h.ic('alert', 14) + ' Report an issue</button></div>' +
      '</div></div>';

    // similar
    if (related.length) {
      out += '<div class="card"><div class="card-head"><div><h3>Similar draws</h3></div></div><div class="rows">' +
        related.map(function (x) {
          return '<div class="rowitem" style="grid-template-columns:minmax(0,1fr) auto;padding:12px 16px">' +
            '<div class="lead"><div class="name" style="font-size:14px"><a href="#/lotteries/' + x.id + '">' + h.esc(x.charity) + '</a></div>' +
            '<div class="meta">' + x.state + ' · ' + h.money(x.price) + ' · draws ' + h.fmtDate(H.nextDraw(x.id).date) + '</div></div>' +
            '<div style="font-size:12.5px;color:var(--muted);text-align:right;max-width:44%">' + h.esc(x.headline) + '</div></div>';
        }).join('') + '</div></div>';
    }

    out += '</div></div>';
    return out;
  };

  A.views['404'] = function () {
    return '<div class="card" style="margin-top:20px">' + h.emptyState('search', 'Page not found',
      'That page does not exist. It may have moved, or the link may be out of date.',
      '<a class="btn btn--primary" href="#/home">Back to the dashboard</a>') + '</div>';
  };
})(window);
