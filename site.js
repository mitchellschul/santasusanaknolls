/* Santa Susana Knolls: fills each page from the files in the content/ folder.
   Edit content with Pages CMS (app.pagescms.org), not here. */
(function () {
  "use strict";

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function load(name) {
    return fetch("content/" + name + ".json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(name + ".json: " + r.status);
      return r.json();
    });
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function has(s) { return s != null && String(s).trim() !== ""; }
  function img(src) { return String(src || "").replace(/^\//, ""); }

  /* ---------- Meetings: first Tuesday of each chosen month ---------- */
  function meetingMonths(settings) {
    var m = (settings.meeting_months || []).map(function (x) { return parseInt(x, 10) - 1; })
      .filter(function (x) { return x >= 0 && x <= 11; });
    return m.length ? m : [1, 3, 5, 7, 9, 11];
  }
  function firstTuesday(y, m) {
    var d = new Date(y, m, 1);
    return new Date(y, m, 1 + ((2 - d.getDay() + 7) % 7));
  }
  function upcoming(settings, count) {
    var months = meetingMonths(settings), now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var out = [], y = today.getFullYear(), m = today.getMonth();
    for (var guard = 0; out.length < count && guard < 60; guard++) {
      if (months.indexOf(m) !== -1) {
        var d = firstTuesday(y, m);
        if (d >= today) out.push(d);
      }
      if (++m > 11) { m = 0; y++; }
    }
    return out;
  }
  function fmt(d, opts) { return d.toLocaleDateString("en-US", opts); }

  function nextMeetingHTML(s) {
    var d = upcoming(s, 1)[0];
    if (!d) return "";
    var isToday = d.toDateString() === new Date().toDateString();
    var place = has(s.meeting_place) ? " at the " + String(s.meeting_place).replace(/^the\s+/i, "") : "";
    return '<div class="meeting">' +
      '<div class="cal" aria-hidden="true"><div class="m">' + fmt(d, { month: "short" }).toUpperCase() +
      '</div><div class="d">' + d.getDate() + '</div><div class="w">' + fmt(d, { weekday: "short" }).toUpperCase() + "</div></div>" +
      "<div>" +
      '<p class="label">Next HOA meeting</p>' +
      '<p class="when">' + fmt(d, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) +
      (isToday ? ' <span class="today">Tonight</span>' : "") + "</p>" +
      (has(s.meeting_time) || place ? "<p>" + esc((s.meeting_time || "") + place) + "</p>" : "") +
      (has(s.meeting_note) ? "<p>" + esc(s.meeting_note) + "</p>" : "") +
      "</div></div>";
  }
  function meetingListHTML(s, n) {
    return '<ul class="dates">' + upcoming(s, n).map(function (d) {
      return '<li><span class="d">' + fmt(d, { weekday: "short", month: "long", day: "numeric", year: "numeric" }) +
        '</span><span class="t">' + esc(s.meeting_time) + "</span></li>";
    }).join("") + "</ul>";
  }

  /* ---------- Shared pieces ---------- */
  function mailto(email) {
    return has(email) ? '<a href="mailto:' + esc(email) + '">' + esc(email) + "</a>" : "";
  }
  function weblink(site) {
    if (!has(site)) return "";
    site = String(site).trim();
    var url = /^https?:\/\//i.test(site) ? site : "https://" + site;
    var label = site.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>";
  }
  function hoaEmail(s) { return has(s.hoa_email) ? mailto(s.hoa_email) : "posted soon"; }
  function figure(src, alt, caption, cls) {
    if (!has(src)) return "";
    return '<figure class="' + (cls || "figure-wide") + '"><img src="' + esc(img(src)) + '" alt="' + esc(alt) + '" loading="lazy">' +
      (has(caption) ? "<figcaption>" + esc(caption) + "</figcaption>" : "") + "</figure>";
  }
  function pageHead(title, lede) {
    return '<div class="wrap page-head"><h1>' + esc(title) + "</h1>" + (has(lede) ? '<p class="lede">' + esc(lede) + "</p>" : "") + "</div>";
  }
  function eventsHTML(events) {
    var now = new Date();
    var todayKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    var list = (events || []).filter(function (e) { return has(e.title) && (!has(e.date) || e.date >= todayKey); });
    list.sort(function (a, b) { return (a.date || "9999").localeCompare(b.date || "9999"); });
    if (!list.length) return '<p class="empty">No upcoming events right now. Check back soon.</p>';
    return '<ul class="ruled">' + list.map(function (e) {
      var when = [];
      if (has(e.date)) {
        var p = e.date.split("-");
        when.push(fmt(new Date(+p[0], +p[1] - 1, +p[2]), { weekday: "long", month: "long", day: "numeric" }));
      }
      if (has(e.time)) when.push(e.time);
      if (has(e.place)) when.push(e.place);
      return "<li><h3>" + esc(e.title) + "</h3>" +
        (when.length ? '<p class="when">' + esc(when.join(" · ")) + "</p>" : "") +
        (has(e.details) ? "<p>" + esc(e.details) + "</p>" : "") + "</li>";
    }).join("") + "</ul>";
  }

  /* ---------- Pages ---------- */
  var pages = {
    home: function () {
      return Promise.all([load("home"), load("settings"), load("events")]).then(function (r) {
        var h = r[0], s = r[1], ev = r[2];
        return (has(h.hero_image) ? '<section class="hero"><img src="' + esc(img(h.hero_image)) + '" alt="' + esc(h.hero_alt) + '"></section>' : "") +
          '<section class="wrap intro"><h1>' + esc(h.title) + '</h1><div class="rich">' + (h.intro || "") + "</div></section>" +
          '<section class="band"><div class="wrap grid-2">' + nextMeetingHTML(s) +
          "<div><h2>Upcoming meetings</h2>" + meetingListHTML(s, 4) + "</div></div></section>" +
          '<section class="section"><div class="wrap grid-2"><div><h2>Community events</h2>' + eventsHTML(ev.events) +
          '<p style="margin-top:14px">Have a neighborhood event to share? <a href="hoa.html#board">Email the HOA board.</a></p></div>' +
          figure(h.side_image, h.side_alt, h.side_caption) + "</div></section>" +
          '<section class="section"><div class="wrap"><h2>Find what you need</h2><div class="links3">' +
          '<a href="hoa.html"><strong>HOA board &amp; meetings</strong><span>Board members, email addresses and the meeting schedule.</span></a>' +
          '<a href="contact.html"><strong>Community contacts</strong><span>Sheriff, fire, animal services, utilities, trash and county offices.</span></a>' +
          '<a href="about.html"><strong>About the Knolls</strong><span>Our history, landmarks and what makes the neighborhood special.</span></a>' +
          "</div></div></section>";
      });
    },

    about: function () {
      return load("about").then(function (a) {
        var html = pageHead(a.title, a.lede);
        (a.sections || []).forEach(function (sec, i) {
          var text = (has(sec.heading) ? "<h2>" + esc(sec.heading) + "</h2>" : "") + '<div class="rich">' + (sec.text || "") + "</div>";
          html += '<section class="section"' + (i === 0 ? ' style="padding-top:32px"' : "") + '><div class="wrap' + (has(sec.image) ? " grid-2" : "") + '">' +
            (has(sec.image) ? "<div>" + text + "</div>" + figure(sec.image, sec.image_alt, sec.caption) : '<div class="narrow">' + text + "</div>") +
            "</div></section>";
        });
        var lm = (a.landmarks || []).filter(function (l) { return has(l.name); });
        if (lm.length) {
          html += '<section class="section"><div class="wrap"><h2>Local landmarks</h2><div class="facts">' +
            lm.map(function (l) { return "<div><h3>" + esc(l.name) + "</h3><p>" + esc(l.text) + "</p></div>"; }).join("") + "</div></div></section>";
        }
        var g = (a.gallery || []).filter(function (p) { return has(p.image); });
        if (g.length) {
          html += '<section class="section"><div class="wrap"><h2>Around the neighborhood</h2><div class="photo-row">' +
            g.map(function (p) { return figure(p.image, p.alt, p.caption, "photo"); }).join("") + "</div></div></section>";
        }
        return html;
      });
    },

    hoa: function () {
      return Promise.all([load("hoa"), load("settings"), load("board")]).then(function (r) {
        var h = r[0], s = r[1], b = r[2];
        var members = (b.members || []).filter(function (m) { return has(m.name); });
        var board = members.length
          ? '<div class="table-wrap"><table><thead><tr><th scope="col">Position</th><th scope="col">Name</th><th scope="col">Email</th></tr></thead><tbody>' +
            members.map(function (m) { return "<tr><td><strong>" + esc(m.role) + "</strong></td><td>" + esc(m.name) + "</td><td>" + mailto(m.email) + "</td></tr>"; }).join("") +
            "</tbody></table></div>"
          : '<p class="empty">Board member names and email addresses will be posted here soon. In the meantime, come to the next HOA meeting to meet the board.</p>';
        return pageHead(h.title, h.lede) +
          '<section class="band" id="meetings"><div class="wrap grid-2"><div>' + nextMeetingHTML(s) +
          '<h2 style="margin-top:32px">Meeting schedule</h2><div class="rich">' + (h.schedule_text || "") + "</div></div>" +
          "<div><h2>Next six meetings</h2>" + meetingListHTML(s, 6) + "</div></div></section>" +
          '<section class="section" id="board"><div class="wrap"><h2>HOA board</h2><div class="rich">' + (h.board_text || "") + "</div>" +
          board + '<p style="margin-top:16px">General HOA email: ' + hoaEmail(s) + "</p></div></section>" +
          '<section class="section"><div class="wrap grid-2"><div><h2>Membership</h2><div class="rich">' + (h.membership_text || "") + "</div></div>" +
          (has(h.board_does_text) ? '<div class="callout"><h3>What the board does</h3><div class="rich">' + h.board_does_text + "</div></div>" : "") +
          "</div></section>";
      });
    },

    contact: function () {
      return Promise.all([load("contact"), load("settings"), load("contacts")]).then(function (r) {
        var c = r[0], s = r[1], groups = r[2].groups || [];
        var html = pageHead(c.title, c.lede) +
          '<section class="section" style="padding-top:32px"><div class="wrap"><div class="emergency"><span class="big">911</span><p>' + esc(c.emergency_text) + "</p></div></div></section>" +
          '<section class="section"><div class="wrap"><div class="callout" style="margin-bottom:40px"><h3>Contact the HOA</h3>' +
          "<p>General HOA email: " + hoaEmail(s) + '</p><p>Each board member\'s email is listed on the <a href="hoa.html#board">HOA page</a>.</p></div>';
        groups.forEach(function (g) {
          var rows = (g.contacts || []).filter(function (x) { return has(x.name); });
          if (!rows.length) return;
          html += '<div class="contact-group"><h2>' + esc(g.title) + "</h2>" + (has(g.intro) ? "<p>" + esc(g.intro) + "</p>" : "") +
            '<div class="table-wrap contacts"><table><thead><tr><th scope="col">Who</th><th scope="col">Phone</th><th scope="col">Website</th></tr></thead><tbody>' +
            rows.map(function (x) {
              return "<tr><td><strong>" + esc(x.name) + "</strong>" + (has(x.note) ? "<small>" + esc(x.note) + "</small>" : "") +
                '</td><td class="num">' + esc(x.phone) + "</td><td>" + weblink(x.website) + "</td></tr>";
            }).join("") + "</tbody></table></div></div>";
        });
        return html + (has(c.footer_note) ? '<p class="small-note">' + esc(c.footer_note) + "</p>" : "") + "</div></section>";
      });
    }
  };

  var main = document.getElementById("main");
  var page = main && main.getAttribute("data-page");
  if (page && pages[page]) {
    pages[page]().then(function (html) {
      main.innerHTML = html;
      main.classList.remove("loading");
      if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    }).catch(function (err) {
      console.error(err);
      main.innerHTML = '<div class="wrap page-head"><h1>Sorry, this page didn\'t load</h1><p>Please refresh the page. If it keeps happening, let the HOA board know.</p></div>';
    });
  }
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
