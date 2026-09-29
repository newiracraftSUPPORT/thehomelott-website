/* =========================================================
   Home Lotts — results + upcoming draws
   ========================================================= */
(function (global) {
  'use strict';
  var A = global.HLApp, H = global.HL, S = global.HLStore;
  var h = A.helpers;
  var ui = A.ui;

  // ---------- RESULTS ----------
  A.views.results = function (r) {
    if (r.query.q) ui.resQ = r.query.q;
    var all = S.listTickets().map(function (t) { return { t: t, res: S.resolve(t) }; }).filter(function (x) { return x.res; });
    var mineByDraw = {};
    all.forEach(function (x) { (mineByDraw[x.res.draw.id] = mineByDraw[x.res.draw.id] || []).push(x); });

    var draws = H.allDraws().filter(function (d) { return d.status === 'drawn'; });
    var filtered = draws.filter(function (d) {
      if (ui.resLottery && d.lotteryId !== ui.resLottery) return false;
      if (ui.resMine && !mineByDraw[d.id]) return false;
      if (ui.resQ) {
        var l = H.getLottery(d.lotteryId);
        var hay = (l.name + ' ' + l.charity + ' ' + l.state + ' ' + l.region + ' ' + d.date).toLowerCase();
        if (hay.indexOf(ui.resQ.toLowerCase()) === -1) return false;
      }
      return true;
    });

    var checked = all.filter(function (x) { return x.res.status === 'winner' || x.res.status === 'no-prize'; });
    var wins = checked.filter(function (x) { return x.res.status === 'winner'; });
    var unclaimed = all.filter(function (x) { return x.res.status === 'unclaimed'; });
    var best = all.filter(function (x) { return x.res.status === 'no-prize'; })
      .sort(function (a, b) { return b.res.howClose.digits - a.res.howClose.digits; })[0];
    var winTotal = wins.reduce(function (a, x) { return a + (x.t.prizeValue || 0); }, 0);

    var out = h.pageHead('Draw outcomes', 'Results',
      'Winning numbers for every published draw, and how each of your tickets landed against them.',
      '<a class="btn btn--ghost" href="#/draws">' + h.ic('calendar', 15) + ' Upcoming draws</a>' +
      '<button class="btn btn--primary" data-action="add-ticket">' + h.ic('plus', 16) + ' Add ticket</button>');

    out += '<div class="note demo" style="margin-bottom:16px"><span class="ic">' + h.ic('info', 17) + '</span><div>' +
      '<strong>These are demo results.</strong> Every lottery, drawn number, winner count and result below is fictional sample data. ' +
      'Verified results are labelled <span class="badge badge--verified" style="vertical-align:middle">Verified</span> once we have checked them against a ' +
      'regulator-published draw sheet. <a href="/about.html#demo">Read how we label data</a>.</div></div>';

    if (unclaimed.length) {
      out += '<div class="note" style="margin-bottom:16px"><span class="ic">' + h.ic('alert', 17) + '</span><div><strong>' +
        unclaimed.length + ' of your tickets have results waiting.</strong> ' +
        unclaimed.map(function (x) { return '<a href="#/tickets/' + x.t.id + '">' + S.pad(x.t.number) + '</a>'; }).join(', ') +
        ' — <a href="#/tickets?t=unclaimed">open and check</a>.' +
        '<div class="row tight" style="margin-top:10px">' +
        '<button class="btn btn--sm btn--primary" data-action="check-all">' + h.ic('check', 15) + ' Check all ' + unclaimed.length + ' for me</button>' +
        '<span style="font-size:12.5px;color:var(--faint)">Matches each number against the drawn number, then records the tier.</span></div></div></div>';
    }

    out += '<div class="grid grid-4" style="margin-bottom:18px">' +
      h.statCard({ label: 'Draws published', value: draws.length, icon: 'award', sub: filtered.length + ' shown by current filter' }) +
      h.statCard({ label: 'Tickets checked', value: checked.length, icon: 'check', sub: (all.length - checked.length) + ' still to check' }) +
      h.statCard({ label: 'Prizes won', value: wins.length, icon: 'star', tone: 'win', sub: h.money(winTotal) + ' total value' }) +
      h.statCard({
        label: 'Closest miss', value: best ? best.res.howClose.digits + '/6' : '—', icon: 'target',
        sub: best ? S.pad(best.t.number) + ' missed by ' + (6 - best.res.howClose.digits) + ' digit' + ((6 - best.res.howClose.digits) > 1 ? 's' : '') : 'no misses yet'
      }) + '</div>';

    out += '<div class="toolbar"><div class="search">' + h.ic('search', 15) +
      '<input type="search" id="rq" placeholder="Search lottery, charity, state or date" value="' + h.esc(ui.resQ) + '" aria-label="Search results"></div>' +
      '<select class="select" id="rlot" aria-label="Filter by lottery"><option value="">All lotteries</option>' +
      H.lotteries.filter(function (l) { return l.draws.some(function (d) { return d.status === 'drawn'; }); })
        .map(function (l) { return '<option value="' + l.id + '"' + (ui.resLottery === l.id ? ' selected' : '') + '>' + h.esc(l.charity) + '</option>'; }).join('') +
      '</select>' +
      '<button class="chip' + (ui.resMine ? ' active' : '') + '" data-action="res-mine">' + (ui.resMine ? h.ic('check', 13) : '') + ' Only draws I hold tickets in</button>' +
      '</div>';

    if (!filtered.length) {
      out += '<div class="card">' + h.emptyState('award', 'No results to show',
        ui.resMine ? 'You do not hold tickets in any drawn lottery yet. Turn off the filter to browse every published result.'
          : 'No published draws match that search.',
        ui.resMine ? '<button class="btn btn--ghost" data-action="res-mine">Show all results</button>' : '') + '</div>';
      return out;
    }

    out += '<div class="stack">';
    filtered.forEach(function (d) {
      var l = H.getLottery(d.lotteryId);
      var mine = mineByDraw[d.id] || [];
      out += '<div class="card"><div class="card-head"><div><div class="row tight" style="margin-bottom:6px">' +
        '<span class="badge badge--soft">' + l.state + '</span>' + h.demoChip('Fictional sample result') +
        '<span class="badge badge--soft">Drawn ' + h.fmtDate(d.date) + '</span></div>' +
        '<h3><a href="#/lotteries/' + l.id + '">' + h.esc(l.charity) + '</a></h3>' +
        '<p>' + h.esc(l.headline) + ' · ' + d.sold.toLocaleString('en-AU') + ' eligible tickets</p></div>' +
        '<a class="btn btn--sm btn--ghost" href="#/lotteries/' + l.id + '">Lottery page</a></div>';

      out += '<div class="card-body"><div class="spread" style="align-items:flex-start;gap:18px"><div>' +
        '<div class="eyebrow muted" style="margin-bottom:8px">Winning numbers</div>' +
        '<div class="winning">' + d.winningNumbers.map(function (n) { return '<span class="n">' + S.pad(n) + '</span>'; }).join('') + '</div>' +
        '<div class="row tight" style="margin-top:12px">' + l.tiers.map(function (t) {
          return '<span class="badge badge--soft">' + h.esc(t.label) + ' · ' + h.esc(t.valueText) + '</span>';
        }).join('') + '</div></div>' +
        '<div style="text-align:right;flex:0 0 auto"><div class="eyebrow muted">Published</div>' +
        '<div style="font-size:13.5px;font-weight:600">' + h.fmtDate(d.published || d.date) + '</div>' +
        '<div style="font-size:12px;color:var(--faint);max-width:250px;margin-left:auto">' + h.esc(d.resultPublishedBy || 'Published by the organiser') + '</div></div></div>' +
        (d.notes ? '<p style="font-size:12.5px;color:var(--faint);margin-top:12px">' + h.ic('info', 12) + ' ' + h.esc(d.notes) + '</p>' : '') +
        '</div>';

      if (mine.length) {
        out += '<div class="mine" style="padding:0 18px 16px"><div class="eyebrow muted">Your tickets in this draw</div>' +
          mine.map(function (x) {
            return '<div class="mine-row"><a class="tnum" href="#/tickets/' + x.t.id + '">' + S.pad(x.t.number) + '</a>' +
              (x.t.demo ? h.demoChip() : '') + h.statusBadge(x.res.status) +
              '<span style="color:var(--muted)">' + x.res.howClose.digits + '/6 digits' +
              (x.res.tier ? ' · ' + h.esc(x.res.tier.valueText) : '') + '</span>' +
              '<span style="margin-left:auto;display:flex;gap:6px">' +
              (x.res.status === 'unclaimed' ? '<button class="btn btn--sm btn--primary" data-action="check-ticket" data-id="' + x.t.id + '">Check result</button>'
                : (x.res.status === 'winner' ? '<button class="btn btn--sm btn--ghost" data-action="set-tier" data-id="' + x.t.id + '">Edit prize</button>' : '')) +
              '<a class="btn btn--sm btn--quiet" href="#/tickets/' + x.t.id + '">Open</a></span></div>';
          }).join('') + '</div>';
      } else {
        out += '<div class="card-foot" style="font-size:12.5px;color:var(--faint)">' + h.ic('info', 13) +
          ' You do not hold a ticket in this draw. ' + h.enterButton(l, 'sm') + '</div>';
      }
      out += '</div>';
    });
    out += '</div>';
    return out;
  };

  // ---------- UPCOMING DRAWS ----------
  A.views.draws = function (r) {
    if (r.query.q) ui.drawQ = r.query.q;
    var all = S.nextDraws();
    var myByDraw = {};
    S.listTickets().forEach(function (t) { (myByDraw[t.drawId] = myByDraw[t.drawId] || []).push(t); });
    var myOpen = Object.keys(myByDraw).filter(function (id) {
      var d = H.getDraw(id); return d && d.status !== 'drawn';
    }).length;

    var rows = all.filter(function (x) {
      if (ui.drawState && x.lottery.state !== ui.drawState) return false;
      if (ui.drawMine && !myByDraw[x.draw.id]) return false;
      if (ui.drawQ) {
        var hay = (x.lottery.name + ' ' + x.lottery.charity + ' ' + x.lottery.state + ' ' + x.lottery.region + ' ' + x.lottery.headline).toLowerCase();
        if (hay.indexOf(ui.drawQ.toLowerCase()) === -1) return false;
      }
      return true;
    });
    function topValue(l) { return l.tiers[0].value || 0; }
    rows.sort(function (a, b) {
      if (ui.drawSort === 'value') return topValue(b.lottery) - topValue(a.lottery);
      if (ui.drawSort === 'sold') return (b.draw.sold / b.lottery.total) - (a.draw.sold / a.lottery.total);
      if (ui.drawSort === 'price') return a.lottery.price - b.lottery.price;
      return h.parseDate(a.draw.date) - h.parseDate(b.draw.date);
    });

    var soon = all.filter(function (x) { return h.daysUntil(x.draw.date) <= 14; });
    var closing = all.filter(function (x) { return h.daysUntil(x.draw.date) <= 0; });
    var maxPrize = Math.max.apply(null, all.map(function (x) { return topValue(x.lottery); }).concat([0]));

    var out = h.pageHead('What is coming up', 'Upcoming draws',
      'Every published draw that has not happened yet — with countdowns, ticket prices and where your own tickets sit.',
      '<a class="btn btn--ghost" href="#/results">' + h.ic('award', 15) + ' See results</a>' +
      '<a class="btn btn--primary" href="#/lotteries">' + h.ic('grid', 15) + ' Browse lotteries</a>');

    if (closing.length) {
      out += '<div class="note warn" style="margin-bottom:16px"><span class="ic">' + h.ic('alert', 17) + '</span><div><strong>' +
        closing.length + ' draw' + (closing.length > 1 ? 's close' : ' closes') + ' today or has just passed.</strong> ' +
        closing.map(function (x) { return '<a href="#/lotteries/' + x.lottery.id + '">' + h.esc(x.lottery.charity) + '</a>'; }).join(', ') +
        ' — confirm the closing time on the organiser’s site before entering.</div></div>';
    }

    out += '<div class="grid grid-4" style="margin-bottom:18px">' +
      h.statCard({ label: 'Draws scheduled', value: all.length, icon: 'calendar', sub: H.lotteries.length + ' lotteries in the demo catalogue' }) +
      h.statCard({ label: 'Closing within 14 days', value: soon.length, tone: 'soon', icon: 'clock', sub: soon.length ? 'Next: ' + soon[0].lottery.charity : 'nothing urgent' }) +
      h.statCard({ label: 'Your open entries', value: myOpen, icon: 'ticket', href: '#/tickets?t=upcoming', more: 'View', sub: 'tickets in draws still to come' }) +
      h.statCard({ label: 'Top prize on offer', value: h.moneyShort(maxPrize), icon: 'star', sub: 'across all open draws' }) + '</div>';

    out += '<div class="toolbar"><div class="search">' + h.ic('search', 15) +
      '<input type="search" id="dq" placeholder="Search lottery, charity or cause" value="' + h.esc(ui.drawQ) + '" aria-label="Search draws"></div>' +
      '<select class="select" id="dstate" aria-label="Filter by state"><option value="">All states</option>' +
      H.states.map(function (s) { return '<option value="' + s + '"' + (ui.drawState === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
      '<select class="select" id="dsort" aria-label="Sort draws">' +
      [['soon', 'Soonest first'], ['value', 'Top prize value'], ['sold', 'Most sold'], ['price', 'Lowest ticket price']].map(function (o) {
        return '<option value="' + o[0] + '"' + (ui.drawSort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>' +
      '<button class="chip' + (ui.drawMine ? ' active' : '') + '" data-action="draw-mine">' + (ui.drawMine ? h.ic('check', 13) : '') + ' Only draws I hold tickets in</button>' +
      '</div>';

    if (!rows.length) {
      out += '<div class="card">' + h.emptyState('calendar', 'No draws match', 'Try clearing the filters to see every scheduled draw.',
        '<button class="btn btn--ghost" data-action="clear-draw-filters">Clear filters</button>') + '</div>';
      return out;
    }

    var groups = [];
    rows.forEach(function (x) {
      var key = h.fmtMonth(x.draw.date);
      var g = groups.filter(function (y) { return y.key === key; })[0];
      if (!g) { g = { key: key, items: [] }; groups.push(g); }
      g.items.push(x);
    });

    groups.forEach(function (g) {
      out += '<div class="card" style="margin-bottom:16px"><div class="month-head">' + g.key + ' · ' + g.items.length + ' draw' + (g.items.length > 1 ? 's' : '') + '</div>';
      g.items.forEach(function (x) {
        var l = x.lottery, d = x.draw, mine = myByDraw[d.id] || [];
        var dd = h.parseDate(d.date);
        var pct = Math.min(100, Math.round((d.sold / l.total) * 100));
        var left = h.daysUntil(d.date);
        out += '<div class="draw-item">' +
          '<div class="draw-date"><div class="d">' + dd.getDate() + '</div><div class="m">' + h.MONTHS[dd.getMonth()] + '</div></div>' +
          '<div><div class="row tight" style="margin-bottom:5px">' +
          (left <= 14 ? '<span class="badge badge--soon">' + (left <= 0 ? 'Closing' : h.esc(h.relative(d.date))) + '</span>' : '') +
          '<span class="badge badge--soft">' + l.state + '</span>' +
          (mine.length ? '<span class="badge badge--soft">' + mine.length + ' of your tickets</span>' : '') + '</div>' +
          '<a class="nm" href="#/lotteries/' + l.id + '">' + h.esc(l.charity) + '</a>' +
          '<div class="meta"><span>' + h.esc(l.headline) + '</span><span>' + h.money(l.price) + ' per ticket</span><span>' + h.esc(d.time || '') + '</span></div>' +
          '<div class="sold" style="max-width:360px;margin-top:9px"><div class="lbl"><span>Tickets sold</span><span>' +
          d.sold.toLocaleString('en-AU') + ' of ' + l.total.toLocaleString('en-AU') + ' (' + pct + '%)</span></div>' +
          '<div class="track"><i style="width:' + pct + '%"></i></div></div></div>' +
          '<div class="right">' + h.countdownHtml(d, true) +
          '<div class="row tight">' + h.enterButton(l, 'sm') +
          (mine.length ? '<a class="btn btn--sm btn--ghost" href="#/tickets/' + mine[0].id + '">' + S.pad(mine[0].number) + '</a>' : '') +
          '</div></div></div>';
      });
      out += '</div>';
    });

    out += '<p style="font-size:12.5px;color:var(--faint)">Countdowns use the organiser’s published draw time. Draw times can change — always confirm on the organiser’s site before entering. ' +
      'Closing dates and sold counts in this catalogue are demo data.</p>';
    return out;
  };
})(window);
