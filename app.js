/* ScholarSync — application logic */
(function () {
  'use strict';

  const I = SS.i18n, store = SS.store, icon = SS.icon, audio = SS.audio;
  const { t, fmtDate, fmtLongDate, fmtNumber, dayName, parseLocalDate, toLocalDateStr } = I;
  I.setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en'); // before load(): migration text uses it
  let S = store.load();
  const cfg = () => S.settings;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };

  /* ================= Time helpers ================= */
  const todayStr = () => toLocalDateStr(new Date());
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const toMin = hhmm => { const [h, m] = String(hhmm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
  const fmtT = hhmm => I.fmtTime(hhmm, cfg().timeFormat === '12');
  function fmtHour(h) {
    return new Intl.DateTimeFormat(I.locale(), { hour: 'numeric', hour12: cfg().timeFormat === '12' }).format(new Date(2000, 0, 1, h, 0));
  }
  function dayDiff(dateStr) { return Math.round((parseLocalDate(dateStr) - parseLocalDate(todayStr())) / 86400000); }
  function dueInfo(a) {
    const d = dayDiff(a.due);
    if (d === 0) return { text: t('as.due.today'), cls: 'today', group: 'today' };
    if (d < 0) return { text: t('as.due.overdue', { n: -d }), cls: 'overdue', group: 'overdue' };
    if (d === 1) return { text: t('as.due.tomorrow'), cls: '', group: 'week' };
    if (d <= 7) return { text: t('as.due.inDays', { n: d }), cls: '', group: 'week' };
    return { text: t('as.due.on', { date: fmtDate(a.due) }), cls: '', group: 'later' };
  }
  function minutesText(mins) {
    const h = Math.floor(mins / 60), m = mins % 60;
    if (h && m) return `${h}${t('common.hoursShort')} ${m}${t('common.minutesShort')}`;
    if (h) return `${h}${t('common.hoursShort')}`;
    return `${m}${t('common.minutesShort')}`;
  }
  const studyDays = () => store.sortedDays(cfg().studyDays, cfg().weekStart);
  function timetableDays() {
    const set = new Set(cfg().studyDays.map(Number));
    S.classes.forEach(c => set.add(Number(c.day)));
    return store.sortedDays([...set], cfg().weekStart);
  }

  /* ================= Icons & static text ================= */
  function injectIcons(root) {
    $$('[data-icon]', root).forEach(el => {
      el.style.display = 'inline-flex'; el.style.alignItems = 'center';
      el.innerHTML = icon(el.getAttribute('data-icon'), el.classList.contains('flip-wrap') ? 'flip' : '');
    });
  }

  /* ================= Theme & language ================= */
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    let th = cfg().theme;
    if (th === 'system') th = darkQuery.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', th);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', th === 'dark' ? '#202020' : '#f3f3f3');
  }
  darkQuery.addEventListener('change', applyTheme);

  function applyLanguage() {
    I.setLanguage(cfg().language);
    document.documentElement.lang = cfg().language;
    document.documentElement.dir = I.dir();
    I.applyStatic();
    buildStaticSelects();
    $('#link-support').href = 'mailto:haymohsen@gmail.com?subject=' + encodeURIComponent('ScholarSync');
  }

  function buildStaticSelects() {
    // Class dialog: day options ordered from the week start
    const allDays = store.sortedDays([0, 1, 2, 3, 4, 5, 6], cfg().weekStart);
    const cfDay = $('#cf-day'); const prev = cfDay.value;
    cfDay.innerHTML = allDays.map(d => `<option value="${d}">${esc(dayName(d))}</option>`).join('');
    if (prev) cfDay.value = prev;
    // Settings: week start labels
    $$('#set-weekstart option').forEach(o => { o.textContent = dayName(Number(o.value)); });
    // Scale selects
    const opts = store.SCALE_IDS.map(id => `<option value="${id}">${esc(t('scale.' + id + '.name'))}</option>`).join('');
    $('#set-scale').innerHTML = opts; $('#set-scale').value = cfg().gpaScale;
    $('#welcome-scale').innerHTML = opts;
  }

  /* ================= Navigation ================= */
  const VIEWS = ['dashboard', 'timetable', 'assignments', 'gpa', 'focus', 'settings'];
  let currentView = 'dashboard';
  function navigate(view) {
    if (!VIEWS.includes(view)) view = 'dashboard';
    currentView = view;
    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== view; });
    $$('.nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
    $('#content').scrollTop = 0;
    renderView(view);
  }
  function renderView(view) {
    ({ dashboard: renderDashboard, timetable: renderTimetable, assignments: renderAssignments, gpa: renderGPA, focus: renderFocus, settings: renderSettings })[view]();
  }
  function renderAll() {
    renderDashboard(); renderTimetable(); renderAssignments(); renderGPA(); renderFocus(); renderSettings(); updateBadge();
  }
  function commit() { store.save(); renderAll(); }

  function updateBadge() {
    const urgent = S.assignments.filter(a => !a.completed && dayDiff(a.due) <= 0).length;
    const b = $('#nav-badge-assignments');
    b.hidden = urgent === 0; b.textContent = urgent;
  }

  /* ================= Empty state helper ================= */
  function emptyHTML(ic, title, hint, action) {
    return `<div class="empty">${icon(ic)}<div class="strong">${esc(title)}</div>${hint ? `<div class="caption">${esc(hint)}</div>` : ''}${action ? `<button class="btn" type="button" data-action="${action.act}">${icon('plus')}<span>${esc(action.label)}</span></button>` : ''}</div>`;
  }

  /* ================= Dashboard ================= */
  function renderDashboard() {
    const now = new Date(), h = now.getHours();
    const g = h < 5 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 22 ? 'evening' : 'night';
    $('#dash-greeting').textContent = t('dash.greeting.' + g);
    $('#dash-date').textContent = fmtLongDate(now);

    // GPA
    const res = store.calcGPA(S.courses, cfg().gpaScale);
    $('#stat-gpa').textContent = res.gpa === null ? '—' : store.formatPoints(res.gpa, cfg().gpaScale);
    $('#stat-gpa-foot').textContent = res.gpa === null ? t('dash.noGrades') : t('gpa.creditsCount', { n: res.credits });

    // Assignments
    const pending = S.assignments.filter(a => !a.completed);
    const overdue = pending.filter(a => dayDiff(a.due) < 0).length;
    $('#stat-pending').textContent = pending.length;
    const pf = $('#stat-pending-foot');
    pf.textContent = overdue ? t('dash.overdueCount', { n: overdue }) : t('dash.allOnTrack');
    pf.className = 'stat-foot' + (overdue ? ' text-danger' : '');

    // Next class
    const todayIdx = now.getDay(), nm = nowMin();
    const todays = S.classes.filter(c => Number(c.day) === todayIdx).sort((a, b) => toMin(a.start) - toMin(b.start));
    let nextName = '—', nextFoot = '';
    const running = todays.find(c => toMin(c.start) <= nm && toMin(c.end) > nm);
    const upcoming = todays.find(c => toMin(c.start) > nm);
    if (running) { nextName = running.name; nextFoot = `${t('dash.inProgress')} · ${fmtT(running.start)}–${fmtT(running.end)}${running.location ? ' · ' + running.location : ''}`; }
    else if (upcoming) { nextName = upcoming.name; nextFoot = `${t('dash.startsIn', { t: minutesText(toMin(upcoming.start) - nm) })} · ${fmtT(upcoming.start)}${upcoming.location ? ' · ' + upcoming.location : ''}`; }
    else if (S.classes.length) {
      const nx = nextDayWithClasses(1);
      if (nx) { nextName = nx.classes[0].name; nextFoot = `${t('dash.nextOn', { day: nx.offset === 1 ? t('common.tomorrow') : dayName(nx.day) })} · ${fmtT(nx.classes[0].start)}`; }
      else nextFoot = t('dash.noClasses');
    } else nextFoot = t('dash.noClasses');
    $('#stat-next-class').textContent = nextName;
    $('#stat-next-foot').textContent = nextFoot;

    // Focus today
    const td = todayStr();
    const sessions = S.stats.sessions[td] || 0, minutes = S.stats.minutes[td] || 0;
    $('#stat-focus').textContent = sessions;
    $('#stat-focus-foot').textContent = sessions ? t('dash.minutesFocused', { n: minutes }) : t('dash.noFocus');

    // Deadlines
    const dl = $('#dash-deadlines');
    const list = pending.sort((a, b) => a.due.localeCompare(b.due) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]).slice(0, 5);
    if (!list.length) dl.innerHTML = emptyHTML('inbox', t('dash.noDeadlines'), '', { act: 'add-assignment', label: t('as.add') });
    else dl.innerHTML = list.map(a => {
      const d = dueInfo(a);
      return `<div class="list-row" data-id="${a.id}" data-kind="assignment" role="button" tabindex="0">
        <input type="checkbox" class="check" data-act="toggle" aria-label="${esc(t('as.markDone'))}">
        <div class="grow"><div class="row-title">${esc(a.title)}</div><div class="row-sub">${a.course ? `<span>${icon('book-open')}${esc(a.course)}</span>` : ''}<span class="${d.cls ? 'text-' + (d.cls === 'overdue' ? 'danger' : 'warning') + ' strong' : ''}">${icon('calendar')}${esc(d.text)}</span></div></div>
        <span class="badge ${a.priority}">${icon(a.priority === 'high' ? 'flame' : 'flag')}${esc(t('as.priority.' + a.priority))}</span>
      </div>`;
    }).join('');

    // Today's / next classes
    const cl = $('#dash-classes'); const title = $('#dash-classes-title');
    let showDay = todayIdx, shown = todays;
    title.textContent = t('dash.todayClasses');
    if (!todays.length && S.classes.length) {
      const nx = nextDayWithClasses(1);
      if (nx) { showDay = nx.day; shown = nx.classes; title.textContent = t('dash.classesOn', { day: nx.offset === 1 ? t('common.tomorrow') : dayName(nx.day) }); }
    }
    if (!S.classes.length) cl.innerHTML = emptyHTML('calendar-days', t('dash.noClasses'), '', { act: 'add-class', label: t('tt.addClass') });
    else if (!shown.length) cl.innerHTML = emptyHTML('coffee', t('dash.noClassesToday'), t('dash.freeDay'));
    else cl.innerHTML = shown.map(c => {
      const isToday = showDay === todayIdx;
      const state = isToday && toMin(c.end) <= nm ? 'is-past' : (isToday && toMin(c.start) <= nm && toMin(c.end) > nm ? 'is-now' : '');
      return `<div class="list-row ${state}" data-id="${c.id}" data-kind="class" role="button" tabindex="0" ${state === 'is-past' ? 'style="opacity:.55"' : ''} ${state === 'is-now' ? 'style="outline:2px solid var(--accent);outline-offset:-2px"' : ''}>
        <span class="dot" style="background:${esc(c.color)}"></span>
        <div class="grow"><div class="row-title">${esc(c.name)}</div><div class="row-sub"><span>${icon('clock')}${esc(fmtT(c.start))} – ${esc(fmtT(c.end))}</span>${c.location ? `<span>${icon('map-pin')}${esc(c.location)}</span>` : ''}</div></div>
        ${state === 'is-now' ? `<span class="badge normal">${esc(t('tt.now'))}</span>` : ''}
      </div>`;
    }).join('');
  }

  function nextDayWithClasses(fromOffset) {
    const today = new Date().getDay();
    for (let o = fromOffset; o <= 7; o++) {
      const d = (today + o) % 7;
      const cls = S.classes.filter(c => Number(c.day) === d).sort((a, b) => toMin(a.start) - toMin(b.start));
      if (cls.length) return { day: d, offset: o, classes: cls };
    }
    return null;
  }

  /* ================= Timetable ================= */
  function renderTimetable() {
    const mode = S.ui.ttMode || 'day';
    $$('#tt-mode button').forEach(b => b.classList.toggle('is-active', b.dataset.ttMode === mode));
    $('#tt-day-view').hidden = mode !== 'day';
    $('#tt-week-view').hidden = mode !== 'week';
    const days = timetableDays();
    if (mode === 'day') renderDayView(days); else renderWeekView(days);
  }

  function renderDayView(days) {
    const tabs = $('#tt-day-tabs'), list = $('#tt-day-list');
    if (!days.length) { tabs.innerHTML = ''; list.innerHTML = emptyHTML('calendar-days', t('tt.noStudyDays')); return; }
    const today = new Date().getDay();
    let sel = S.ui.ttDay;
    if (sel === null || sel === undefined || !days.includes(Number(sel))) sel = days.includes(today) ? today : days[0];
    sel = Number(sel);
    tabs.innerHTML = days.map(d => `<button type="button" class="chip ${d === sel ? 'is-active' : ''} ${d === today ? 'today-dot' : ''}" data-day="${d}" title="${d === today ? esc(t('tt.today')) : ''}">${esc(dayName(d, cfg().language === 'ar' ? 'long' : 'short'))}</button>`).join('');
    const cls = S.classes.filter(c => Number(c.day) === sel).sort((a, b) => toMin(a.start) - toMin(b.start));
    if (!cls.length) { list.innerHTML = emptyHTML('coffee', t('tt.empty', { day: dayName(sel) }), t('tt.emptyHint'), { act: 'add-class', label: t('tt.addClass') }); return; }
    const nm = nowMin(), isToday = sel === today;
    list.innerHTML = cls.map(c => {
      const st = isToday && toMin(c.end) <= nm ? 'is-past' : (isToday && toMin(c.start) <= nm && toMin(c.end) > nm ? 'is-now' : '');
      return `<article class="tt-card ${st}" data-id="${c.id}">
        <div class="tt-stripe" style="background:${esc(c.color)}"></div>
        <div class="tt-body">
          <div class="tt-time"><span class="start">${esc(fmtT(c.start))}</span><span class="end">${esc(fmtT(c.end))} · ${esc(minutesText(toMin(c.end) - toMin(c.start)))}</span></div>
          <div class="tt-info"><div class="name">${esc(c.name)} ${st === 'is-now' ? `<span class="badge normal">${esc(t('tt.now'))}</span>` : ''}</div>
            <div class="meta">${c.location ? `<span>${icon('map-pin')}${esc(c.location)}</span>` : ''}${c.instructor ? `<span>${icon('user')}${esc(c.instructor)}</span>` : ''}</div></div>
          <div class="row-actions">
            <button class="btn subtle icon-only" type="button" data-act="edit" title="${esc(t('common.edit'))}" aria-label="${esc(t('common.edit'))}">${icon('pencil')}</button>
            <button class="btn subtle icon-only" type="button" data-act="delete" title="${esc(t('common.delete'))}" aria-label="${esc(t('common.delete'))}">${icon('trash-2')}</button>
          </div>
        </div></article>`;
    }).join('');
  }

  function renderWeekView(days) {
    const el = $('#tt-week');
    if (!days.length) { el.innerHTML = emptyHTML('calendar-days', t('tt.noStudyDays')); return; }
    const classes = S.classes.filter(c => days.includes(Number(c.day)));
    if (!classes.length) { el.innerHTML = emptyHTML('calendar-days', t('tt.weekEmpty'), '', { act: 'add-class', label: t('tt.addClass') }); return; }
    let minM = 8 * 60, maxM = 17 * 60;
    classes.forEach(c => { minM = Math.min(minM, Math.floor(toMin(c.start) / 60) * 60); maxM = Math.max(maxM, Math.ceil(toMin(c.end) / 60) * 60); });
    const hours = (maxM - minM) / 60, H = 56, today = new Date().getDay(), nm = nowMin();
    el.style.setProperty('--cols', days.length); el.style.setProperty('--hours', hours); el.style.setProperty('--hour-h', H + 'px');
    const head = days.map(d => `<div class="${d === today ? 'today' : ''}"><span>${esc(dayName(d, cfg().language === 'ar' ? 'long' : 'short'))}</span></div>`).join('');
    let times = '';
    for (let h = minM / 60; h < maxM / 60; h++) times += `<div style="top:${(h * 60 - minM) / 60 * H}px">${esc(fmtHour(h))}</div>`;
    const cols = days.map(d => {
      const evs = classes.filter(c => Number(c.day) === d).map(c => {
        const top = (toMin(c.start) - minM) / 60 * H, hgt = Math.max(22, (toMin(c.end) - toMin(c.start)) / 60 * H - 2);
        return `<button type="button" class="week-event" data-id="${c.id}" style="top:${top}px;height:${hgt}px;background:${esc(c.color)}" title="${esc(c.name)} · ${esc(fmtT(c.start))}–${esc(fmtT(c.end))}">
          <div class="ev-name">${esc(c.name)}</div><div class="ev-meta">${esc(fmtT(c.start))} – ${esc(fmtT(c.end))}${c.location ? ' · ' + esc(c.location) : ''}</div></button>`;
      }).join('');
      const nowLine = (d === today && nm >= minM && nm <= maxM) ? `<div class="week-now" style="top:${(nm - minM) / 60 * H}px"></div>` : '';
      return `<div class="week-col ${d === today ? 'today' : ''}">${evs}${nowLine}</div>`;
    }).join('');
    el.innerHTML = `<div class="week-scroll"><div class="week-inner"><div class="week-head"><div></div>${head}</div><div class="week-body"><div class="week-times">${times}</div>${cols}</div></div></div>`;
  }

  /* ================= Assignments ================= */
  function renderAssignments() {
    const filter = S.ui.asFilter || 'all';
    $$('#as-filters .chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === filter));
    const all = S.assignments;
    const pending = all.filter(a => !a.completed), done = all.filter(a => a.completed);
    const overdue = pending.filter(a => dayDiff(a.due) < 0);
    $('#as-count-all').textContent = all.length || '';
    $('#as-count-pending').textContent = pending.length || '';
    $('#as-count-overdue').textContent = overdue.length || '';
    $('#as-count-completed').textContent = done.length || '';

    const el = $('#as-list');
    if (!all.length) { el.innerHTML = emptyHTML('square-check-big', t('as.emptyAll'), t('as.emptyHint'), { act: 'add-assignment', label: t('as.add') }); return; }
    const sortP = arr => [...arr].sort((a, b) => a.due.localeCompare(b.due) || (a.time || '').localeCompare(b.time || '') || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    const groups = { overdue: [], today: [], week: [], later: [] };
    sortP(pending).forEach(a => groups[dueInfo(a).group].push(a));
    const doneSorted = [...done].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    const sections = [];
    const want = k => filter === 'all' || filter === k || (filter === 'pending' && k !== 'completed');
    if (want('overdue') && groups.overdue.length) sections.push(['as.sec.overdue', groups.overdue, 'danger']);
    if (filter !== 'overdue') {
      if (want('today') && groups.today.length) sections.push(['as.sec.today', groups.today, '']);
      if (want('week') && groups.week.length) sections.push(['as.sec.week', groups.week, '']);
      if (want('later') && groups.later.length) sections.push(['as.sec.later', groups.later, '']);
      if ((filter === 'all' || filter === 'completed') && doneSorted.length) sections.push(['as.sec.completed', doneSorted, '']);
    }
    if (!sections.length) { el.innerHTML = emptyHTML('inbox', t('as.emptyFilter')); return; }
    el.innerHTML = sections.map(([key, items, cls]) => `<div class="section-head ${cls}">${esc(t(key))} <span class="muted-3">· ${items.length}</span></div>` + items.map(a => assignmentRow(a)).join('')).join('');
  }

  function assignmentRow(a) {
    const d = dueInfo(a);
    const dueText = a.completed ? t('as.completedOn', { date: fmtDate(toLocalDateStr(new Date(a.completedAt || Date.now()))) }) : d.text + (a.time ? ' · ' + fmtT(a.time) : '');
    return `<div class="as-row ${a.completed ? 'is-done' : ''}" data-id="${a.id}">
      <input type="checkbox" class="check" data-act="toggle" ${a.completed ? 'checked' : ''} aria-label="${esc(t(a.completed ? 'as.markUndone' : 'as.markDone'))}">
      <div class="grow" style="flex:1;min-width:0;cursor:pointer" data-act="edit">
        <div class="row-title">${esc(a.title)}</div>
        <div class="row-sub">${a.course ? `<span class="course-tag">${icon('book-open')}${esc(a.course)}</span>` : ''}${a.notes ? `<span class="notes">${esc(a.notes)}</span>` : ''}</div>
      </div>
      <span class="due ${a.completed ? '' : d.cls}">${icon(a.completed ? 'circle-check' : 'calendar')}${esc(dueText)}</span>
      <span class="badge ${a.priority}">${icon(a.priority === 'high' ? 'flame' : 'flag')}${esc(t('as.priority.' + a.priority))}</span>
      <div class="row-actions">
        <button class="btn subtle icon-only" type="button" data-act="edit" title="${esc(t('common.edit'))}" aria-label="${esc(t('common.edit'))}">${icon('pencil')}</button>
        <button class="btn subtle icon-only" type="button" data-act="delete" title="${esc(t('common.delete'))}" aria-label="${esc(t('common.delete'))}">${icon('trash-2')}</button>
      </div></div>`;
  }

  function toggleAssignment(id) {
    const a = S.assignments.find(x => x.id === id); if (!a) return;
    a.completed = !a.completed; a.completedAt = a.completed ? Date.now() : null;
    commit();
  }

  /* ================= GPA ================= */
  function semestersSorted() { return [...S.semesters].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); }
  function currentSemester() {
    const sems = semestersSorted();
    let sem = sems.find(s => s.id === S.ui.semesterId);
    if (!sem) { sem = sems[sems.length - 1] || null; S.ui.semesterId = sem ? sem.id : null; }
    return sem;
  }
  function ensureSemester() {
    if (!S.semesters.length) { S.semesters.push({ id: store.uid(), name: t('gpa.defaultSemester'), createdAt: Date.now() }); S.ui.semesterId = S.semesters[0].id; }
    return currentSemester();
  }

  function renderGPA() {
    const scale = cfg().gpaScale;
    const sems = semestersSorted(), sem = currentSemester();
    const sel = $('#gpa-semester');
    sel.innerHTML = sems.length ? sems.map(s => `<option value="${s.id}" ${sem && s.id === sem.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('') : `<option value="">${esc(t('gpa.defaultSemester'))}</option>`;
    $('[data-action="rename-semester"]').disabled = !sem;
    $('[data-action="delete-semester"]').disabled = !sem;

    const semCourses = sem ? S.courses.filter(c => c.semesterId === sem.id) : [];
    const r1 = store.calcGPA(semCourses, scale), r2 = store.calcGPA(S.courses, scale);
    $('#gpa-semester-value').textContent = r1.gpa === null ? '—' : store.formatPoints(r1.gpa, scale);
    $('#gpa-semester-credits').textContent = t('gpa.creditsCount', { n: r1.credits }) + ' · ' + t('gpa.coursesCount', { n: r1.counted });
    $('#gpa-cumulative-value').textContent = r2.gpa === null ? '—' : store.formatPoints(r2.gpa, scale);
    $('#gpa-cumulative-credits').textContent = t('gpa.creditsCount', { n: r2.credits }) + ' · ' + t('gpa.coursesCount', { n: r2.counted });
    $('#gpa-scale-name').textContent = t('scale.' + scale + '.name');

    const rows = $('#gpa-rows'), empty = $('#gpa-empty');
    const table = $('#gpa-table');
    if (!semCourses.length) {
      rows.innerHTML = ''; table.hidden = true;
      empty.innerHTML = emptyHTML('calculator', t('gpa.empty'), t('gpa.emptyHint'), { act: 'add-course', label: t('gpa.addCourse') });
    } else {
      table.hidden = false;
      rows.innerHTML = semCourses.map(c => {
        const q = store.quality(c.points, c.scale), cls = q >= 0.75 ? 'good' : q >= 0.5 ? 'warn' : 'bad';
        const foreign = store.scaleOf(c.scale).family !== store.scaleOf(scale).family;
        return `<tr data-id="${c.id}" style="cursor:pointer">
          <td class="strong">${esc(c.name)}${foreign ? ` <span class="badge neutral" title="${esc(t('scale.' + c.scale + '.name'))}">${esc(t('scale.' + c.scale + '.name'))}</span>` : ''}</td>
          <td class="num">${esc(fmtNumber(c.credits, Number.isInteger(c.credits) ? 0 : 1))}</td>
          <td><span class="grade-pill ${cls}">${esc(c.grade)}${store.scaleOf(c.scale).suffix || ''}</span></td>
          <td class="num muted">${esc(store.formatPoints(c.points, c.scale))}</td>
          <td class="num"><div class="row-actions" style="justify-content:flex-end">
            <button class="btn subtle icon-only sm" type="button" data-act="edit" title="${esc(t('common.edit'))}" aria-label="${esc(t('common.edit'))}">${icon('pencil')}</button>
            <button class="btn subtle icon-only sm" type="button" data-act="delete" title="${esc(t('common.delete'))}" aria-label="${esc(t('common.delete'))}">${icon('trash-2')}</button></div></td></tr>`;
      }).join('');
      empty.innerHTML = r2.excluded ? `<p class="hint" style="padding:10px 14px">${icon('info')} ${esc(t('gpa.excluded', { n: r2.excluded }))}</p>` : '';
    }
    renderPlanner(r2);
  }

  function renderPlanner(cum) {
    const scale = cfg().gpaScale, s = store.scaleOf(scale);
    const target = parseFloat($('#plan-target').value), rem = parseFloat($('#plan-credits').value);
    const out = $('#plan-result');
    $('#plan-target').max = s.max; $('#plan-target').min = s.min; $('#plan-target').step = s.kind === 'number' && s.step ? s.step : 0.01;
    if (!$('#plan-target').placeholder) $('#plan-target').placeholder = s.lowerBetter ? '2.0' : store.formatPoints(s.lowerBetter ? 2 : s.max * 0.875, scale);
    if (isNaN(target)) { out.innerHTML = `<span class="muted">${esc(t('gpa.plannerEnter'))}</span>`; return; }
    const p = store.plan(cum.gpa, cum.credits, target, rem, scale);
    if (p.state === 'enter') out.innerHTML = `<span class="muted">${esc(t('gpa.plannerEnter'))}</span>`;
    else if (p.state === 'reached') out.innerHTML = `<span class="text-success strong">${icon('circle-check')} ${esc(t('gpa.plannerReached'))}</span>`;
    else if (p.state === 'impossible') out.innerHTML = `<span class="text-danger">${icon('triangle-alert')} ${esc(t('gpa.plannerImpossible', { n: rem }))}</span>`;
    else out.innerHTML = `<div class="muted">${esc(t('gpa.plannerResult'))}</div><div class="big text-accent num">${esc(store.formatPoints(p.required, scale))}</div><div class="muted">${esc(t('gpa.plannerIn', { n: rem }))}</div>`;
  }

  /* ================= Focus timer ================= */
  const RING = 289.03;
  let tickHandle = null;
  function durationMs(mode) { const tm = cfg().timer; return (mode === 'work' ? tm.work : mode === 'short' ? tm.short : tm.long) * 60000; }
  function timer() {
    if (!S.timer) S.timer = { mode: 'work', running: false, endAt: null, remainingMs: durationMs('work'), cycle: 0 };
    return S.timer;
  }
  function remaining() { const T = timer(); return T.running ? Math.max(0, T.endAt - Date.now()) : T.remainingMs; }

  function initTimer() {
    const T = timer();
    if (T.running) {
      if (T.endAt - Date.now() <= 0) completeSession(true); else startTick();
    }
  }
  function startTimer() {
    const T = timer();
    if (T.running) return;
    if (T.remainingMs <= 0) T.remainingMs = durationMs(T.mode);
    T.running = true; T.endAt = Date.now() + T.remainingMs;
    audio.prime();
    if (cfg().timer.notifications && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission().then(renderSettings);
    store.save(true); startTick(); renderTimerUI();
  }
  function pauseTimer() {
    const T = timer(); if (!T.running) return;
    T.remainingMs = Math.max(0, T.endAt - Date.now()); T.running = false; T.endAt = null;
    stopTick(); store.save(true); renderTimerUI();
  }
  function resetTimer() {
    const T = timer(); T.running = false; T.endAt = null; T.remainingMs = durationMs(T.mode);
    stopTick(); store.save(true); renderTimerUI();
  }
  function setMode(mode, autoStart) {
    const T = timer(); T.mode = mode; T.running = false; T.endAt = null; T.remainingMs = durationMs(mode);
    stopTick(); store.save(true); renderTimerUI();
    if (autoStart) startTimer();
  }
  /* cycle = focus sessions completed since the last long break */
  function nextMode() {
    const T = timer();
    if (T.mode === 'work') return (T.cycle >= cfg().timer.longEvery) ? 'long' : 'short';
    return 'work';
  }
  function skipSession() {
    const T = timer();
    if (T.mode === 'long') { T.cycle = 0; setMode('work', false); return; }
    if (T.mode === 'short') { setMode('work', false); return; }
    setMode(nextMode(), false);
  }
  function completeSession(silent) {
    const T = timer();
    const wasWork = T.mode === 'work', wasLong = T.mode === 'long';
    T.running = false; T.endAt = null; T.remainingMs = 0; stopTick();
    if (wasWork) {
      const td = todayStr();
      S.stats.sessions[td] = (S.stats.sessions[td] || 0) + 1;
      S.stats.minutes[td] = (S.stats.minutes[td] || 0) + cfg().timer.work;
      T.cycle = (T.cycle || 0) + 1;
    }
    if (!silent) {
      if (cfg().timer.sound) audio.chime();
      notify(t(wasWork ? 'focus.notif.workTitle' : 'focus.notif.breakTitle'), t(wasWork ? 'focus.done.work' : 'focus.done.break'));
    }
    toast(t(wasWork ? 'focus.done.work' : 'focus.done.break'), 'success');
    const nm = nextMode();
    if (wasLong) T.cycle = 0;
    const auto = wasWork ? cfg().timer.autoBreaks : cfg().timer.autoWork;
    setMode(nm, auto && !silent);
    store.save(true);
    renderDashboard();
  }
  function startTick() { stopTick(); tickHandle = setInterval(tick, 250); }
  function stopTick() { if (tickHandle) clearInterval(tickHandle); tickHandle = null; }
  function tick() {
    const T = timer(); if (!T.running) { stopTick(); return; }
    if (T.endAt - Date.now() <= 0) { completeSession(false); return; }
    renderTimerUI(true);
  }

  function renderTimerUI(light) {
    const T = timer(); const ms = remaining(); const total = durationMs(T.mode) || 1;
    const secs = Math.ceil(ms / 1000), mm = Math.floor(secs / 60), ss = secs % 60;
    const text = `${pad(mm)}:${pad(ss)}`;
    $('#timer-display').textContent = text;
    $('#ring-progress').style.strokeDashoffset = RING - (Math.min(1, ms / total)) * RING;
    document.title = T.running ? `${text} · ${t('focus.label.' + T.mode)} — ScholarSync` : 'ScholarSync';
    if (light) return;
    const isBreak = T.mode !== 'work';
    $('#ring-progress').classList.toggle('break', isBreak);
    const lbl = $('#timer-label'); lbl.textContent = t('focus.label.' + T.mode); lbl.classList.toggle('break', isBreak);
    $$('#timer-modes button').forEach(b => b.classList.toggle('is-active', b.dataset.mode === T.mode));
    $('#timer-toggle-icon').innerHTML = icon(T.running ? 'pause' : 'play');
    const tg = $('#btn-timer-toggle'); const tl = t(T.running ? 'focus.pause' : 'focus.start'); tg.title = tl; tg.setAttribute('aria-label', tl);
    const n = cfg().timer.longEvery, filled = Math.min(T.cycle || 0, n);
    $('#cycle-dots').innerHTML = Array.from({ length: n }, (_, i) => `<span class="${i < filled ? 'done' : ''}"></span>`).join('');
    const td = todayStr();
    $('#timer-stats').textContent = `${t('focus.today')}: ${t('dash.sessions', { n: S.stats.sessions[td] || 0 })} · ${t('focus.minutesCount', { n: S.stats.minutes[td] || 0 })}`;
    const task = S.assignments.find(a => a.id === S.ui.focusTask && !a.completed);
    $('#timer-task').textContent = task ? task.title : '';
  }

  function renderFocus() {
    renderTimerUI();
    const tm = cfg().timer;
    $('#dur-work').value = tm.work; $('#dur-short').value = tm.short; $('#dur-long').value = tm.long;
    $('#focus-long-every').textContent = t('focus.longEvery', { n: tm.longEvery });
    const sel = $('#focus-task');
    const pending = [...S.assignments.filter(a => !a.completed)].sort((a, b) => a.due.localeCompare(b.due));
    sel.innerHTML = `<option value="">${esc(t('focus.noTask'))}</option>` + pending.map(a => `<option value="${a.id}" ${a.id === S.ui.focusTask ? 'selected' : ''}>${esc(a.title)}${a.course ? ' — ' + esc(a.course) : ''}</option>`).join('');
    $$('#sound-grid .sound-btn').forEach(b => b.classList.toggle('is-active', b.dataset.sound === audio.playing));
    $('#btn-sound-off').hidden = !audio.playing;
    $('#sound-volume').value = cfg().soundVolume;
  }

  function notify(title, body) {
    if (!cfg().timer.notifications || !('Notification' in window) || Notification.permission !== 'granted') return;
    const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-96.png', tag: 'scholarsync-timer', renotify: true, silent: !!cfg().timer.sound };
    const fallback = () => { try { new Notification(title, opts); } catch (e) { /* ignore */ } };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, opts)).catch(fallback);
    else fallback();
  }

  /* ================= Settings ================= */
  function renderSettings() {
    const c = cfg();
    $('#set-language').value = c.language; $('#set-theme').value = c.theme; $('#set-timeformat').value = c.timeFormat;
    $('#set-weekstart').value = String(c.weekStart);
    $('#set-scale').value = c.gpaScale; $('#set-scale-desc').textContent = t('scale.' + c.gpaScale + '.desc');
    $('#set-longevery').value = c.timer.longEvery;
    $('#set-autobreaks').checked = !!c.timer.autoBreaks; $('#set-autowork').checked = !!c.timer.autoWork;
    $('#set-sound').checked = !!c.timer.sound; $('#set-notifications').checked = !!c.timer.notifications;
    const days = store.sortedDays([0, 1, 2, 3, 4, 5, 6], c.weekStart);
    $('#set-days').innerHTML = days.map(d => `<button type="button" class="day-toggle ${c.studyDays.includes(d) ? 'is-on' : ''}" data-day="${d}" aria-pressed="${c.studyDays.includes(d)}">${esc(dayName(d, c.language === 'ar' ? 'long' : 'short'))}</button>`).join('');
    // notifications status
    const desc = $('#set-notif-desc'), btn = $('#btn-notif-enable');
    if (!('Notification' in window)) { desc.textContent = t('settings.notif.unsupported'); btn.hidden = true; }
    else { const p = Notification.permission; desc.textContent = t('settings.notif.' + p); btn.hidden = !(p === 'default' && c.timer.notifications); }
    $('#about-version').textContent = 'v' + store.VERSION;
  }

  function setSetting(fn) { fn(cfg()); store.save(true); }

  /* ================= Dialog helpers ================= */
  function openDialog(id) { const d = $('#' + id); if (!d.open) d.showModal(); const first = d.querySelector('input:not([type=hidden]), select, textarea'); if (first) setTimeout(() => first.focus(), 30); return d; }
  function closeDialog(id) { const d = $('#' + id); if (d.open) d.close(); }
  $$('dialog').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d && d.id !== 'dlg-welcome') d.close(); });
    d.addEventListener('close', () => { if (d.id === 'dlg-welcome' && !cfg().onboarded) setTimeout(() => d.showModal(), 0); });
    d.addEventListener('cancel', e => { if (d.id === 'dlg-welcome') e.preventDefault(); });
  });
  document.addEventListener('click', e => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) { const d = closeBtn.closest('dialog'); if (d) d.close(); }
  });

  function confirmDialog(title, text, okLabel) {
    return new Promise(resolve => {
      $('#confirm-title').textContent = title; $('#confirm-text').textContent = text; $('#confirm-ok').textContent = okLabel || t('dialog.delete');
      const d = $('#dlg-confirm');
      let done = false;
      const ok = () => { done = true; resolve(true); d.close(); };
      const onClose = () => { $('#confirm-ok').removeEventListener('click', ok); d.removeEventListener('close', onClose); if (!done) resolve(false); };
      $('#confirm-ok').addEventListener('click', ok); d.addEventListener('close', onClose);
      d.showModal();
    });
  }

  /* ---- Class dialog ---- */
  function openClassDialog(id, presetDay) {
    const c = id ? S.classes.find(x => x.id === id) : null;
    $('#dlg-class-title').textContent = t(c ? 'dialog.class.edit' : 'dialog.class.add');
    $('#cf-id').value = c ? c.id : '';
    $('#cf-name').value = c ? c.name : '';
    $('#cf-day').value = String(c ? c.day : (presetDay ?? (timetableDays()[0] ?? 1)));
    $('#cf-location').value = c ? c.location || '' : '';
    $('#cf-instructor').value = c ? c.instructor || '' : '';
    $('#cf-start').value = c ? c.start : '09:00'; $('#cf-end').value = c ? c.end : '10:30';
    const color = c ? c.color : store.COLORS[S.classes.length % store.COLORS.length];
    $('#cf-color').value = color;
    $('#cf-colors').innerHTML = store.COLORS.map(col => `<button type="button" class="swatch ${col === color ? 'is-active' : ''}" data-color="${col}" style="background:${col}" aria-label="${col}"></button>`).join('');
    $('#cf-delete').hidden = !c; $('#cf-error').textContent = '';
    openDialog('dlg-class');
  }
  function submitClass(e) {
    e.preventDefault();
    const name = $('#cf-name').value.trim(), start = $('#cf-start').value, end = $('#cf-end').value;
    if (!name || !start || !end) { $('#cf-error').textContent = t('err.required'); return; }
    if (toMin(end) <= toMin(start)) { $('#cf-error').textContent = t('err.endBeforeStart'); return; }
    const id = $('#cf-id').value;
    const data = { name, day: Number($('#cf-day').value), start, end, location: $('#cf-location').value.trim(), instructor: $('#cf-instructor').value.trim(), color: $('#cf-color').value || store.COLORS[0] };
    if (id) { Object.assign(S.classes.find(x => x.id === id), data); toast(t('tt.updated'), 'success'); }
    else { S.classes.push(Object.assign({ id: store.uid() }, data)); toast(t('tt.added'), 'success'); }
    S.ui.ttDay = data.day;
    closeDialog('dlg-class'); commit();
  }
  function deleteClass(id) {
    const idx = S.classes.findIndex(x => x.id === id); if (idx < 0) return;
    const [removed] = S.classes.splice(idx, 1);
    commit();
    toast(t('tt.deleted'), 'info', { label: t('common.undo'), onClick: () => { S.classes.splice(idx, 0, removed); commit(); } });
  }

  /* ---- Assignment dialog ---- */
  function refreshCourseNames() {
    const names = [...new Set([...S.classes.map(c => c.name), ...S.courses.map(c => c.name), ...S.assignments.map(a => a.course)].filter(Boolean))].sort();
    const opts = names.map(n => `<option value="${esc(n)}">`).join('');
    $('#course-names').innerHTML = opts; $('#course-names-2').innerHTML = opts;
  }
  function openAssignmentDialog(id) {
    const a = id ? S.assignments.find(x => x.id === id) : null;
    refreshCourseNames();
    $('#dlg-assignment-title').textContent = t(a ? 'dialog.assignment.edit' : 'dialog.assignment.add');
    $('#af-id').value = a ? a.id : '';
    $('#af-title').value = a ? a.title : '';
    $('#af-course').value = a ? a.course || '' : '';
    $('#af-due').value = a ? a.due : todayStr();
    $('#af-time').value = a ? a.time || '' : '';
    $('#af-priority').value = a ? a.priority : 'normal';
    $('#af-notes').value = a ? a.notes || '' : '';
    $('#af-delete').hidden = !a; $('#af-error').textContent = '';
    openDialog('dlg-assignment');
  }
  function submitAssignment(e) {
    e.preventDefault();
    const title = $('#af-title').value.trim(), due = $('#af-due').value;
    if (!title || !due) { $('#af-error').textContent = t('err.required'); return; }
    const id = $('#af-id').value;
    const data = { title, course: $('#af-course').value.trim(), due, time: $('#af-time').value, priority: $('#af-priority').value, notes: $('#af-notes').value.trim() };
    if (id) { Object.assign(S.assignments.find(x => x.id === id), data); toast(t('as.updated'), 'success'); }
    else { S.assignments.push(Object.assign({ id: store.uid(), completed: false, completedAt: null, createdAt: Date.now() }, data)); toast(t('as.added'), 'success'); }
    closeDialog('dlg-assignment'); commit();
  }
  function deleteAssignment(id) {
    const idx = S.assignments.findIndex(x => x.id === id); if (idx < 0) return;
    const [removed] = S.assignments.splice(idx, 1);
    commit();
    toast(t('as.deleted'), 'info', { label: t('common.undo'), onClick: () => { S.assignments.splice(idx, 0, removed); commit(); } });
  }

  /* ---- Course dialog ---- */
  function gradeControl(scaleId, value) {
    const s = store.scaleOf(scaleId);
    if (s.kind === 'letters') return `<select class="select" id="gf-grade">${s.grades.map(([l, p]) => `<option value="${l}" ${l === value ? 'selected' : ''}>${l} (${fmtNumber(p, s.digits)})</option>`).join('')}</select>`;
    return `<input class="input" type="number" id="gf-grade" min="${s.min}" max="${s.max}" step="${s.step}" inputmode="decimal" value="${value == null ? '' : esc(value)}" placeholder="${s.min} – ${s.max}">`;
  }
  function openCourseDialog(id) {
    const c = id ? S.courses.find(x => x.id === id) : null;
    const sem = ensureSemester(); refreshCourseNames();
    $('#dlg-course-title').textContent = t(c ? 'dialog.course.edit' : 'dialog.course.add');
    $('#gf-id').value = c ? c.id : '';
    $('#gf-name').value = c ? c.name : '';
    $('#gf-credits').value = c ? c.credits : 3;
    const scale = c ? c.scale : cfg().gpaScale;
    $('#gf-grade-wrap').innerHTML = gradeControl(scale, c ? c.grade : null);
    $('#gf-grade-wrap').dataset.scale = scale;
    $('#gf-semester').innerHTML = semestersSorted().map(s => `<option value="${s.id}" ${(c ? c.semesterId : sem.id) === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
    $('#gf-delete').hidden = !c; $('#gf-error').textContent = '';
    openDialog('dlg-course');
  }
  function submitCourse(e) {
    e.preventDefault();
    const name = $('#gf-name').value.trim(), credits = parseFloat($('#gf-credits').value);
    if (!name) { $('#gf-error').textContent = t('err.required'); return; }
    if (!(credits > 0) || credits > 30) { $('#gf-error').textContent = t('err.credits'); return; }
    const scaleId = $('#gf-grade-wrap').dataset.scale, s = store.scaleOf(scaleId);
    let grade, points;
    const raw = $('#gf-grade').value;
    if (s.kind === 'letters') { const g = s.grades.find(x => x[0] === raw); if (!g) { $('#gf-error').textContent = t('err.grade'); return; } grade = g[0]; points = g[1]; }
    else { const v = parseFloat(raw); if (isNaN(v) || v < s.min || v > s.max) { $('#gf-error').textContent = t('err.grade'); return; } points = v; grade = s.lowerBetter ? v.toFixed(1) : String(v); }
    const id = $('#gf-id').value;
    const data = { name, credits, scale: scaleId, grade, points, semesterId: $('#gf-semester').value };
    if (id) { Object.assign(S.courses.find(x => x.id === id), data); toast(t('gpa.courseUpdated'), 'success'); }
    else { S.courses.push(Object.assign({ id: store.uid() }, data)); toast(t('gpa.courseAdded'), 'success'); }
    S.ui.semesterId = data.semesterId;
    closeDialog('dlg-course'); commit();
  }
  function deleteCourse(id) {
    const idx = S.courses.findIndex(x => x.id === id); if (idx < 0) return;
    const [removed] = S.courses.splice(idx, 1);
    commit();
    toast(t('gpa.courseDeleted'), 'info', { label: t('common.undo'), onClick: () => { S.courses.splice(idx, 0, removed); commit(); } });
  }

  /* ---- Semester dialog ---- */
  function openSemesterDialog(id) {
    const s = id ? S.semesters.find(x => x.id === id) : null;
    $('#dlg-semester-title').textContent = t(s ? 'dialog.semester.edit' : 'dialog.semester.add');
    $('#sf-id').value = s ? s.id : ''; $('#sf-name').value = s ? s.name : ''; $('#sf-error').textContent = '';
    openDialog('dlg-semester');
  }
  function submitSemester(e) {
    e.preventDefault();
    const name = $('#sf-name').value.trim(); if (!name) { $('#sf-error').textContent = t('err.required'); return; }
    const id = $('#sf-id').value;
    if (id) { S.semesters.find(x => x.id === id).name = name; toast(t('gpa.semesterRenamed'), 'success'); }
    else { const s = { id: store.uid(), name, createdAt: Date.now() }; S.semesters.push(s); S.ui.semesterId = s.id; toast(t('gpa.semesterAdded'), 'success'); }
    closeDialog('dlg-semester'); commit();
  }
  async function deleteSemester() {
    const sem = currentSemester(); if (!sem) return;
    if (S.semesters.length <= 1) { toast(t('gpa.lastSemester'), 'error'); return; }
    const n = S.courses.filter(c => c.semesterId === sem.id).length;
    if (!await confirmDialog(t('gpa.deleteSemester'), t('gpa.deleteSemesterConfirm', { name: sem.name, n }), t('dialog.delete'))) return;
    S.semesters = S.semesters.filter(s => s.id !== sem.id);
    S.courses = S.courses.filter(c => c.semesterId !== sem.id);
    S.ui.semesterId = null;
    toast(t('gpa.semesterDeleted'), 'info'); commit();
  }

  /* ================= Toasts ================= */
  function toast(msg, type, action) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.innerHTML = `${icon(type === 'success' ? 'circle-check' : type === 'error' ? 'triangle-alert' : 'info')}<div class="toast-text">${esc(msg)}</div>${action ? `<button type="button" class="toast-action">${esc(action.label)}</button>` : ''}`;
    if (action) el.querySelector('.toast-action').addEventListener('click', () => { action.onClick(); remove(); });
    box.appendChild(el);
    while (box.children.length > 4) box.firstChild.remove();
    let removed = false;
    const remove = () => { if (removed) return; removed = true; el.classList.add('leaving'); setTimeout(() => el.remove(), 220); };
    setTimeout(remove, action ? 7000 : 3500);
  }

  /* ================= Backup / restore / sample / erase ================= */
  async function exportBackup() {
    const json = store.exportJSON();
    const name = `ScholarSync-backup-${todayStr()}.json`;
    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({ suggestedName: name, types: [{ description: 'ScholarSync backup', accept: { 'application/json': ['.json'] } }] });
        const w = await handle.createWritable(); await w.write(json); await w.close();
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = name;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
      toast(t('toast.exported'), 'success');
    } catch (e) { if (e && e.name !== 'AbortError') toast(String(e.message || e), 'error'); }
  }
  async function importBackupFile(file) {
    const text = await file.text();
    const obj = store.parseBackup(text);
    if (!obj) { toast(t('err.importInvalid'), 'error'); return; }
    const when = obj.exportedAt ? fmtDate(toLocalDateStr(new Date(obj.exportedAt))) : '—';
    if (!await confirmDialog(t('settings.importConfirmTitle'), t('settings.importConfirm', { date: when }), t('dialog.confirmRestore'))) return;
    stopTick(); audio.stop();
    S = store.importBackup(obj);
    afterStateReplaced();
    toast(t('toast.imported'), 'success');
  }
  async function loadSampleData(skipConfirm) {
    if (!skipConfirm && !await confirmDialog(t('settings.sampleConfirmTitle'), t('settings.sampleConfirm'), t('dialog.confirmLoad'))) return;
    store.loadSample(cfg().language);
    commit(); toast(t('toast.sampleLoaded'), 'success');
  }
  async function eraseAll() {
    if (!await confirmDialog(t('settings.eraseConfirmTitle'), t('settings.eraseConfirm'), t('dialog.confirmErase'))) return;
    stopTick(); audio.stop();
    const lang = cfg().language, theme = cfg().theme;
    S = store.reset();
    S.settings.language = lang; S.settings.theme = theme; S.settings.onboarded = true;
    store.save(true);
    afterStateReplaced();
    toast(t('toast.erased'), 'info');
  }
  function afterStateReplaced() {
    applyTheme(); applyLanguage(); renderAll(); initTimer(); navigate('dashboard');
  }

  /* ================= Welcome (first run) ================= */
  function openWelcome() {
    const d = $('#dlg-welcome');
    const lang = cfg().language;
    $$('#dlg-welcome .lang-btn').forEach(b => b.classList.toggle('is-active', b.dataset.lang === lang));
    const preset = cfg().weekStart === 0 ? 'sunthu' : 'monfri';
    $$('#dlg-welcome .preset-btn').forEach(b => b.classList.toggle('is-active', b.dataset.preset === preset));
    $('#welcome-scale').value = cfg().gpaScale; $('#welcome-scale-desc').textContent = t('scale.' + cfg().gpaScale + '.desc');
    if (!d.open) d.showModal();
  }
  function finishWelcome(withSample) {
    cfg().onboarded = true; store.save(true);
    const d = $('#dlg-welcome'); d.close();
    if (withSample) { store.loadSample(cfg().language); toast(t('toast.sampleLoaded'), 'success'); }
    renderAll(); navigate('dashboard');
  }

  /* ================= URL handling (shortcuts) ================= */
  function handleURL() {
    const p = new URLSearchParams(location.search);
    const view = p.get('view'), action = p.get('action');
    if (view) navigate(view);
    if (action === 'add-assignment') setTimeout(() => openAssignmentDialog(null), 200);
    if (action === 'add-class') setTimeout(() => openClassDialog(null), 200);
    if (view || action || p.has('source')) history.replaceState(null, '', location.pathname);
  }

  /* ================= Service worker ================= */
  function registerSW() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    navigator.serviceWorker.register('sw.js').then(reg => {
      const hadController = !!navigator.serviceWorker.controller;
      if (reg.waiting && hadController) offerUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing; if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed') { if (hadController) offerUpdate(nw); else toast(t('toast.offlineReady'), 'success'); }
        });
      });
    }).catch(err => console.warn('SW registration failed', err));
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; location.reload(); });
  }
  function offerUpdate(worker) {
    toast(t('toast.updateReady'), 'info', { label: t('toast.restart'), onClick: () => worker.postMessage({ type: 'SKIP_WAITING' }) });
  }

  /* ================= Event binding ================= */
  function bindEvents() {
    // Navigation
    $$('.nav-item').forEach(b => b.addEventListener('click', () => navigate(b.dataset.view)));
    document.addEventListener('click', e => {
      const link = e.target.closest('[data-view-link]'); if (link) { navigate(link.dataset.viewLink); return; }
      const act = e.target.closest('[data-action]');
      if (act) {
        switch (act.dataset.action) {
          case 'add-assignment': openAssignmentDialog(null); break;
          case 'add-class': { const d = S.ui.ttDay; openClassDialog(null, (currentView === 'timetable' && d !== null && d !== undefined) ? Number(d) : undefined); break; }
          case 'go-focus': navigate('focus'); break;
          case 'add-course': openCourseDialog(null); break;
          case 'add-semester': openSemesterDialog(null); break;
          case 'rename-semester': { const s = currentSemester(); if (s) openSemesterDialog(s.id); break; }
          case 'delete-semester': deleteSemester(); break;
          case 'export': exportBackup(); break;
          case 'import': $('#import-file').click(); break;
          case 'sample': loadSampleData(false); break;
          case 'erase': eraseAll(); break;
        }
      }
    });

    // Dashboard rows
    $('#dash-deadlines').addEventListener('click', e => {
      const row = e.target.closest('[data-id]'); if (!row) return;
      if (e.target.closest('[data-act="toggle"]')) { toggleAssignment(row.dataset.id); return; }
      openAssignmentDialog(row.dataset.id);
    });
    $('#dash-classes').addEventListener('click', e => { const row = e.target.closest('[data-id]'); if (row) openClassDialog(row.dataset.id); });
    [$('#dash-deadlines'), $('#dash-classes')].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-id]')) e.target.click(); }));

    // Timetable
    $('#tt-mode').addEventListener('click', e => { const b = e.target.closest('[data-tt-mode]'); if (!b) return; S.ui.ttMode = b.dataset.ttMode; store.save(); renderTimetable(); });
    $('#tt-day-tabs').addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (!b) return; S.ui.ttDay = Number(b.dataset.day); store.save(); renderTimetable(); });
    $('#tt-day-list').addEventListener('click', e => {
      const card = e.target.closest('[data-id]'); if (!card) return;
      const act = e.target.closest('[data-act]');
      if (act && act.dataset.act === 'delete') { deleteClass(card.dataset.id); return; }
      openClassDialog(card.dataset.id);
    });
    $('#tt-week').addEventListener('click', e => { const ev = e.target.closest('.week-event'); if (ev) openClassDialog(ev.dataset.id); });

    // Assignments
    $('#as-filters').addEventListener('click', e => { const c = e.target.closest('[data-filter]'); if (!c) return; S.ui.asFilter = c.dataset.filter; store.save(); renderAssignments(); });
    $('#as-list').addEventListener('click', e => {
      const row = e.target.closest('[data-id]'); if (!row) return;
      const act = e.target.closest('[data-act]'); const a = act ? act.dataset.act : null;
      if (a === 'toggle') toggleAssignment(row.dataset.id);
      else if (a === 'delete') deleteAssignment(row.dataset.id);
      else if (a === 'edit') openAssignmentDialog(row.dataset.id);
    });

    // GPA
    $('#gpa-semester').addEventListener('change', e => { S.ui.semesterId = e.target.value; store.save(); renderGPA(); });
    $('#gpa-rows').addEventListener('click', e => {
      const tr = e.target.closest('tr[data-id]'); if (!tr) return;
      const act = e.target.closest('[data-act]');
      if (act && act.dataset.act === 'delete') deleteCourse(tr.dataset.id); else openCourseDialog(tr.dataset.id);
    });
    ['#plan-target', '#plan-credits'].forEach(sel => $(sel).addEventListener('input', () => renderPlanner(store.calcGPA(S.courses, cfg().gpaScale))));

    // Focus
    $('#timer-modes').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) setMode(b.dataset.mode, false); });
    $('#btn-timer-toggle').addEventListener('click', () => timer().running ? pauseTimer() : startTimer());
    $('#btn-timer-reset').addEventListener('click', resetTimer);
    $('#btn-timer-skip').addEventListener('click', skipSession);
    $('#focus-task').addEventListener('change', e => { S.ui.focusTask = e.target.value || null; store.save(); renderTimerUI(); });
    $('#sound-grid').addEventListener('click', e => { const b = e.target.closest('[data-sound]'); if (!b) return; audio.setVolume(cfg().soundVolume / 100); audio.toggle(b.dataset.sound); renderFocus(); });
    $('#btn-sound-off').addEventListener('click', () => { audio.stop(); renderFocus(); });
    $('#sound-volume').addEventListener('input', e => { setSetting(c => { c.soundVolume = Number(e.target.value); }); audio.setVolume(Number(e.target.value) / 100); });
    [['#dur-work', 'work', 1, 180], ['#dur-short', 'short', 1, 60], ['#dur-long', 'long', 1, 120]].forEach(([sel, key, min, max]) => {
      $(sel).addEventListener('change', e => {
        const v = Math.min(max, Math.max(min, parseInt(e.target.value, 10) || min)); e.target.value = v;
        setSetting(c => { c.timer[key] = v; });
        const T = timer(); if (!T.running && T.mode === key) { T.remainingMs = durationMs(key); store.save(true); }
        renderTimerUI();
      });
    });
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && currentView === 'focus' && !e.target.closest('input, select, textarea, button, dialog')) { e.preventDefault(); timer().running ? pauseTimer() : startTimer(); }
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && timer().running) tick(); });

    // Settings
    $('#set-language').addEventListener('change', e => { setSetting(c => { c.language = e.target.value; }); applyLanguage(); renderAll(); });
    $('#set-theme').addEventListener('change', e => { setSetting(c => { c.theme = e.target.value; }); applyTheme(); });
    $('#set-timeformat').addEventListener('change', e => { setSetting(c => { c.timeFormat = e.target.value; }); renderAll(); });
    $('#set-weekstart').addEventListener('change', e => { setSetting(c => { c.weekStart = Number(e.target.value); }); buildStaticSelects(); renderAll(); });
    $('#set-days').addEventListener('click', e => {
      const b = e.target.closest('[data-day]'); if (!b) return; const d = Number(b.dataset.day);
      setSetting(c => { c.studyDays = c.studyDays.includes(d) ? c.studyDays.filter(x => x !== d) : [...c.studyDays, d]; });
      renderAll();
    });
    $('#set-scale').addEventListener('change', e => { setSetting(c => { c.gpaScale = e.target.value; }); $('#plan-target').placeholder = ''; renderAll(); });
    $('#set-longevery').addEventListener('change', e => { const v = Math.min(8, Math.max(2, parseInt(e.target.value, 10) || 4)); e.target.value = v; setSetting(c => { c.timer.longEvery = v; }); renderFocus(); });
    $('#set-autobreaks').addEventListener('change', e => setSetting(c => { c.timer.autoBreaks = e.target.checked; }));
    $('#set-autowork').addEventListener('change', e => setSetting(c => { c.timer.autoWork = e.target.checked; }));
    $('#set-sound').addEventListener('change', e => setSetting(c => { c.timer.sound = e.target.checked; }));
    $('#set-notifications').addEventListener('change', e => {
      setSetting(c => { c.timer.notifications = e.target.checked; });
      if (e.target.checked && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission().then(renderSettings); else renderSettings();
    });
    $('#btn-notif-enable').addEventListener('click', () => { if ('Notification' in window) Notification.requestPermission().then(renderSettings); });
    $('#import-file').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) importBackupFile(f); });

    // Forms
    $('#form-class').addEventListener('submit', submitClass);
    $('#form-assignment').addEventListener('submit', submitAssignment);
    $('#form-course').addEventListener('submit', submitCourse);
    $('#form-semester').addEventListener('submit', submitSemester);
    $('#cf-colors').addEventListener('click', e => { const s = e.target.closest('[data-color]'); if (!s) return; $('#cf-color').value = s.dataset.color; $$('#cf-colors .swatch').forEach(x => x.classList.toggle('is-active', x === s)); });
    $('#cf-delete').addEventListener('click', () => { const id = $('#cf-id').value; closeDialog('dlg-class'); deleteClass(id); });
    $('#af-delete').addEventListener('click', () => { const id = $('#af-id').value; closeDialog('dlg-assignment'); deleteAssignment(id); });
    $('#gf-delete').addEventListener('click', () => { const id = $('#gf-id').value; closeDialog('dlg-course'); deleteCourse(id); });

    // Welcome — defaults follow the chosen language until the user picks a preset / scale explicitly
    const welcomeChosen = { preset: false, scale: false };
    $$('#dlg-welcome .lang-btn').forEach(b => b.addEventListener('click', () => {
      const prevLang = cfg().language;
      setSetting(c => {
        c.language = b.dataset.lang;
        if (prevLang !== c.language) {
          if (!welcomeChosen.preset) { c.studyDays = c.language === 'ar' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4, 5]; c.weekStart = c.language === 'ar' ? 0 : 1; }
          if (!welcomeChosen.scale) c.gpaScale = c.language === 'ar' ? 'percent' : 'letter4';
        }
      });
      applyLanguage(); renderAll(); openWelcome();
    }));
    $$('#dlg-welcome .preset-btn').forEach(b => b.addEventListener('click', () => {
      welcomeChosen.preset = true;
      setSetting(c => { if (b.dataset.preset === 'sunthu') { c.studyDays = [0, 1, 2, 3, 4]; c.weekStart = 0; } else { c.studyDays = [1, 2, 3, 4, 5]; c.weekStart = 1; } });
      $$('#dlg-welcome .preset-btn').forEach(x => x.classList.toggle('is-active', x === b));
      buildStaticSelects(); renderAll();
    }));
    $('#welcome-scale').addEventListener('change', e => { welcomeChosen.scale = true; setSetting(c => { c.gpaScale = e.target.value; }); $('#welcome-scale-desc').textContent = t('scale.' + e.target.value + '.desc'); renderAll(); });
    $('#welcome-start').addEventListener('click', () => finishWelcome(false));
    $('#welcome-sample').addEventListener('click', () => finishWelcome(true));

    // Re-render the dashboard clock-dependent parts every minute
    setInterval(() => { if (currentView === 'dashboard') renderDashboard(); if (currentView === 'timetable') renderTimetable(); }, 60000);
  }

  /* ================= Boot ================= */
  function boot() {
    applyTheme();
    applyLanguage();
    injectIcons();
    bindEvents();
    initTimer();
    renderAll();
    handleURL();
    registerSW();
    if (!cfg().onboarded) openWelcome();
  }
  boot();

  // Expose a small API for testing / shortcuts
  window.SS.app = { navigate, toast, get state() { return S; } };
})();
