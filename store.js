/* ScholarSync — data store (localStorage), grading scales, sample data, backup/restore */
(function () {
  'use strict';

  const KEY = 'scholarsync.v2';
  const LEGACY_KEY = 'scholarSyncData'; // key used by the first prototype
  const VERSION = '1.1.0';

  /* ---------------- Grading scales ---------------- */
  const SCALES = {
    letter4: { family: 'gpa4', kind: 'letters', max: 4, min: 0, digits: 2, pass: 1.0,
      grades: [['A', 4.0], ['A-', 3.7], ['B+', 3.3], ['B', 3.0], ['B-', 2.7], ['C+', 2.3], ['C', 2.0], ['C-', 1.7], ['D+', 1.3], ['D', 1.0], ['F', 0]] },
    simple4: { family: 'gpa4', kind: 'letters', max: 4, min: 0, digits: 2, pass: 1.0,
      grades: [['A', 4], ['B', 3], ['C', 2], ['D', 1], ['F', 0]] },
    scale5: { family: 'gpa5', kind: 'letters', max: 5, min: 1, digits: 2, pass: 2.0,
      grades: [['A+', 5.0], ['A', 4.75], ['B+', 4.5], ['B', 4.0], ['C+', 3.5], ['C', 3.0], ['D+', 2.5], ['D', 2.0], ['F', 1.0]] },
    percent: { family: 'percent', kind: 'number', max: 100, min: 0, step: 0.5, digits: 1, pass: 50, suffix: '%' },
    german: { family: 'german', kind: 'number', max: 5, min: 1, step: 0.1, digits: 1, pass: 4.0, lowerBetter: true, best: 1.0 }
  };
  const SCALE_IDS = Object.keys(SCALES);

  function scaleOf(id) { return SCALES[id] || SCALES.letter4; }

  /** Normalised quality of a grade (1 = best, 0 = worst) for colouring. */
  function quality(points, scaleId) {
    const s = scaleOf(scaleId);
    if (s.lowerBetter) return Math.max(0, Math.min(1, (s.max - points) / (s.max - s.min)));
    return Math.max(0, Math.min(1, (points - s.min) / (s.max - s.min)));
  }

  function formatPoints(points, scaleId) {
    const s = scaleOf(scaleId);
    const str = SS.i18n.fmtNumber(points, s.digits);
    return s.suffix ? str + s.suffix : str;
  }

  /** Weighted GPA over courses that belong to the given scale family. */
  function calcGPA(courses, scaleId) {
    const fam = scaleOf(scaleId).family;
    let credits = 0, weighted = 0, counted = 0, excluded = 0;
    for (const c of courses) {
      const cf = scaleOf(c.scale).family;
      if (cf !== fam) { excluded++; continue; }
      const cr = Number(c.credits) || 0;
      if (cr <= 0) continue;
      credits += cr; weighted += cr * Number(c.points); counted++;
    }
    return { gpa: credits > 0 ? weighted / credits : null, credits, counted, excluded };
  }

  /** Required average over `remaining` credits to reach `target` given current gpa/credits. */
  function plan(currentGpa, currentCredits, target, remaining, scaleId) {
    const s = scaleOf(scaleId);
    if (!(remaining > 0) || !(target >= 0)) return { state: 'enter' };
    const g = currentGpa || 0, c = currentGpa === null ? 0 : currentCredits;
    const required = (target * (c + remaining) - g * c) / remaining;
    if (s.lowerBetter) {
      if (required < s.best - 1e-9) return { state: 'impossible' };
      if (required >= s.max) return { state: 'reached' };
      return { state: 'ok', required };
    }
    if (required > s.max + 1e-9) return { state: 'impossible' };
    if (required <= s.min + 1e-9 && c > 0) return { state: 'reached' };
    return { state: 'ok', required: Math.max(required, s.min) };
  }

  /* ---------------- Defaults ---------------- */
  function defaultSettings() {
    const lang = (document.documentElement.lang === 'ar') ? 'ar' : 'en';
    return {
      language: lang,
      theme: 'system',
      timeFormat: '12',
      studyDays: lang === 'ar' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4, 5],
      weekStart: lang === 'ar' ? 0 : 1,
      gpaScale: lang === 'ar' ? 'percent' : 'letter4',
      timer: { work: 25, short: 5, long: 15, longEvery: 4, autoBreaks: false, autoWork: false, sound: true, notifications: true },
      soundVolume: 60,
      onboarded: false
    };
  }
  function defaultState() {
    return {
      version: 2,
      settings: defaultSettings(),
      semesters: [],
      courses: [],
      classes: [],
      assignments: [],
      stats: { sessions: {}, minutes: {} },
      ui: { semesterId: null, ttDay: null, ttMode: 'day', asFilter: 'all', focusTask: null },
      timer: null
    };
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  /* ---------------- Load / save ---------------- */
  let state = defaultState();

  function sanitize(raw) {
    const d = defaultState();
    const out = Object.assign({}, d, raw || {});
    out.settings = Object.assign({}, d.settings, (raw && raw.settings) || {});
    out.settings.timer = Object.assign({}, d.settings.timer, (raw && raw.settings && raw.settings.timer) || {});
    if (!Array.isArray(out.settings.studyDays)) out.settings.studyDays = d.settings.studyDays;
    if (!SCALES[out.settings.gpaScale]) out.settings.gpaScale = d.settings.gpaScale;
    if (!['en', 'ar'].includes(out.settings.language)) out.settings.language = 'en';
    ['semesters', 'courses', 'classes', 'assignments'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
    out.stats = Object.assign({ sessions: {}, minutes: {} }, (raw && raw.stats) || {});
    out.ui = Object.assign({}, d.ui, (raw && raw.ui) || {});
    out.version = 2;
    return out;
  }

  function load() {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
    if (raw) { state = sanitize(raw); }
    else { state = defaultState(); migrateLegacy(); }
    return state;
  }

  let saveTimer = null;
  function save(immediate) {
    if (immediate) { clearTimeout(saveTimer); saveTimer = null; write(); return; }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(write, 120);
  }
  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.error('ScholarSync: could not save', e); }
  }

  /** Bring data from the first HTML prototype into the new format (one time). */
  function migrateLegacy() {
    let old = null;
    try { old = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); } catch (e) { old = null; }
    if (!old) return false;
    const dayIndex = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const colors = SS.store.COLORS;
    (old.classes || []).forEach((c, i) => state.classes.push({
      id: uid(), name: String(c.name || ''), day: dayIndex[c.day] ?? 1, start: c.startTime || '09:00', end: c.endTime || '10:00',
      location: c.location || '', instructor: '', color: colors[i % colors.length]
    }));
    (old.assignments || []).forEach(a => state.assignments.push({
      id: uid(), title: String(a.title || ''), course: '', due: a.dueDate || SS.i18n.toLocalDateStr(), time: '',
      priority: a.priority === 'High' ? 'high' : 'normal', notes: '', completed: !!a.completed, completedAt: a.completed ? Date.now() : null, createdAt: Date.now()
    }));
    if ((old.gpaCourses || []).length) {
      const sem = { id: uid(), name: SS.i18n.t('gpa.defaultSemester'), createdAt: Date.now() };
      state.semesters.push(sem);
      state.settings.gpaScale = 'letter4';
      old.gpaCourses.forEach(c => {
        const pts = Number(c.grade) || 0;
        const label = (SCALES.letter4.grades.find(g => Math.abs(g[1] - pts) < 0.01) || ['?'])[0];
        state.courses.push({ id: uid(), semesterId: sem.id, name: String(c.name || ''), credits: Number(c.credits) || 3, scale: 'letter4', grade: label, points: pts });
      });
    }
    if (old.theme === 'light' || old.theme === 'dark') state.settings.theme = old.theme;
    state.settings.onboarded = state.classes.length + state.assignments.length + state.courses.length > 0;
    save(true);
    return true;
  }

  function reset() {
    state = defaultState();
    try { localStorage.removeItem(KEY); localStorage.removeItem(LEGACY_KEY); } catch (e) { /* ignore */ }
    return state;
  }

  /* ---------------- Backup / restore ---------------- */
  function exportJSON() {
    return JSON.stringify({ app: 'ScholarSync', format: 2, version: VERSION, exportedAt: new Date().toISOString(), data: state }, null, 2);
  }
  function parseBackup(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return null; }
    if (!obj || obj.app !== 'ScholarSync' || !obj.data || typeof obj.data !== 'object') return null;
    return obj;
  }
  function importBackup(obj) {
    const incoming = sanitize(obj.data);
    incoming.settings.onboarded = true;
    incoming.timer = null;
    state = incoming;
    save(true);
    return state;
  }

  /* ---------------- Sample data ---------------- */
  const COLORS = ['#0f6cbd', '#0f7b6c', '#7a3fd1', '#c4314b', '#d97706', '#0e7490', '#be185d', '#4d7c0f'];

  const SAMPLE = {
    en: {
      courses: [
        { name: 'Calculus II', loc: 'Hall A 102', who: 'Dr. N. Haddad' },
        { name: 'Physics I', loc: 'Lab 3', who: 'Dr. S. Khalil' },
        { name: 'Programming Fundamentals', loc: 'Computer Lab 2', who: 'Eng. L. Odeh' },
        { name: 'Technical English', loc: 'Room 210', who: 'Ms. R. Carter' },
        { name: 'Engineering Drawing', loc: 'Studio 1', who: 'Eng. T. Mansour' },
        { name: 'Digital Logic', loc: 'Hall B 204', who: 'Dr. A. Rahman' }
      ],
      assignments: [
        ['Problem set 4', 0, 2, 'high', 'Questions 1–12, show all steps.'],
        ['Lab report: pendulum experiment', 1, 5, 'normal', ''],
        ['Read chapter 3 — control structures', 2, 1, 'low', ''],
        ['Presentation outline', 3, -1, 'normal', 'Two pages, submit on the portal.'],
        ['Midterm exam', 5, 12, 'high', 'Chapters 1–5.'],
        ['Drawing sheet 2', 4, -3, 'normal', '']
      ],
      semesters: ['Fall 2025', 'Spring 2026'],
      past: [['Calculus I', 3, 0.92], ['General Chemistry', 3, 0.8], ['Introduction to Engineering', 2, 1.0], ['Academic Writing', 3, 0.75], ['Linear Algebra', 3, 0.85]],
      current: [['Calculus II', 3, 0.85], ['Physics I', 4, 0.78], ['Programming Fundamentals', 3, 0.95]]
    },
    ar: {
      courses: [
        { name: 'تفاضل وتكامل 2', loc: 'قاعة A 102', who: 'د. نور حداد' },
        { name: 'فيزياء 1', loc: 'مختبر 3', who: 'د. سامر خليل' },
        { name: 'أساسيات البرمجة', loc: 'مختبر الحاسوب 2', who: 'م. ليان عودة' },
        { name: 'لغة إنجليزية تقنية', loc: 'قاعة 210', who: 'أ. ريم كارتر' },
        { name: 'رسم هندسي', loc: 'استوديو 1', who: 'م. طارق منصور' },
        { name: 'منطق رقمي', loc: 'قاعة B 204', who: 'د. أحمد رحمن' }
      ],
      assignments: [
        ['ورقة عمل 4', 0, 2, 'high', 'الأسئلة 1–12 مع إظهار خطوات الحل.'],
        ['تقرير مختبر: تجربة البندول', 1, 5, 'normal', ''],
        ['قراءة الفصل 3 — بنى التحكم', 2, 1, 'low', ''],
        ['مخطط العرض التقديمي', 3, -1, 'normal', 'صفحتان، يُسلَّم عبر البوابة.'],
        ['امتحان منتصف الفصل', 5, 12, 'high', 'الفصول 1–5.'],
        ['لوحة رسم 2', 4, -3, 'normal', '']
      ],
      semesters: ['الفصل الأول 2025', 'الفصل الثاني 2026'],
      past: [['تفاضل وتكامل 1', 3, 0.92], ['كيمياء عامة', 3, 0.8], ['مقدمة في الهندسة', 2, 1.0], ['كتابة أكاديمية', 3, 0.75], ['جبر خطي', 3, 0.85]],
      current: [['تفاضل وتكامل 2', 3, 0.85], ['فيزياء 1', 4, 0.78], ['أساسيات البرمجة', 3, 0.95]]
    }
  };

  /** Convert a quality (0–1) into a grade on the given scale. */
  function gradeFromQuality(q, scaleId) {
    const s = scaleOf(scaleId);
    if (s.kind === 'letters') {
      const target = s.min + q * (s.max - s.min);
      let best = s.grades[0];
      for (const g of s.grades) if (Math.abs(g[1] - target) < Math.abs(best[1] - target)) best = g;
      return { grade: best[0], points: best[1] };
    }
    if (s.lowerBetter) {
      const allowed = [1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 5.0];
      const target = s.max - q * (s.max - s.min);
      let best = allowed[0];
      for (const a of allowed) if (Math.abs(a - target) < Math.abs(best - target)) best = a;
      return { grade: best.toFixed(1), points: best };
    }
    const v = Math.round(50 + q * 50);
    return { grade: String(v), points: v };
  }

  function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return SS.i18n.toLocalDateStr(d); }

  function loadSample(lang) {
    const S = SAMPLE[lang] || SAMPLE.en;
    const days = state.settings.studyDays.length ? sortedDays(state.settings.studyDays, state.settings.weekStart) : [1, 2, 3, 4, 5];
    const d = i => days[i % days.length];
    const C = S.courses;
    const slots = [
      [0, d(0), '09:00', '10:30'], [1, d(0), '11:00', '12:30'],
      [2, d(1), '10:00', '11:30'], [3, d(1), '13:00', '14:00'],
      [4, d(2), '09:00', '12:00'], [0, d(2), '13:00', '14:30'],
      [1, d(3), '09:00', '10:30'], [5, d(3), '11:00', '12:30'],
      [2, d(4), '10:00', '12:00'], [5, d(4), '13:00', '14:00']
    ];
    slots.forEach(([ci, day, start, end]) => state.classes.push({
      id: uid(), name: C[ci].name, day, start, end, location: C[ci].loc, instructor: C[ci].who, color: COLORS[ci % COLORS.length]
    }));
    S.assignments.forEach(([title, ci, offset, priority, notes]) => {
      const done = offset === -3;
      state.assignments.push({ id: uid(), title, course: C[ci].name, due: addDays(offset), time: '', priority, notes, completed: done, completedAt: done ? Date.now() - 86400000 : null, createdAt: Date.now() - 10 * 86400000 });
    });
    const scale = state.settings.gpaScale;
    const semPast = { id: uid(), name: S.semesters[0], createdAt: Date.now() - 2 };
    const semNow = { id: uid(), name: S.semesters[1], createdAt: Date.now() - 1 };
    state.semesters.push(semPast, semNow);
    S.past.forEach(([name, credits, q]) => { const g = gradeFromQuality(q, scale); state.courses.push({ id: uid(), semesterId: semPast.id, name, credits, scale, grade: g.grade, points: g.points }); });
    S.current.forEach(([name, credits, q]) => { const g = gradeFromQuality(q, scale); state.courses.push({ id: uid(), semesterId: semNow.id, name, credits, scale, grade: g.grade, points: g.points }); });
    state.ui.semesterId = semNow.id;
    const today = SS.i18n.toLocalDateStr();
    state.stats.sessions[today] = (state.stats.sessions[today] || 0) + 2;
    state.stats.minutes[today] = (state.stats.minutes[today] || 0) + 50;
    save(true);
  }

  /** Study days ordered from the configured week start. */
  function sortedDays(days, weekStart) {
    const ws = Number(weekStart) || 0;
    return [...days].map(Number).sort((a, b) => ((a - ws + 7) % 7) - ((b - ws + 7) % 7));
  }

  window.SS = window.SS || {};
  window.SS.store = {
    VERSION, KEY, SCALES, SCALE_IDS, COLORS,
    get state() { return state; },
    load, save, reset, uid,
    scaleOf, quality, formatPoints, calcGPA, plan, gradeFromQuality,
    exportJSON, parseBackup, importBackup, loadSample, sortedDays
  };
})();
