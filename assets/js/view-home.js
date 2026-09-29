/* =========================================================
   Home Lotts — dashboard view
   ========================================================= */
(function (global) {
  'use strict';
  var A = global.HLApp, H = global.HL, S = global.HLStore;
  var h = A.helpers;

  A.views.home = function () {
    var sum = S.summarise();
    var mapped = S.listTickets().map(function (t) { return { t: t, res: S.resolve(t) }; }).filter(function (x) { return x.res; });
    var unclaimed = mapped.filter(function (x) { return x.res.status === 'unclaimed'; });
    var winners = mapped.filter(function (x) { return x.res.status === 'winner'; });
    var upcoming = S.nextDraws();
    var myUpcoming = mapped.filter(function (x) { return x.res.status === 'upcoming'; });
    var nextMine = myUpcoming.slice().sort(function (a, b) { return h.parseDate(a.res.draw.date) - h.parseDate(b.res.draw.date); })[0];
    var closest = S.closestTicket();
    var p = S.state.profile;
    var first = (p.name || 'there').split(' ')[0];
    var soon = upcoming.filter(function (x) { return h.daysUntil(x.draw.date) <= 14; }).length;
    var out = '';

    out += h.pageHead('Dashboard', 'Greetings, ' + h.esc(first) + '.',
      'Every ticket you are holding, what needs checking, and what closes next.',
      '<button class="btn btn--ghost" data-action="add-ticket">' + h.ic('plus', 16) + ' Add ticket</button>' +
      '<a class="btn btn--primary" href="#/lotteries">' + h.ic('grid', 16) + ' Browse lotteries</a>');

    if (unclaimed.length) {
      out += '<div class="note" style="margin-bottom:16px"><span class="ic">' + h.ic('alert', 17) + '</span><div>' +
        '<strong>' + unclaimed.length + ' ticket' + (unclaimed.length > 1 ? 's have' : ' has') + ' a result waiting.</strong> ' +
        unclaimed.map(function (x) { return '<a href="#/tickets/' + x.t.id + '">' + S.pad(x.t.number) + '</a>'; }).join(', ') +
        ' from ' + unclaimed.map(function (x) { return x.res.lottery.charity; }).filter(h.unique).join(', ') +
        '. <a href="#/tickets?t=unclaimed">Check results ' + h.ic('chevron', 12) + '</a></div></div>';
    }

    out += '<div class="grid grid-4" style="margin-bottom:18px">';
    out += h.statCard({ label: 'Active tickets', value: sum.active, icon: 'ticket', href: '#/tickets?t=active', more: 'Tickets', sub: sum.total + ' entries · ' + sum.ticketCount + ' stubs' });
    out += h.statCard({ label: 'Results available', value: sum.unclaimed, icon: 'award', tone: 'pending', href: '#/results', more: 'Results', sub: unclaimed.length ? 'Waiting on your check' : 'All caught up' });
    out += h.statCard({ label: 'Upcoming draws', value: myUpcoming.length, icon: 'calendar', tone: 'soon', href: '#/draws', more: 'Draws', sub: soon + ' closing within 14 days' });
    out += h.statCard({ label: 'Prizes won', value: h.money(sum.prizeValue), icon: 'star', tone: 'win', href: '#/tickets?t=winner', more: 'Wins', sub: sum.winners + ' winning ticket' + (sum.winners === 1 ? '' : 's') + ' from ' + h.money(sum.spend) + ' spent' });
    out += '</div>';

    out += '<div class="split"><div class="stack">';

    // closest ticket
    out += '<div class="card"><div class="card-head"><div><h3>Closest ticket</h3><p>Your nearest result on a drawn draw</p></div>' +
      '<a class="btn btn--sm btn--ghost" href="#/tickets">All tickets</a></div>';
    if (closest) {
      var l = closest.res.lottery;
      out += '<div class="card-body" style="display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:18px;align-items:center">' +
        '<div><div class="row tight" style="margin-bottom:9px"><span class="ticket-chip">' + S.pad(closest.t.number) + '</span>' +
        h.statusBadge(closest.res.status) + (closest.t.demo ? h.demoChip() : '') + '</div>' +
        '<a href="#/lotteries/' + l.id + '" style="font-weight:600">' + h.esc(l.charity) + '</a>' +
        '<div style="color:var(--muted);font-size:13.5px;margin-top:2px">' + h.esc(l.headline) + ' · drawn ' + h.fmtDate(closest.res.draw.date) + '</div></div>' +
        '<div>' + h.howCloseBlock(closest.res) + '</div></div>' +
        '<div class="card-foot"><a class="btn btn--sm" href="#/tickets/' + closest.t.id + '">Open ticket ' + h.ic('chevron', 13) + '</a>' +
        (closest.res.status === 'unclaimed' ? '<button class="btn btn--sm btn--primary" data-action="check-ticket" data-id="' + closest.t.id + '">Check result</button>' : '') +
        '<span style="flex:1"></span><span style="font-size:12.5px;color:var(--faint)">Drawn number ' + h.esc(closest.res.howClose.nearest || '—') + '</span></div>';
    } else {
      out += h.emptyState('target', 'No drawn results yet',
        'Once one of your lotteries has been drawn, the closest ticket appears here with a digit-by-digit comparison.',
        '<a class="btn btn--sm" href="#/lotteries">Find a lottery</a>');
    }
    out += '</div>';

    // results available
    out += '<div class="card"><div class="card-head"><div><h3>Results available</h3><p>' +
      (unclaimed.length ? unclaimed.length + ' ticket' + (unclaimed.length > 1 ? 's' : '') + ' to check against the draw' : 'Nothing waiting') +
      '</p></div><a class="btn btn--sm btn--quiet" href="#/results">All results ' + h.ic('chevron', 12) + '</a></div>';
    if (unclaimed.length) {
      out += '<div class="rows">' + unclaimed.slice(0, 5).map(function (x) {
        return '<div class="rowitem" style="grid-template-columns:minmax(180px,1.3fr) minmax(150px,1fr) 130px auto">' +
          '<div class="lead"><div class="name"><a href="#/tickets/' + x.t.id + '"><span class="tnum">' + S.pad(x.t.number) + '</span></a>' +
          (x.t.demo ? ' ' + h.demoChip() : '') + '</div><div class="meta">' + h.esc(x.res.lottery.charity) + '</div></div>' +
          '<div><div style="font-size:13.5px">' + h.fmtDate(x.res.draw.date) + '</div><div class="meta">Drawn ' + h.esc(x.res.draw.time || '') + '</div></div>' +
          '<div>' + h.statusBadge('unclaimed') + '</div>' +
          '<div class="row-actions"><button class="btn btn--sm btn--primary" data-action="check-ticket" data-id="' + x.t.id + '">Check result</button></div></div>';
      }).join('') + '</div>';
    } else {
      out += '<div class="card-body">' + h.emptyState('check', 'All caught up',
        'Every drawn lottery in your portfolio has been checked.') + '</div>';
    }
    out += '</div>';

    // recently added
    var recent = S.listTickets().slice().sort(function (a, b) {
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }).slice(0, 5);
    if (recent.length) {
      out += '<div class="card"><div class="card-head"><div><h3>Recently added</h3><p>Your latest entries</p></div>' +
        '<a class="btn btn--sm btn--quiet" href="#/tickets">Manage all ' + h.ic('chevron', 12) + '</a></div><div class="rows">' +
        recent.map(function (t) {
          var res = S.resolve(t);
          return '<div class="rowitem" style="grid-template-columns:minmax(180px,1.3fr) minmax(150px,1fr) 130px 110px">' +
            '<div class="lead"><div class="name"><a href="#/tickets/' + t.id + '"><span class="tnum">' + S.pad(t.number) + '</span></a>' +
            (t.demo ? ' ' + h.demoChip() : '') + '</div><div class="meta">' + h.esc(res ? res.lottery.charity : 'Unknown lottery') + '</div></div>' +
            '<div style="font-size:13.5px">' + (res ? h.fmtDate(res.draw.date) : '—') +
            '<div class="meta">' + t.quantity + ' × ' + h.money(t.unitPrice) + '</div></div>' +
            '<div>' + h.statusBadge(res ? res.status : 'orphan') + '</div>' +
            '<div class="num-cell" style="text-align:right">' + h.money(t.quantity * t.unitPrice) + '</div></div>';
        }).join('') + '</div></div>';
    }

    out += '</div><div class="stack">';

    // next draw
    var nd = nextMine ? { lottery: nextMine.res.lottery, draw: nextMine.res.draw, t: nextMine.t } : (upcoming[0] || null);
    out += '<div class="card"><div class="card-head"><div><h3>Next draw</h3><p>' + (nextMine ? 'From your tickets' : 'Soonest in the catalogue') + '</p></div></div>';
    if (nd) {
      out += '<div class="card-body"><div class="spread" style="margin-bottom:14px"><div>' +
        '<a href="#/lotteries/' + nd.lottery.id + '" style="font-weight:650">' + h.esc(nd.lottery.charity) + '</a>' +
        '<div style="font-size:12.5px;color:var(--muted);margin-top:2px">' + nd.lottery.state + ' · ' + h.esc(nd.lottery.headline) + '</div></div>' +
        '<div style="text-align:right"><div style="font-family:var(--display);font-weight:800;font-size:17px">' + h.fmtDate(nd.draw.date) + '</div>' +
        '<div style="font-size:12px;color:var(--faint)">' + h.esc(nd.draw.time || '') + '</div></div></div>' +
        h.countdownHtml(nd.draw) +
        (nd.t ? '<div class="row tight" style="margin-top:14px"><span class="ticket-chip sm">' + S.pad(nd.t.number) + '</span>' +
          '<span style="font-size:12.5px;color:var(--muted)">' + nd.t.quantity + ' × ' + h.money(nd.t.unitPrice) + '</span>' +
          '<a class="btn btn--sm btn--quiet" style="margin-left:auto" href="#/tickets/' + nd.t.id + '">Open</a></div>' : '') +
        '<div class="row" style="margin-top:14px">' + h.enterButton(nd.lottery) + '</div></div>';
    } else {
      out += '<div class="card-body">' + h.emptyState('calendar', 'No upcoming draws', 'Every draw in the catalogue has been completed.') + '</div>';
    }
    out += '</div>';

    // portfolio
    out += '<div class="card"><div class="card-head"><div><h3>Your portfolio</h3><p>Spend by month</p></div>' +
      '<a class="btn btn--sm btn--quiet" href="#/tickets">Tickets</a></div><div class="card-body">' +
      '<dl class="kv" style="margin-bottom:18px">' +
      '<dt>Tickets entered</dt><dd>' + sum.ticketCount + ' stubs</dd>' +
      '<dt>Total spend</dt><dd>' + h.money(sum.spend) + '</dd>' +
      '<dt>Draws tracked</dt><dd>' + sum.drawsTracked + '</dd>' +
      '<dt>Prizes won</dt><dd style="color:' + (sum.prizeValue ? 'var(--win)' : 'var(--ink)') + '">' + h.money(sum.prizeValue) + '</dd>' +
      '<dt>Return</dt><dd>' + (sum.spend ? Math.round((sum.prizeValue / sum.spend) * 100) + '%' : '—') + '</dd></dl>' +
      spendChart() + '</div></div>';

    // prize history
    if (winners.length) {
      out += '<div class="card"><div class="card-head"><div><h3>Prize history</h3><p>Everything you have won</p></div>' +
        '<a class="btn btn--sm btn--quiet" href="#/tickets?t=winner">All wins ' + h.ic('chevron', 12) + '</a></div><div class="prizes">' +
        winners.slice(0, 4).map(function (x) {
          return '<a class="prize" href="#/tickets/' + x.t.id + '"><span class="rank">' + (x.res.tier ? x.res.tier.rank : '1') + '</span>' +
            '<span><span class="nm">' + h.esc(x.res.lottery.charity) + '</span>' +
            '<span class="ds" style="display:block">' + h.fmtDate(x.res.draw.date) + ' · ticket ' + S.pad(x.t.number) + '</span></span>' +
            '<span class="val">' + h.esc(x.t.prizeText || 'Prize') + '<small>won</small></span></a>';
        }).join('') + '</div></div>';
    }

    out += '</div></div>';
    out += trustStrip();
    return out;
  };

  function spendChart() {
    var months = [], now = new Date(), i;
    for (i = 5; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2), label: h.MONTHS[d.getMonth()], value: 0 });
    }
    S.listTickets().forEach(function (t) {
      if (!t.purchased) return;
      var m = months.filter(function (x) { return x.key === t.purchased.slice(0, 7); })[0];
      if (m) m.value += t.quantity * t.unitPrice;
    });
    if (!months.some(function (m) { return m.value > 0; })) return '<p style="font-size:12.5px;color:var(--faint)">No spend recorded yet.</p>';
    var max = Math.max.apply(null, months.map(function (m) { return m.value; }).concat([1]));
    return '<div class="bars">' + months.map(function (m) {
      return '<div class="b"><i style="height:' + Math.max(4, (m.value / max) * 100) + '%"></i><span>' + m.label + '</span></div>';
    }).join('') + '</div>';
  }

  function trustStrip() {
    var items = [
      { i: 'lock', t: 'Your tickets stay on your device', p: 'Nothing is uploaded or sold. Export or delete everything any time.' },
      { i: 'shield', t: 'Results shown with their source', p: 'Every result carries where and when it was published.' },
      { i: 'target', t: 'Honest “how close” comparisons', p: 'Digit-by-digit matching instead of vague encouragement.' },
      { i: 'heart', t: 'Cause first, not casino first', p: 'No flashing reels, no pressure tactics, no countdowns to bet against.' }
    ];
    return '<div style="margin-top:22px"><div class="trust">' + items.map(function (x) {
      return '<div class="t"><div class="ic">' + h.ic(x.i, 16) + '</div><h4>' + x.t + '</h4><p>' + x.p + '</p></div>';
    }).join('') + '</div></div>';
  }
})(window);
