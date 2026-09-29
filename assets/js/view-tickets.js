/* =========================================================
   Home Lotts — my tickets + ticket detail
   ========================================================= */
(function (global) {
  'use strict';
  var A = global.HLApp, H = global.HL, S = global.HLStore;
  var h = A.helpers;
  var ui = A.ui;

  // ---------- MY TICKETS ----------
  A.views.tickets = function (r) {
    if (r.query.t) ui.ticketTab = r.query.t;
    if (['all', 'active', 'upcoming', 'unclaimed', 'winner', 'no-prize'].indexOf(ui.ticketTab) === -1) ui.ticketTab = 'all';

    var all = S.listTickets().map(function (t) { return { t: t, res: S.resolve(t) }; }).filter(function (x) { return x.res; });
    var sum = S.summarise();
    var counts = {
      all: all.length,
      active: all.filter(function (x) { return x.res.status === 'upcoming' || x.res.status === 'unclaimed'; }).length,
      upcoming: all.filter(function (x) { return x.res.status === 'upcoming'; }).length,
      unclaimed: all.filter(function (x) { return x.res.status === 'unclaimed'; }).length,
      winner: all.filter(function (x) { return x.res.status === 'winner'; }).length,
      'no-prize': all.filter(function (x) { return x.res.status === 'no-prize'; }).length
    };
    var rows = all.filter(function (x) {
      if (ui.ticketTab === 'active') {
        if (x.res.status !== 'upcoming' && x.res.status !== 'unclaimed') return false;
      } else if (ui.ticketTab !== 'all' && x.res.status !== ui.ticketTab) return false;
      if (ui.ticketLottery && x.t.lotteryId !== ui.ticketLottery) return false;
      if (ui.ticketQ) {
        var hay = (S.pad(x.t.number) + ' ' + x.res.lottery.name + ' ' + x.res.lottery.charity + ' ' +
          x.res.lottery.state + ' ' + (x.t.retailer || '') + ' ' + (x.t.note || '')).toLowerCase();
        if (hay.indexOf(ui.ticketQ.toLowerCase()) === -1) return false;
      }
      return true;
    });
    rows.sort(function (a, b) {
      if (ui.ticketSort === 'spend') return (b.t.quantity * b.t.unitPrice) - (a.t.quantity * a.t.unitPrice);
      if (ui.ticketSort === 'number') return a.t.number.localeCompare(b.t.number);
      if (ui.ticketSort === 'purchased') return (b.t.purchased || '').localeCompare(a.t.purchased || '');
      var ad = h.parseDate(a.res.draw.date), bd = h.parseDate(b.res.draw.date);
      if (ad.getTime() !== bd.getTime()) return ad - bd;
      return a.t.number.localeCompare(b.t.number);
    });

    var out = h.pageHead('Your portfolio', 'My tickets',
      sum.total + ' entries · ' + sum.ticketCount + ' stubs · ' + h.money(sum.spend) + ' spent · ' +
      (sum.prizeValue ? h.money(sum.prizeValue) + ' won' : 'no prizes won yet') +
      (sum.demo ? ' · ' + sum.demo + ' demo entries' : ''),
      '<button class="btn btn--ghost" data-action="export-csv">' + h.ic('download', 15) + ' Export CSV</button>' +
      '<button class="btn btn--primary" data-action="add-ticket">' + h.ic('plus', 16) + ' Add ticket</button>');

    var tabs = [['all', 'All', counts.all], ['active', 'Active', counts.active], ['upcoming', 'Upcoming', counts.upcoming],
      ['unclaimed', 'Results ready', counts.unclaimed], ['winner', 'Winners', counts.winner], ['no-prize', 'No prize', counts['no-prize']]];
    out += '<div class="toolbar"><div class="tabs">' + tabs.map(function (t) {
      return '<button data-action="ticket-tab" data-tab="' + t[0] + '" class="' + (ui.ticketTab === t[0] ? 'active' : '') + '">' +
        t[1] + ' <span class="n">' + t[2] + '</span></button>';
    }).join('') + '</div>' +
      '<div class="search">' + h.ic('search', 15) + '<input type="search" id="tq" placeholder="Search number, lottery or retailer" value="' + h.esc(ui.ticketQ) + '" aria-label="Search tickets"></div>' +
      '<select class="select" id="tlot" aria-label="Filter by lottery"><option value="">All lotteries</option>' +
      H.lotteries.map(function (l) {
        return '<option value="' + l.id + '"' + (ui.ticketLottery === l.id ? ' selected' : '') + '>' + h.esc(l.charity) + '</option>';
      }).join('') + '</select>' +
      '<select class="select" id="tsort" aria-label="Sort tickets">' +
      [['draw', 'Draw date'], ['purchased', 'Date purchased'], ['spend', 'Amount spent'], ['number', 'Ticket number']].map(function (o) {
        return '<option value="' + o[0] + '"' + (ui.ticketSort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>';

    if (!rows.length) {
      out += '<div class="card">' + h.emptyState('ticket',
        all.length ? 'No tickets match those filters' : 'No tickets yet',
        all.length ? 'Try a different tab, clear the search, or reset the lottery filter.'
          : 'Add your first ticket and we will track the draw date, the result and exactly how close you were.',
        all.length
          ? '<button class="btn btn--ghost" data-action="clear-ticket-filters">Clear filters</button>'
          : '<button class="btn btn--primary" data-action="add-ticket">' + h.ic('plus', 16) + ' Add your first ticket</button>') + '</div>';
      return out;
    }

    out += '<div class="card"><div class="rows-head"><span>Ticket</span><span>Lottery</span><span>Status</span><span>How close</span><span>Draw</span><span style="text-align:right">Paid</span></div>' +
      '<div class="rows">' + rows.map(ticketRow).join('') + '</div></div>';

    out += '<p style="font-size:12.5px;color:var(--faint);margin-top:14px">' + h.ic('info', 13) +
      ' Entries tagged <span class="badge badge--demo">DEMO</span> are sample data — remove them any time from ' +
      '<a href="#/profile">Profile → Data &amp; privacy</a>. Results shown for this catalogue are demo results; see ' +
      '<a href="/about.html#demo">how we label data</a>.</p>';
    return out;
  };

  function ticketRow(x) {
    var t = x.t, res = x.res;
    var actions = '';
    if (res.status === 'unclaimed') {
      actions += '<button class="btn btn--sm btn--primary" data-action="check-ticket" data-id="' + t.id + '">Check</button>';
    } else if (res.status === 'winner' || res.status === 'no-prize') {
      actions += '<button class="btn btn--sm btn--ghost" data-action="uncheck-ticket" data-id="' + t.id + '">Re-open</button>';
    }
    actions += '<button class="btn btn--sm btn--quiet" data-action="edit-ticket" data-id="' + t.id + '" aria-label="Edit ticket ' + S.pad(t.number) + '">' + h.ic('edit', 15) + '</button>';
    actions += '<button class="btn btn--sm btn--quiet" data-action="delete-ticket" data-id="' + t.id + '" aria-label="Delete ticket ' + S.pad(t.number) + '">' + h.ic('trash', 15) + '</button>';

    var howClose;
    if (res.status === 'upcoming') howClose = '<span style="font-weight:600">' + h.esc(h.relative(res.draw.date)) + '</span>';
    else if (res.status === 'unclaimed') howClose = '<span style="font-weight:600;color:var(--pending)">Ready to check</span>';
    else howClose = '<span style="font-weight:600">' + res.howClose.digits + '/6</span> ' + (res.tier ? h.esc(res.tier.valueText) : 'no prize');

    return '<div class="rowitem">' +
      '<div class="lead"><div class="name"><a href="#/tickets/' + t.id + '" class="stretch"><span class="tnum">' + S.pad(t.number) + '</span></a>' +
      (t.demo ? ' ' + h.demoChip() : '') + '</div><div class="meta">' + t.quantity + ' × ' + h.money(t.unitPrice) + ' · ' +
      (t.retailer ? h.esc(t.retailer) : 'retailer not recorded') + '</div></div>' +
      '<div class="cell-lg"><div style="font-size:14px;font-weight:600"><a href="#/lotteries/' + res.lottery.id + '">' + h.esc(res.lottery.charity) + '</a></div>' +
      '<div class="meta"><span class="badge badge--soft">' + res.lottery.state + '</span> ' + h.esc(h.catLabel(res.lottery.categories[0])) + '</div></div>' +
      '<div>' + h.statusBadge(res.status) + '</div>' +
      '<div class="cell-lg" style="font-size:13.5px">' + howClose + '</div>' +
      '<div class="cell-lg"><div style="font-size:13.5px">' + h.fmtDate(res.draw.date) + '</div><div class="meta">' + h.esc(res.draw.time || '') + '</div></div>' +
      '<div style="text-align:right"><div class="num-cell">' + h.money(t.quantity * t.unitPrice) + '</div>' +
      '<div class="row-actions" style="margin-top:6px">' + actions + '</div></div></div>';
  }

  // ---------- TICKET DETAIL ----------
  A.views.ticket = function (r) {
    var t = S.getTicket(r.param);
    if (!t) {
      return '<div class="breadcrumb"><a href="#/tickets">My tickets</a><span class="sep">/</span><span>Not found</span></div>' +
        '<div class="card">' + h.emptyState('ticket', 'Ticket not found',
          'This ticket is no longer in your portfolio. It may have been deleted, or the link may be out of date.',
          '<a class="btn btn--primary" href="#/tickets">Back to my tickets</a>') + '</div>';
    }
    var res = S.resolve(t);
    var l = res.lottery, d = res.draw;
    var others = S.listTickets().filter(function (x) { return x.lotteryId === t.lotteryId && x.id !== t.id; });
    var spend = t.quantity * t.unitPrice;
    var out = '';

    out += '<div class="breadcrumb"><a href="#/home">Home</a><span class="sep">/</span><a href="#/tickets">My tickets</a>' +
      '<span class="sep">/</span><span class="tnum">' + S.pad(t.number) + '</span></div>';

    out += '<div class="card" style="overflow:hidden;margin-bottom:16px"><div class="' + h.artBg(l.art) + '" style="padding:22px;color:#fff">' +
      '<div class="spread" style="align-items:flex-start"><div>' +
      '<div class="row tight" style="margin-bottom:10px">' + h.statusBadge(res.status) + (t.demo ? h.demoChip() : '') +
      '<span class="badge" style="background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.24);color:#fff">' + l.state + '</span>' +
      '<span class="badge" style="background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.24);color:#fff">' + l.region + '</span></div>' +
      '<span class="ticket-chip">' + S.pad(t.number) + '<span class="cut"></span>' + t.quantity + ' × ' + h.money(t.unitPrice) + '</span>' +
      '<div style="margin-top:12px;font-size:14.5px;opacity:.95"><a href="#/lotteries/' + l.id + '" style="text-decoration:underline">' +
      h.esc(l.charity) + '</a> · ' + h.esc(l.headline) + '</div></div>' +
      '<div class="row tight"><button class="btn btn--sm btn--ghost" data-action="print">' + h.ic('printer', 15) + ' Print</button>' +
      '<button class="btn btn--sm btn--ghost" data-action="edit-ticket" data-id="' + t.id + '">' + h.ic('edit', 15) + ' Edit</button>' +
      h.enterButton(l, 'sm') + '</div></div></div>' +

      '<div class="card-foot" style="background:var(--surface)">' +
      '<button class="btn btn--sm btn--danger" data-action="delete-ticket" data-id="' + t.id + '">' + h.ic('trash', 14) + ' Delete</button>' +
      (res.status === 'unclaimed' ? '<button class="btn btn--sm btn--primary" data-action="check-ticket" data-id="' + t.id + '">' + h.ic('check', 15) + ' Check result</button>' : '') +
      (res.status === 'winner' || res.status === 'no-prize'
        ? '<button class="btn btn--sm btn--ghost" data-action="uncheck-ticket" data-id="' + t.id + '">Re-open result</button>' +
        (d.status === 'drawn' ? '<button class="btn btn--sm btn--ghost" data-action="set-tier" data-id="' + t.id + '">Choose prize</button>' : '')
        : '') +
      '<span style="flex:1"></span><span style="font-size:12.5px;color:var(--faint)">Added ' + h.esc(h.fmtDate(t.createdAt || t.purchased)) + '</span></div></div>';

    out += '<div class="split"><div class="stack">';

    // how close
    out += '<div class="card"><div class="card-head"><div><h3>How close?</h3><p>' +
      (d.status === 'drawn'
        ? 'Digit match against drawn number ' + h.esc(res.howClose.nearest || '—')
        : 'Nothing to compare until the draw on ' + h.fmtDate(d.date)) + '</p></div>' +
      (d.status === 'drawn' ? '<span class="badge badge--soft">Drawn ' + h.fmtDate(d.date) + '</span>' : '<span class="badge badge--soon">' + h.esc(h.relative(d.date)) + '</span>') +
      '</div><div class="card-body">' + h.howCloseBlock(res) + '</div>';
    if (d.status === 'drawn') {
      out += '<div class="card-foot" style="font-size:13px;color:var(--muted)">' + h.ic('info', 14) +
        ' Drawn numbers: ' + d.winningNumbers.map(function (n) { return '<span class="tnum">' + S.pad(n) + '</span>'; }).join(' ') + '</div>';
    }
    out += '</div>';

    // result
    if (d.status === 'drawn') {
      out += '<div class="card"><div class="card-head"><div><h3>Result</h3><p>' +
        (t.checked ? (res.status === 'winner' ? 'Prize recorded against this ticket' : 'Checked against the draw sheet')
          : 'Not checked yet') + '</p></div>' + h.statusBadge(res.status) + '</div>';
      if (!t.checked) {
        out += '<div class="card-body">' + h.emptyState('award', 'Result available',
          'We have the winning numbers for this draw. Check your ticket to record the outcome and see the digit comparison.',
          '<button class="btn btn--primary" data-action="check-ticket" data-id="' + t.id + '">' + h.ic('check', 16) + ' Check my result</button>') + '</div>';
      } else if (res.status === 'winner') {
        out += '<div class="card-body"><div class="note win"><span class="ic">' + h.ic('star', 17) + '</span><div>' +
          '<strong>' + h.esc(t.prizeText || (res.tier ? res.tier.valueText : 'Prize')) + '</strong> — ' +
          h.esc(res.tier ? res.tier.label : 'prize') + ' on a ' + res.howClose.digits + '/6 digit match.' +
          '<br>Paid ' + h.money(spend) + ' for this entry. ' + h.esc(l.charity) + ' contacts the winner directly using the details on the entry — we never pass your number on.</div></div>' +
          '<div class="row" style="margin-top:14px"><button class="btn btn--sm" data-action="set-tier" data-id="' + t.id + '">' +
          h.ic('edit', 14) + ' Change recorded prize</button></div></div>';
      } else {
        out += '<div class="card-body"><p style="color:var(--muted);font-size:14px">Your ticket ' + S.pad(t.number) +
          ' did not match a drawn number. The closest drawn number was <span class="tnum">' + h.esc(res.howClose.nearest) +
          '</span> at ' + res.howClose.digits + ' of 6 leading digits.</p>' +
          (res.next ? '<p style="font-size:13.5px;margin-top:10px;color:var(--muted)">It would have needed ' +
            (res.next.match - res.howClose.digits) + ' more leading digit' + ((res.next.match - res.howClose.digits) > 1 ? 's' : '') +
            ' for ' + h.esc(res.next.label.toLowerCase()) + ' (' + h.esc(res.next.valueText) + ').</p>' : '') +
          '<div class="row" style="margin-top:16px">' + h.enterButton(l, 'sm') + '</div></div>';
      }
      out += '</div>';
    } else {
      out += '<div class="card"><div class="card-head"><div><h3>Draw pending</h3><p>' + h.fmtDate(d.date) + ' · ' + h.esc(d.time || '') + '</p></div></div>' +
        '<div class="card-body">' + h.countdownHtml(d, true) +
        '<p style="font-size:13.5px;color:var(--muted);margin-top:16px">Results land here as soon as ' + h.esc(l.charity) +
        ' publishes them. Your ticket is matched automatically on your device, then you confirm.</p>' +
        '<div class="row" style="margin-top:16px">' + h.enterButton(l, 'sm') + '</div></div></div>';
    }

    // details
    out += '<div class="card"><div class="card-head"><div><h3>Ticket details</h3><p>Everything recorded for this entry</p></div></div>' +
      '<div class="card-body"><dl class="kv">' +
      '<dt>Ticket number</dt><dd class="tnum">' + S.pad(t.number) + '</dd>' +
      '<dt>Quantity</dt><dd>' + t.quantity + ' stub' + (t.quantity > 1 ? 's' : '') + '</dd>' +
      '<dt>Price each</dt><dd>' + h.money(t.unitPrice) + '</dd>' +
      '<dt>Total paid</dt><dd>' + h.money(spend) + '</dd>' +
      '<dt>Purchased</dt><dd>' + h.esc(h.fmtDate(t.purchased)) + '</dd>' +
      '<dt>Retailer</dt><dd>' + (t.retailer ? h.esc(t.retailer) : '<span style="color:var(--faint)">not recorded</span>') + '</dd>' +
      '<dt>Draw</dt><dd>' + h.esc(h.fmtDate(d.date)) + (d.time ? ' · ' + h.esc(d.time) : '') + '</dd>' +
      '<dt>Draw status</dt><dd>' + (d.status === 'drawn' ? 'Drawn ' + h.fmtDate(d.published || d.date) : 'Upcoming') + '</dd>' +
      '<dt>Result source</dt><dd>' + h.demoChip('Fictional sample result') + '</dd>' +
      '<dt>Entry source</dt><dd>' + (t.demo ? h.demoChip() : 'Added by you') + '</dd>' +
      '</dl>' +
      (t.note ? '<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2)"><div class="eyebrow muted" style="margin-bottom:5px">Note</div>' +
        '<p style="font-size:14px;color:var(--ink-2);white-space:pre-wrap">' + h.esc(t.note) + '</p></div>' : '') +
      '<div class="row tight" style="margin-top:16px">' +
      '<button class="btn btn--sm btn--ghost" data-action="copy" data-value="' + S.pad(t.number) + '">' + h.ic('copy', 14) + ' Copy number</button>' +
      '<a class="btn btn--sm btn--ghost" href="#/lotteries/' + l.id + '">' + h.ic('external', 14) + ' Lottery page</a>' +
      '<button class="btn btn--sm btn--ghost" data-action="report" data-lottery="' + l.id + '" data-ticket="' + t.id + '">' + h.ic('alert', 14) + ' Report a problem</button>' +
      '</div></div></div>';

    out += '</div><div class="stack">';

    // about lottery
    out += '<div class="card"><div class="card-head"><div><h3>About this lottery</h3></div></div><div class="card-body">' +
      '<a href="#/lotteries/' + l.id + '" style="font-weight:650">' + h.esc(l.name) + '</a>' +
      '<p style="font-size:13px;color:var(--muted);margin-top:6px">' + h.esc(l.cause) + '</p>' +
      '<dl class="kv" style="margin-top:14px">' +
      '<dt>Top prize</dt><dd>' + h.esc(l.tiers[0].valueText) + '</dd>' +
      '<dt>Ticket price</dt><dd>' + h.money(l.price) + '</dd>' +
      '<dt>Odds</dt><dd>' + h.esc(l.odds) + '</dd>' +
      '<dt>State</dt><dd>' + l.state + ' · ' + h.esc(l.region) + '</dd>' +
      '<dt>Entries close</dt><dd>' + h.esc(h.fmtDate(l.close)) + '</dd></dl>' +
      '<div class="row" style="margin-top:16px">' + h.enterButton(l, 'sm') + '</div>' +
      '<p style="font-size:11.5px;color:var(--faint);margin-top:12px">' + h.ic('link', 12) +
      ' Opens the organiser’s site in a new tab. Link source: <strong>' + h.esc(S.affiliateSource(l.id)) + '</strong> — change it in <a href="#/profile">Profile</a>.</p>' +
      '</div></div>';

    // other tickets
    if (others.length) {
      out += '<div class="card"><div class="card-head"><div><h3>Your other tickets</h3><p>Same lottery</p></div></div><div class="rows">' +
        others.map(function (o) {
          var ores = S.resolve(o);
          return '<div class="rowitem" style="grid-template-columns:minmax(0,1fr) auto;padding:12px 16px">' +
            '<div class="lead"><div class="name"><a href="#/tickets/' + o.id + '" class="stretch"><span class="tnum">' + S.pad(o.number) + '</span></a>' +
            (o.demo ? ' ' + h.demoChip() : '') + '</div><div class="meta">' + o.quantity + ' × ' + h.money(o.unitPrice) + ' · ' + h.fmtDate(o.purchased) + '</div></div>' +
            '<div>' + h.statusBadge(ores.status) + '</div></div>';
        }).join('') + '</div></div>';
    }

    // activity
    var acts = S.state.activity.filter(function (a) { return a.text.indexOf(S.pad(t.number)) > -1; }).slice(0, 5);
    out += '<div class="card"><div class="card-head"><div><h3>Ticket activity</h3></div></div><div class="card-body">' +
      (acts.length ? acts.map(function (a) {
        return '<div style="display:flex;gap:10px;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line-2)">' +
          '<span style="font-size:13px">' + h.esc(a.text) + '</span>' +
          '<span style="margin-left:auto;font-size:11.5px;color:var(--faint);white-space:nowrap">' + h.esc(h.fmtDate(a.at.slice(0, 10))) + '</span></div>';
      }).join('') : '<p style="font-size:13px;color:var(--faint)">No activity recorded for this ticket yet.</p>') + '</div></div>';

    out += '</div></div>';
    return out;
  };
})(window);
