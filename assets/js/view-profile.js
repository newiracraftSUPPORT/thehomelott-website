/* =========================================================
   Home Lotts — profile, settings, data controls
   ========================================================= */
(function (global) {
  'use strict';
  var A = global.HLApp, H = global.HL, S = global.HLStore;
  var h = A.helpers;

  A.views.profile = function () {
    var p = S.state.profile;
    var sum = S.summarise();
    var demoCount = S.listTickets({ demoOnly: true }).length;
    var realCount = S.listTickets({ realOnly: true }).length;
    var out = h.pageHead('Your account', 'Profile & settings',
      'No password, no sign-up, no tracking. Your tickets and settings live in this browser only.', '');

    out += '<div class="split"><div class="stack">';

    // details
    out += '<div class="card"><div class="card-head"><div><h3>Your details</h3><p>Used to pre-fill new tickets and reminders</p></div>' +
      '<span class="badge badge--soft">Stored locally</span></div>' +
      '<form class="card-body" data-form="profile"><div class="form-grid">' +
      h.fld('Your name', 'name', 'text', p.name, 'First name is enough') +
      h.fld('Email', 'email', 'email', p.email, 'Only used if you switch reminders on') +
      h.fld('State', 'state', 'select', p.state, '', H.states.map(function (s) {
        return '<option' + (s === p.state ? ' selected' : '') + '>' + s + '</option>';
      }).join('')) +
      h.fld('Region', 'region', 'text', p.region, 'e.g. Brisbane & Moreton Bay') +
      h.fld('Default retailer', 'retailer', 'text', p.retailer, 'Pre-filled when you add a ticket', true) +
      h.fld('Reminder digest', 'digest', 'select', p.digest, '', ['none', 'daily', 'weekly'].map(function (d) {
        return '<option value="' + d + '"' + (d === p.digest ? ' selected' : '') + '>' + d.charAt(0).toUpperCase() + d.slice(1) + '</option>';
      }).join('')) +
      '</div><div class="row" style="margin-top:18px"><button class="btn btn--primary" type="submit">Save details</button>' +
      '<span style="font-size:12.5px;color:var(--faint)">Nothing here leaves your device.</span></div></form></div>';

    // preferences
    out += '<div class="card"><div class="card-head"><div><h3>Reminders &amp; preferences</h3><p>Decide what you want to hear about</p></div></div>' +
      '<div class="card-body">' +
      h.sw('drawAlerts', 'Draw reminders', 'A nudge the day before a draw you hold tickets in') +
      h.sw('closingAlerts', 'Closing soon alerts', 'A heads-up when entries close within three days') +
      h.sw('resultAlerts', 'Result alerts', 'Tell me when results are published for my tickets') +
      h.sw('resultsAutoCheck', 'Auto-check my results', 'Match my tickets to the draw sheet as soon as results appear') +
      h.sw('reduceMotion', 'Reduce motion', 'Turn off countdowns and transitions') +
      h.sw('useAffiliateLinks', 'Use my configured links', 'Off means every ENTER NEXT DRAW button links straight to the organiser') +
      h.sw('demoBanner', 'Show the demo data banner', 'Keep the reminder that this catalogue is fictional sample data') +
      '</div></div>';

    // affiliate links
    out += '<div class="card"><div class="card-head"><div><h3>Affiliate links</h3><p>Point every “ENTER NEXT DRAW →” button at your own link</p></div>' +
      (p.affiliateDefault ? '<span class="badge badge--verified">Default set</span>' : '<span class="badge badge--soft">Catalogue links</span>') + '</div>' +
      '<div class="card-body">' +
      '<div class="note plain" style="margin-bottom:18px"><span class="ic">' + h.ic('info', 16) + '</span><div>' +
      'Buttons use the lottery-specific link if one is set, otherwise your default link, otherwise the catalogue link. ' +
      'They open in a new tab with <code>rel="sponsored nofollow"</code>. We never take a share of prize money, never handle payment, and never see your ticket details. ' +
      'Read the <a href="/affiliate-disclosure.html">affiliate disclosure</a>.</div></div>' +

      '<form data-form="affiliate-default"><div class="field"><label for="f-ad">Default affiliate link</label>' +
      '<input class="input" type="url" name="affiliateDefault" id="f-ad" value="' + h.esc(p.affiliateDefault || '') + '" placeholder="https://your-domain.example/?ref=home-lotts">' +
      '<span class="hint">Used for any lottery without its own link. Leave blank to fall back to the catalogue link.</span></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn btn--primary" type="submit">Save default link</button>' +
      (p.affiliateDefault ? '<button class="btn btn--ghost" type="button" data-action="clear-affiliate-default">Remove default</button>' : '') +
      '</div></form>' +

      '<div style="margin-top:24px;border-top:1px solid var(--line-2);padding-top:18px">' +
      '<div class="eyebrow muted" style="margin-bottom:10px">Per-lottery overrides · ' + Object.keys(S.state.affiliates).length + ' set</div>' +
      '<div class="stack" style="gap:10px">' + H.lotteries.map(function (l) {
        var cur = S.state.affiliates[l.id] || '';
        var src = S.affiliateSource(l.id);
        return '<form data-form="affiliate" data-lottery="' + l.id + '" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center">' +
          '<div><label for="a-' + l.id + '" style="font-size:13.5px;font-weight:600">' + h.esc(l.charity) + '</label>' +
          '<div style="font-size:12px;color:var(--faint);margin-top:1px">Currently using: <strong>' + h.esc(src) + '</strong>' +
          (cur ? ' · <span class="tnum" style="font-size:11.5px">' + h.esc(cur) + '</span>' : '') + '</div></div>' +
          '<div style="display:flex;gap:6px">' +
          '<input class="input" style="min-width:210px" type="url" id="a-' + l.id + '" name="url" value="' + h.esc(cur) + '" placeholder="' + h.esc(l.enterUrl) + '">' +
          '<button class="btn btn--sm" type="submit">Save</button>' +
          (cur ? '<button class="btn btn--sm btn--quiet" type="button" data-action="clear-affiliate" data-lottery="' + l.id + '" aria-label="Reset link">' + h.ic('x', 14) + '</button>' : '') +
          '</div></form>';
      }).join('') + '</div></div></div></div>';

    // data
    out += '<div class="card"><div class="card-head"><div><h3>Data &amp; privacy</h3><p>Your tickets live in this browser’s local storage</p></div>' +
      '<span class="badge badge--soft">' + sum.total + ' entries</span></div><div class="card-body">' +
      '<div class="grid grid-2" style="gap:14px">' +
      dataCard('download', 'Export CSV', 'A spreadsheet of every ticket, spend, status and prize. Opens in Excel, Numbers or Google Sheets.', '<button class="btn btn--sm" data-action="export-csv">Export CSV</button>') +
      dataCard('file', 'Export backup', 'A JSON file with your tickets, settings and links. Keep it somewhere safe.', '<button class="btn btn--sm" data-action="export-json">Download backup</button>') +
      dataCard('upload', 'Import backup', 'Load a Home Lotts backup file. Duplicate ticket numbers are skipped.', '<button class="btn btn--sm" data-action="import-json">Choose file</button><input type="file" id="import-file" accept="application/json,.json" hidden>') +
      dataCard('lock', 'Demo data', demoCount + ' demo entries are currently loaded. Remove them to start with a clean, personal portfolio.', '<button class="btn btn--sm btn--ghost" data-action="clear-demo"' + (demoCount ? '' : ' disabled') + '>Remove demo tickets</button>') +
      '</div>' +
      '<div class="row" style="margin-top:16px"><button class="btn btn--sm btn--ghost" data-action="load-demo"' + (demoCount ? ' disabled' : '') + '>' + h.ic('spark', 15) + ' Load sample portfolio</button>' +
      '<span style="font-size:12.5px;color:var(--faint)">Adds fictional tickets so you can see the app with data in it.</span></div>' +

      '<div class="note warn" style="margin-top:20px"><span class="ic">' + h.ic('alert', 17) + '</span><div>' +
      '<strong>Delete everything</strong> — removes all ' + sum.total + ' ticket' + (sum.total === 1 ? '' : 's') + ' from this browser. ' +
      'There is no cloud copy, so export a backup first if you might want it later.' +
      '<div class="row" style="margin-top:10px"><button class="btn btn--sm btn--danger" data-action="clear-all"' + (sum.total ? '' : ' disabled') + '>' +
      h.ic('trash', 14) + ' Delete all my tickets</button></div></div></div>' +
      '</div></div>';

    out += '</div><div class="stack">';

    // summary
    out += '<div class="card"><div class="card-head"><div><h3>At a glance</h3><p>Your portfolio summary</p></div></div>' +
      '<div class="card-body"><dl class="kv">' +
      '<dt>Total entries</dt><dd>' + sum.total + '</dd>' +
      '<dt>Your own tickets</dt><dd>' + realCount + '</dd>' +
      '<dt>Demo entries</dt><dd>' + sum.demo + '</dd>' +
      '<dt>Ticket stubs</dt><dd>' + sum.ticketCount + '</dd>' +
      '<dt>Total spend</dt><dd>' + h.money(sum.spend) + '</dd>' +
      '<dt>Prizes won</dt><dd style="color:var(--win)">' + h.money(sum.prizeValue) + '</dd>' +
      '<dt>Draws tracked</dt><dd>' + sum.drawsTracked + '</dd>' +
      '<dt>Results waiting</dt><dd>' + sum.unclaimed + '</dd></dl>' +
      '<div class="row tight" style="margin-top:16px"><a class="btn btn--sm btn--ghost" href="#/tickets">My tickets</a>' +
      '<a class="btn btn--sm btn--ghost" href="#/results">Results</a></div></div></div>';

    // activity
    out += '<div class="card"><div class="card-head"><div><h3>Recent activity</h3><p>What you have done in this browser</p></div></div>' +
      '<div class="card-body">' +
      (S.state.activity.length
        ? S.state.activity.slice(0, 8).map(function (a) {
            return '<div style="display:flex;gap:10px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--line-2)">' +
              '<span style="font-size:13px">' + h.esc(a.text) + '</span>' +
              '<span style="margin-left:auto;font-size:11.5px;color:var(--faint);white-space:nowrap">' + h.esc(h.fmtDate(a.at.slice(0, 10))) + '</span></div>';
          }).join('')
        : '<p style="font-size:13px;color:var(--faint)">Nothing yet.</p>') +
      '</div></div>';

    // privacy
    out += '<div class="card"><div class="card-head"><div><h3>Privacy</h3><p>Short version</p></div></div><div class="card-body">' +
      '<ul style="margin:0;padding-left:18px;font-size:13.5px;color:var(--muted);line-height:1.8">' +
      '<li>Your tickets and notes are stored in this browser only. No account, no server, no sync.</li>' +
      '<li>We do not sell, rent or share your data. There is nothing to sell because we do not collect it.</li>' +
      '<li>Clearing your browser data, or pressing “Delete all my tickets”, removes everything immediately.</li>' +
      '<li>“Enter next draw” links take you to the organiser’s site, which has its own privacy policy.</li></ul>' +
      '<div class="row tight" style="margin-top:16px"><a class="btn btn--sm btn--ghost" href="/privacy.html">Privacy policy</a>' +
      '<a class="btn btn--sm btn--ghost" href="/terms.html">Terms of service</a>' +
      '<a class="btn btn--sm btn--ghost" href="/affiliate-disclosure.html">Affiliate disclosure</a>' +
      '<a class="btn btn--sm btn--ghost" href="/accessibility.html">Accessibility</a></div>' +
      '<p style="font-size:12px;color:var(--faint);margin-top:14px">Questions? <a href="mailto:' + H.brand.email + '" style="text-decoration:underline">' + H.brand.email + '</a></p>' +
      '</div></div>';

    out += '</div></div>';
    return out;
  };

  function dataCard(icon, title, body, action) {
    return '<div style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:14px;background:var(--surface-2)">' +
      '<div class="row tight" style="margin-bottom:8px"><span style="width:26px;height:26px;border-radius:8px;background:var(--bg-tint);display:grid;place-items:center;color:var(--ink-2)">' +
      h.ic(icon, 14) + '</span><h4 style="font-size:14px">' + title + '</h4></div>' +
      '<p style="font-size:12.5px;color:var(--muted);margin-bottom:12px">' + body + '</p>' + action + '</div>';
  }
})(window);
