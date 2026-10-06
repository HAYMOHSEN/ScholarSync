/* ScholarSync — English / Arabic strings and formatting helpers */
(function () {
  'use strict';

  const STRINGS = {
    en: {
      'nav.dashboard': 'Dashboard', 'nav.timetable': 'Timetable', 'nav.assignments': 'Assignments', 'nav.gpa': 'GPA', 'nav.focus': 'Focus', 'nav.settings': 'Settings',

      'dash.greeting.morning': 'Good morning', 'dash.greeting.afternoon': 'Good afternoon', 'dash.greeting.evening': 'Good evening', 'dash.greeting.night': 'Working late?',
      'dash.addAssignment': 'Assignment', 'dash.addClass': 'Class', 'dash.startFocus': 'Start focus',
      'dash.gpa': 'Cumulative GPA', 'dash.pending': 'Pending assignments', 'dash.nextClass': 'Next class', 'dash.focusToday': 'Focus today',
      'dash.deadlines': 'Upcoming deadlines', 'dash.viewAll': 'View all', 'dash.todayClasses': "Today's classes", 'dash.classesOn': 'Classes on {day}', 'dash.timetable': 'Timetable',
      'dash.noDeadlines': 'No pending assignments. Enjoy the free time!', 'dash.noClassesToday': 'No classes today.', 'dash.noClasses': 'No classes scheduled yet.',
      'dash.noGrades': 'No grades entered yet', 'dash.overdueCount': { one: '{n} overdue', other: '{n} overdue' }, 'dash.allOnTrack': 'All on track',
      'dash.sessions': { one: '{n} session', other: '{n} sessions' }, 'dash.minutesFocused': { one: '{n} minute focused', other: '{n} minutes focused' },
      'dash.done': "You're done for today!", 'dash.nextOn': 'Next: {day}', 'dash.noFocus': 'No sessions yet today', 'dash.inProgress': 'In progress',
      'dash.startsIn': 'Starts in {t}', 'dash.at': 'at {time}', 'dash.freeDay': 'Free day',

      'tt.title': 'Timetable', 'tt.subtitle': 'Your weekly classes, lectures and labs.', 'tt.day': 'Day', 'tt.week': 'Week', 'tt.addClass': 'Add class',
      'tt.empty': 'No classes on {day}', 'tt.emptyHint': 'Enjoy the free time or add a class.', 'tt.noStudyDays': 'No study days selected. Choose your study days in Settings.',
      'tt.now': 'Now', 'tt.today': 'Today', 'tt.edit': 'Edit', 'tt.delete': 'Delete', 'tt.deleteConfirm': 'Delete "{name}" from your timetable?',
      'tt.added': 'Class added', 'tt.updated': 'Class updated', 'tt.deleted': 'Class deleted', 'tt.weekEmpty': 'Your week is empty. Add your first class to see it here.',

      'as.title': 'Assignments', 'as.subtitle': 'Homework, projects and exams — never miss a deadline.', 'as.add': 'Add assignment',
      'as.filter.all': 'All', 'as.filter.pending': 'Pending', 'as.filter.overdue': 'Overdue', 'as.filter.completed': 'Completed',
      'as.sec.overdue': 'Overdue', 'as.sec.today': 'Due today', 'as.sec.week': 'This week', 'as.sec.later': 'Later', 'as.sec.completed': 'Completed',
      'as.emptyAll': 'No assignments yet', 'as.emptyHint': 'Add homework, projects and exam dates to track them.', 'as.emptyFilter': 'No assignments match this filter.',
      'as.due.today': 'Due today', 'as.due.tomorrow': 'Due tomorrow', 'as.due.inDays': { one: 'Due in {n} day', other: 'Due in {n} days' },
      'as.due.overdue': { one: '{n} day overdue', other: '{n} days overdue' }, 'as.due.on': 'Due {date}', 'as.completedOn': 'Completed {date}',
      'as.priority.low': 'Low', 'as.priority.normal': 'Normal', 'as.priority.high': 'High',
      'as.deleteConfirm': 'Delete "{title}"?', 'as.added': 'Assignment added', 'as.updated': 'Assignment updated', 'as.deleted': 'Assignment deleted',
      'as.markDone': 'Mark as completed', 'as.markUndone': 'Mark as pending',

      'gpa.title': 'GPA calculator', 'gpa.subtitle': 'Track every semester and your cumulative standing.',
      'gpa.addSemester': 'Add semester', 'gpa.renameSemester': 'Rename semester', 'gpa.deleteSemester': 'Delete semester', 'gpa.addCourse': 'Add course',
      'gpa.semesterGpa': 'Semester GPA', 'gpa.cumulative': 'Cumulative GPA', 'gpa.scaleLabel': 'Grading scale', 'gpa.changeScale': 'Change in Settings',
      'gpa.course': 'Course', 'gpa.credits': 'Credits', 'gpa.grade': 'Grade', 'gpa.points': 'Points',
      'gpa.creditsCount': { one: '{n} credit', other: '{n} credits' }, 'gpa.coursesCount': { one: '{n} course', other: '{n} courses' },
      'gpa.empty': 'No courses in this semester', 'gpa.emptyHint': 'Add your courses with their credit hours and grades.',
      'gpa.planner': 'Target planner', 'gpa.plannerHint': 'See the average you need in your remaining credits to reach a target cumulative GPA.',
      'gpa.target': 'Target cumulative GPA', 'gpa.remainingCredits': 'Remaining credits',
      'gpa.plannerResult': 'You need an average of', 'gpa.plannerIn': { one: 'in your next {n} credit.', other: 'in your next {n} credits.' },
      'gpa.plannerReached': "You've already reached this target. Keep it up!", 'gpa.plannerImpossible': 'Not reachable with {n} credits — even perfect grades fall short.',
      'gpa.plannerEnter': 'Enter a target and your remaining credits.',
      'gpa.excluded': { one: '{n} course entered under a different grading scale is not counted.', other: '{n} courses entered under a different grading scale are not counted.' },
      'gpa.deleteCourseConfirm': 'Delete "{name}"?', 'gpa.deleteSemesterConfirm': 'Delete "{name}" and its {n} courses?', 'gpa.lastSemester': 'You need at least one semester.',
      'gpa.courseAdded': 'Course added', 'gpa.courseUpdated': 'Course updated', 'gpa.courseDeleted': 'Course deleted',
      'gpa.semesterAdded': 'Semester added', 'gpa.semesterRenamed': 'Semester renamed', 'gpa.semesterDeleted': 'Semester deleted', 'gpa.defaultSemester': 'Semester 1',

      'focus.title': 'Focus timer', 'focus.subtitle': 'Work in focused sessions with the Pomodoro technique.',
      'focus.mode.work': 'Focus', 'focus.mode.short': 'Short break', 'focus.mode.long': 'Long break',
      'focus.label.work': 'Focus session', 'focus.label.short': 'Short break', 'focus.label.long': 'Long break',
      'focus.start': 'Start', 'focus.pause': 'Pause', 'focus.reset': 'Reset', 'focus.skip': 'Skip',
      'focus.today': 'Today', 'focus.minutesCount': { one: '{n} minute', other: '{n} minutes' },
      'focus.focusingOn': 'Focusing on', 'focus.noTask': 'No specific task', 'focus.sounds': 'Ambient sounds',
      'focus.sound.rain': 'Rain', 'focus.sound.cafe': 'Café', 'focus.sound.white': 'White noise', 'focus.sound.brown': 'Brown noise',
      'focus.soundOff': 'Stop sound', 'focus.volume': 'Volume', 'focus.durations': 'Durations (minutes)',
      'focus.longEvery': 'Long break after every {n} focus sessions.',
      'focus.done.work': 'Focus session complete! Time for a break.', 'focus.done.break': 'Break over — ready to focus again?',
      'focus.notif.workTitle': 'Focus session complete', 'focus.notif.breakTitle': 'Break is over',

      'settings.title': 'Settings', 'settings.subtitle': 'Make ScholarSync fit the way you study.',
      'settings.appearance': 'Appearance', 'settings.language': 'Language', 'settings.languageDesc': 'Interface language and layout direction.',
      'settings.theme': 'App theme', 'settings.themeDesc': 'Follow Windows or pick light or dark.', 'settings.theme.system': 'Use system setting', 'settings.theme.light': 'Light', 'settings.theme.dark': 'Dark',
      'settings.timeFormat': 'Time format', 'settings.timeFormatDesc': 'How class times are displayed.', 'settings.time12': '12-hour (9:00 AM)', 'settings.time24': '24-hour (09:00)',
      'settings.week': 'Study week', 'settings.studyDays': 'Study days', 'settings.studyDaysDesc': 'Days shown in your timetable. Choose Sunday–Thursday, Monday–Friday or any combination.',
      'settings.weekStart': 'Week starts on', 'settings.weekStartDesc': 'The first day shown in the week view.',
      'settings.grades': 'Grades', 'settings.gpaScale': 'Grading scale',
      'settings.timer': 'Focus timer', 'settings.longEvery': 'Long break after', 'settings.longEveryDesc': 'Number of focus sessions before a long break.', 'settings.sessions': 'sessions',
      'settings.autoBreaks': 'Auto-start breaks', 'settings.autoBreaksDesc': 'Start the break as soon as a focus session ends.',
      'settings.autoWork': 'Auto-start focus', 'settings.autoWorkDesc': 'Start the next focus session when a break ends.',
      'settings.sound': 'Completion sound', 'settings.soundDesc': 'Play a gentle chime when a session ends.',
      'settings.notifications': 'Notifications',
      'settings.notif.granted': 'Windows will notify you when a session ends, even if the app is in the background.',
      'settings.notif.denied': 'Notifications are blocked. Allow them for this app in Windows Settings › System › Notifications.',
      'settings.notif.default': 'Allow notifications to be alerted when a session ends.', 'settings.notif.unsupported': 'Notifications are not available here.',
      'settings.enableNotif': 'Allow notifications',
      'settings.data': 'Your data', 'settings.export': 'Export backup', 'settings.exportDesc': 'Save all your classes, assignments and grades to a file you can keep or move to another PC.', 'settings.exportBtn': 'Export',
      'settings.import': 'Restore from backup', 'settings.importDesc': 'Replace the current data with a ScholarSync backup file.', 'settings.importBtn': 'Restore',
      'settings.sample': 'Load sample data', 'settings.sampleDesc': 'Fill the app with example classes, tasks and grades to explore it.', 'settings.sampleBtn': 'Load',
      'settings.erase': 'Erase all data', 'settings.eraseDesc': 'Permanently delete everything stored by ScholarSync on this device.', 'settings.eraseBtn': 'Erase',
      'settings.eraseConfirmTitle': 'Erase all data?', 'settings.eraseConfirm': 'This deletes all classes, assignments, grades and settings on this device. This cannot be undone.',
      'settings.sampleConfirmTitle': 'Load sample data?', 'settings.sampleConfirm': 'Sample classes, assignments and grades will be added to your current data.',
      'settings.importConfirmTitle': 'Restore backup?', 'settings.importConfirm': 'Your current data will be replaced by the backup from {date}.',
      'settings.about': 'About', 'settings.aboutText': 'Your private student planner. Everything stays on this device — no account, no tracking.',
      'settings.privacy': 'Privacy policy', 'settings.support': 'Contact support',

      'dialog.close': 'Close', 'dialog.cancel': 'Cancel', 'dialog.save': 'Save', 'dialog.delete': 'Delete', 'dialog.confirmErase': 'Erase', 'dialog.confirmLoad': 'Load', 'dialog.confirmRestore': 'Restore',
      'dialog.class.add': 'Add class', 'dialog.class.edit': 'Edit class', 'dialog.class.name': 'Course name', 'dialog.class.namePh': 'e.g. Calculus II', 'dialog.class.day': 'Day',
      'dialog.class.location': 'Room / location', 'dialog.class.locationPh': 'e.g. Hall B 204', 'dialog.class.start': 'Start time', 'dialog.class.end': 'End time',
      'dialog.class.instructor': 'Instructor (optional)', 'dialog.class.color': 'Color',
      'dialog.assignment.add': 'Add assignment', 'dialog.assignment.edit': 'Edit assignment', 'dialog.assignment.title': 'Title', 'dialog.assignment.titlePh': 'e.g. Problem set 4',
      'dialog.assignment.course': 'Course (optional)', 'dialog.assignment.due': 'Due date', 'dialog.assignment.time': 'Due time (optional)', 'dialog.assignment.priority': 'Priority', 'dialog.assignment.notes': 'Notes (optional)',
      'dialog.course.add': 'Add course', 'dialog.course.edit': 'Edit course', 'dialog.course.name': 'Course name', 'dialog.course.namePh': 'e.g. Physics I',
      'dialog.course.credits': 'Credit hours', 'dialog.course.grade': 'Grade', 'dialog.course.semester': 'Semester',
      'dialog.semester.add': 'Add semester', 'dialog.semester.edit': 'Rename semester', 'dialog.semester.name': 'Semester name', 'dialog.semester.namePh': 'e.g. Fall 2026',

      'welcome.title': 'Welcome to ScholarSync', 'welcome.text': 'Your timetable, assignments, grades and focus timer in one place — private and offline.',
      'welcome.language': 'Language', 'welcome.studyDays': 'Study days', 'welcome.preset.sunThu': 'Sunday – Thursday', 'welcome.preset.sunThuHint': 'Common in Jordan and the Gulf',
      'welcome.preset.monFri': 'Monday – Friday', 'welcome.preset.monFriHint': 'Europe, Americas and most of Asia', 'welcome.gpaScale': 'Grading scale',
      'welcome.start': 'Start fresh', 'welcome.sample': 'Explore with sample data',

      'err.required': 'Please fill in the required fields.', 'err.endBeforeStart': 'End time must be after the start time.', 'err.credits': 'Enter valid credit hours.', 'err.grade': 'Enter a valid grade.',
      'err.importInvalid': 'This file is not a ScholarSync backup.',
      'toast.exported': 'Backup exported', 'toast.imported': 'Backup restored', 'toast.sampleLoaded': 'Sample data loaded', 'toast.erased': 'All data erased',
      'toast.updateReady': 'A new version of ScholarSync is ready.', 'toast.restart': 'Restart', 'toast.offlineReady': 'ScholarSync is ready to work offline.',
      'common.undo': 'Undo', 'common.today': 'Today', 'common.tomorrow': 'Tomorrow', 'common.yesterday': 'Yesterday', 'common.edit': 'Edit', 'common.delete': 'Delete', 'common.untitled': 'Untitled',
      'common.hoursShort': 'h', 'common.minutesShort': 'min',

      'scale.letter4.name': '4.0 scale with +/− (A, A−, B+ …)', 'scale.letter4.desc': 'US-style letter grades. A = 4.0, A− = 3.7, B+ = 3.3 … F = 0.',
      'scale.simple4.name': '4.0 scale, whole letters (A, B, C, D, F)', 'scale.simple4.desc': 'A = 4, B = 3, C = 2, D = 1, F = 0.',
      'scale.scale5.name': '5.0 scale (A+, A, B+ …)', 'scale.scale5.desc': 'Used by universities in Saudi Arabia and the Gulf. A+ = 5.0 … F = 1.0.',
      'scale.percent.name': 'Percentage (0–100)', 'scale.percent.desc': 'Weighted average of percentage marks — common in Jordan, Egypt and the Levant.',
      'scale.german.name': 'German scale (1.0–5.0, lower is better)', 'scale.german.desc': '1.0 = sehr gut, 4.0 = pass, 5.0 = fail. Weighted average.'
    },

    ar: {
      'nav.dashboard': 'الرئيسية', 'nav.timetable': 'الجدول', 'nav.assignments': 'الواجبات', 'nav.gpa': 'المعدل', 'nav.focus': 'التركيز', 'nav.settings': 'الإعدادات',

      'dash.greeting.morning': 'صباح الخير', 'dash.greeting.afternoon': 'نهارك سعيد', 'dash.greeting.evening': 'مساء الخير', 'dash.greeting.night': 'تدرس حتى وقت متأخر؟',
      'dash.addAssignment': 'واجب', 'dash.addClass': 'محاضرة', 'dash.startFocus': 'ابدأ التركيز',
      'dash.gpa': 'المعدل التراكمي', 'dash.pending': 'واجبات معلّقة', 'dash.nextClass': 'المحاضرة التالية', 'dash.focusToday': 'التركيز اليوم',
      'dash.deadlines': 'مواعيد التسليم القادمة', 'dash.viewAll': 'عرض الكل', 'dash.todayClasses': 'محاضرات اليوم', 'dash.classesOn': 'محاضرات يوم {day}', 'dash.timetable': 'الجدول',
      'dash.noDeadlines': 'لا توجد واجبات معلّقة. استمتع بوقتك!', 'dash.noClassesToday': 'لا توجد محاضرات اليوم.', 'dash.noClasses': 'لم تُضف أي محاضرات بعد.',
      'dash.noGrades': 'لم تُدخل أي علامات بعد', 'dash.overdueCount': { zero: 'لا متأخرات', one: 'واحدة متأخرة', two: 'اثنتان متأخرتان', few: '{n} متأخرة', many: '{n} متأخرة', other: '{n} متأخرة' }, 'dash.allOnTrack': 'كل شيء في موعده',
      'dash.sessions': { zero: 'لا جلسات', one: 'جلسة واحدة', two: 'جلستان', few: '{n} جلسات', many: '{n} جلسة', other: '{n} جلسة' },
      'dash.minutesFocused': { zero: 'لا دقائق تركيز', one: 'دقيقة تركيز', two: 'دقيقتا تركيز', few: '{n} دقائق تركيز', many: '{n} دقيقة تركيز', other: '{n} دقيقة تركيز' },
      'dash.done': 'انتهت محاضرات اليوم!', 'dash.nextOn': 'التالية: {day}', 'dash.noFocus': 'لا جلسات بعد اليوم', 'dash.inProgress': 'جارية الآن',
      'dash.startsIn': 'تبدأ بعد {t}', 'dash.at': 'في {time}', 'dash.freeDay': 'يوم حر',

      'tt.title': 'الجدول الدراسي', 'tt.subtitle': 'محاضراتك ومختبراتك الأسبوعية.', 'tt.day': 'يوم', 'tt.week': 'أسبوع', 'tt.addClass': 'إضافة محاضرة',
      'tt.empty': 'لا توجد محاضرات يوم {day}', 'tt.emptyHint': 'استمتع بوقتك الحر أو أضف محاضرة.', 'tt.noStudyDays': 'لم تُحدَّد أيام دراسية. اختر أيام الدراسة من الإعدادات.',
      'tt.now': 'الآن', 'tt.today': 'اليوم', 'tt.edit': 'تعديل', 'tt.delete': 'حذف', 'tt.deleteConfirm': 'هل تريد حذف «{name}» من جدولك؟',
      'tt.added': 'تمت إضافة المحاضرة', 'tt.updated': 'تم تحديث المحاضرة', 'tt.deleted': 'تم حذف المحاضرة', 'tt.weekEmpty': 'أسبوعك فارغ. أضف أول محاضرة لتظهر هنا.',

      'as.title': 'الواجبات', 'as.subtitle': 'واجبات ومشاريع وامتحانات — لا تفوّت أي موعد تسليم.', 'as.add': 'إضافة واجب',
      'as.filter.all': 'الكل', 'as.filter.pending': 'معلّقة', 'as.filter.overdue': 'متأخرة', 'as.filter.completed': 'مكتملة',
      'as.sec.overdue': 'متأخرة', 'as.sec.today': 'تُسلَّم اليوم', 'as.sec.week': 'هذا الأسبوع', 'as.sec.later': 'لاحقاً', 'as.sec.completed': 'مكتملة',
      'as.emptyAll': 'لا توجد واجبات بعد', 'as.emptyHint': 'أضف الواجبات والمشاريع ومواعيد الامتحانات لمتابعتها.', 'as.emptyFilter': 'لا توجد واجبات ضمن هذا التصنيف.',
      'as.due.today': 'تُسلَّم اليوم', 'as.due.tomorrow': 'تُسلَّم غداً',
      'as.due.inDays': { one: 'خلال يوم واحد', two: 'خلال يومين', few: 'خلال {n} أيام', many: 'خلال {n} يوماً', other: 'خلال {n} يوم' },
      'as.due.overdue': { one: 'متأخر يوماً واحداً', two: 'متأخر يومين', few: 'متأخر {n} أيام', many: 'متأخر {n} يوماً', other: 'متأخر {n} يوم' },
      'as.due.on': 'التسليم {date}', 'as.completedOn': 'أُكمل {date}',
      'as.priority.low': 'منخفضة', 'as.priority.normal': 'عادية', 'as.priority.high': 'عالية',
      'as.deleteConfirm': 'حذف «{title}»؟', 'as.added': 'تمت إضافة الواجب', 'as.updated': 'تم تحديث الواجب', 'as.deleted': 'تم حذف الواجب',
      'as.markDone': 'تحديد كمكتمل', 'as.markUndone': 'إعادة إلى المعلّقة',

      'gpa.title': 'حاسبة المعدل', 'gpa.subtitle': 'تابع كل فصل دراسي ومعدلك التراكمي.',
      'gpa.addSemester': 'إضافة فصل', 'gpa.renameSemester': 'تغيير اسم الفصل', 'gpa.deleteSemester': 'حذف الفصل', 'gpa.addCourse': 'إضافة مادة',
      'gpa.semesterGpa': 'معدل الفصل', 'gpa.cumulative': 'المعدل التراكمي', 'gpa.scaleLabel': 'نظام العلامات', 'gpa.changeScale': 'تغيير من الإعدادات',
      'gpa.course': 'المادة', 'gpa.credits': 'الساعات', 'gpa.grade': 'العلامة', 'gpa.points': 'النقاط',
      'gpa.creditsCount': { zero: 'لا ساعات معتمدة', one: 'ساعة معتمدة واحدة', two: 'ساعتان معتمدتان', few: '{n} ساعات معتمدة', many: '{n} ساعة معتمدة', other: '{n} ساعة معتمدة' },
      'gpa.coursesCount': { zero: 'لا مواد', one: 'مادة واحدة', two: 'مادتان', few: '{n} مواد', many: '{n} مادة', other: '{n} مادة' },
      'gpa.empty': 'لا مواد في هذا الفصل', 'gpa.emptyHint': 'أضف موادك مع ساعاتها المعتمدة وعلاماتها.',
      'gpa.planner': 'مخطّط الهدف', 'gpa.plannerHint': 'اعرف المعدل الذي تحتاجه في ساعاتك المتبقية للوصول إلى معدل تراكمي مستهدف.',
      'gpa.target': 'المعدل التراكمي المستهدف', 'gpa.remainingCredits': 'الساعات المتبقية',
      'gpa.plannerResult': 'تحتاج إلى معدل', 'gpa.plannerIn': { one: 'في ساعتك المعتمدة القادمة.', two: 'في ساعتيك القادمتين.', few: 'في ساعاتك الـ{n} القادمة.', many: 'في ساعاتك الـ{n} القادمة.', other: 'في ساعاتك الـ{n} القادمة.' },
      'gpa.plannerReached': 'لقد حققت هذا الهدف بالفعل. واصل!', 'gpa.plannerImpossible': 'غير ممكن مع {n} ساعة — حتى العلامات الكاملة لا تكفي.',
      'gpa.plannerEnter': 'أدخل هدفاً وساعاتك المتبقية.',
      'gpa.excluded': { one: 'مادة واحدة مُدخلة بنظام علامات مختلف غير محسوبة.', two: 'مادتان مُدخلتان بنظام علامات مختلف غير محسوبتين.', few: '{n} مواد مُدخلة بنظام علامات مختلف غير محسوبة.', many: '{n} مادة مُدخلة بنظام علامات مختلف غير محسوبة.', other: '{n} مادة مُدخلة بنظام علامات مختلف غير محسوبة.' },
      'gpa.deleteCourseConfirm': 'حذف «{name}»؟', 'gpa.deleteSemesterConfirm': 'حذف «{name}» مع موادّه ({n})؟', 'gpa.lastSemester': 'يجب أن يبقى فصل دراسي واحد على الأقل.',
      'gpa.courseAdded': 'تمت إضافة المادة', 'gpa.courseUpdated': 'تم تحديث المادة', 'gpa.courseDeleted': 'تم حذف المادة',
      'gpa.semesterAdded': 'تمت إضافة الفصل', 'gpa.semesterRenamed': 'تم تغيير اسم الفصل', 'gpa.semesterDeleted': 'تم حذف الفصل', 'gpa.defaultSemester': 'الفصل الأول',

      'focus.title': 'مؤقّت التركيز', 'focus.subtitle': 'اعمل في جلسات مركّزة بتقنية بومودورو.',
      'focus.mode.work': 'تركيز', 'focus.mode.short': 'استراحة قصيرة', 'focus.mode.long': 'استراحة طويلة',
      'focus.label.work': 'جلسة تركيز', 'focus.label.short': 'استراحة قصيرة', 'focus.label.long': 'استراحة طويلة',
      'focus.start': 'ابدأ', 'focus.pause': 'إيقاف مؤقت', 'focus.reset': 'إعادة', 'focus.skip': 'تخطّي',
      'focus.today': 'اليوم', 'focus.minutesCount': { zero: 'لا دقائق', one: 'دقيقة واحدة', two: 'دقيقتان', few: '{n} دقائق', many: '{n} دقيقة', other: '{n} دقيقة' },
      'focus.focusingOn': 'تركّز على', 'focus.noTask': 'بدون مهمة محددة', 'focus.sounds': 'أصوات محيطة',
      'focus.sound.rain': 'مطر', 'focus.sound.cafe': 'مقهى', 'focus.sound.white': 'ضوضاء بيضاء', 'focus.sound.brown': 'ضوضاء بنية',
      'focus.soundOff': 'إيقاف الصوت', 'focus.volume': 'مستوى الصوت', 'focus.durations': 'المدد (بالدقائق)',
      'focus.longEvery': 'استراحة طويلة بعد كل {n} جلسات تركيز.',
      'focus.done.work': 'انتهت جلسة التركيز! حان وقت الاستراحة.', 'focus.done.break': 'انتهت الاستراحة — مستعد للتركيز مجدداً؟',
      'focus.notif.workTitle': 'انتهت جلسة التركيز', 'focus.notif.breakTitle': 'انتهت الاستراحة',

      'settings.title': 'الإعدادات', 'settings.subtitle': 'اجعل ScholarSync يناسب طريقتك في الدراسة.',
      'settings.appearance': 'المظهر', 'settings.language': 'اللغة', 'settings.languageDesc': 'لغة الواجهة واتجاه التخطيط.',
      'settings.theme': 'سمة التطبيق', 'settings.themeDesc': 'اتبع إعداد ويندوز أو اختر الفاتح أو الداكن.', 'settings.theme.system': 'إعداد النظام', 'settings.theme.light': 'فاتح', 'settings.theme.dark': 'داكن',
      'settings.timeFormat': 'تنسيق الوقت', 'settings.timeFormatDesc': 'طريقة عرض أوقات المحاضرات.', 'settings.time12': '12 ساعة (9:00 ص)', 'settings.time24': '24 ساعة (09:00)',
      'settings.week': 'أسبوع الدراسة', 'settings.studyDays': 'أيام الدراسة', 'settings.studyDaysDesc': 'الأيام التي تظهر في جدولك. اختر الأحد–الخميس أو الاثنين–الجمعة أو أي تركيبة.',
      'settings.weekStart': 'يبدأ الأسبوع يوم', 'settings.weekStartDesc': 'أول يوم يظهر في عرض الأسبوع.',
      'settings.grades': 'العلامات', 'settings.gpaScale': 'نظام العلامات',
      'settings.timer': 'مؤقّت التركيز', 'settings.longEvery': 'استراحة طويلة بعد', 'settings.longEveryDesc': 'عدد جلسات التركيز قبل الاستراحة الطويلة.', 'settings.sessions': 'جلسات',
      'settings.autoBreaks': 'بدء الاستراحات تلقائياً', 'settings.autoBreaksDesc': 'ابدأ الاستراحة فور انتهاء جلسة التركيز.',
      'settings.autoWork': 'بدء التركيز تلقائياً', 'settings.autoWorkDesc': 'ابدأ جلسة التركيز التالية عند انتهاء الاستراحة.',
      'settings.sound': 'صوت الانتهاء', 'settings.soundDesc': 'تشغيل رنّة لطيفة عند انتهاء الجلسة.',
      'settings.notifications': 'الإشعارات',
      'settings.notif.granted': 'سيُعلمك ويندوز عند انتهاء الجلسة حتى لو كان التطبيق في الخلفية.',
      'settings.notif.denied': 'الإشعارات محظورة. اسمح بها لهذا التطبيق من إعدادات ويندوز › النظام › الإشعارات.',
      'settings.notif.default': 'اسمح بالإشعارات لتنبيهك عند انتهاء الجلسة.', 'settings.notif.unsupported': 'الإشعارات غير متاحة هنا.',
      'settings.enableNotif': 'السماح بالإشعارات',
      'settings.data': 'بياناتك', 'settings.export': 'تصدير نسخة احتياطية', 'settings.exportDesc': 'احفظ جميع محاضراتك وواجباتك وعلاماتك في ملف تحتفظ به أو تنقله إلى جهاز آخر.', 'settings.exportBtn': 'تصدير',
      'settings.import': 'استعادة من نسخة احتياطية', 'settings.importDesc': 'استبدل البيانات الحالية بملف نسخة احتياطية من ScholarSync.', 'settings.importBtn': 'استعادة',
      'settings.sample': 'تحميل بيانات تجريبية', 'settings.sampleDesc': 'املأ التطبيق بمحاضرات وواجبات وعلامات تجريبية لاستكشافه.', 'settings.sampleBtn': 'تحميل',
      'settings.erase': 'مسح جميع البيانات', 'settings.eraseDesc': 'حذف كل ما يخزّنه ScholarSync على هذا الجهاز نهائياً.', 'settings.eraseBtn': 'مسح',
      'settings.eraseConfirmTitle': 'مسح جميع البيانات؟', 'settings.eraseConfirm': 'سيؤدي هذا إلى حذف جميع المحاضرات والواجبات والعلامات والإعدادات على هذا الجهاز، ولا يمكن التراجع عنه.',
      'settings.sampleConfirmTitle': 'تحميل بيانات تجريبية؟', 'settings.sampleConfirm': 'ستُضاف محاضرات وواجبات وعلامات تجريبية إلى بياناتك الحالية.',
      'settings.importConfirmTitle': 'استعادة النسخة الاحتياطية؟', 'settings.importConfirm': 'ستُستبدل بياناتك الحالية بالنسخة الاحتياطية المؤرَّخة {date}.',
      'settings.about': 'حول التطبيق', 'settings.aboutText': 'مخطّطك الدراسي الخاص. كل شيء يبقى على هذا الجهاز — بلا حساب وبلا تتبّع.',
      'settings.privacy': 'سياسة الخصوصية', 'settings.support': 'التواصل مع الدعم',

      'dialog.close': 'إغلاق', 'dialog.cancel': 'إلغاء', 'dialog.save': 'حفظ', 'dialog.delete': 'حذف', 'dialog.confirmErase': 'مسح', 'dialog.confirmLoad': 'تحميل', 'dialog.confirmRestore': 'استعادة',
      'dialog.class.add': 'إضافة محاضرة', 'dialog.class.edit': 'تعديل المحاضرة', 'dialog.class.name': 'اسم المادة', 'dialog.class.namePh': 'مثال: تفاضل وتكامل 2', 'dialog.class.day': 'اليوم',
      'dialog.class.location': 'القاعة / المكان', 'dialog.class.locationPh': 'مثال: قاعة B 204', 'dialog.class.start': 'وقت البدء', 'dialog.class.end': 'وقت الانتهاء',
      'dialog.class.instructor': 'المدرّس (اختياري)', 'dialog.class.color': 'اللون',
      'dialog.assignment.add': 'إضافة واجب', 'dialog.assignment.edit': 'تعديل الواجب', 'dialog.assignment.title': 'العنوان', 'dialog.assignment.titlePh': 'مثال: ورقة عمل 4',
      'dialog.assignment.course': 'المادة (اختياري)', 'dialog.assignment.due': 'تاريخ التسليم', 'dialog.assignment.time': 'وقت التسليم (اختياري)', 'dialog.assignment.priority': 'الأولوية', 'dialog.assignment.notes': 'ملاحظات (اختياري)',
      'dialog.course.add': 'إضافة مادة', 'dialog.course.edit': 'تعديل المادة', 'dialog.course.name': 'اسم المادة', 'dialog.course.namePh': 'مثال: فيزياء 1',
      'dialog.course.credits': 'الساعات المعتمدة', 'dialog.course.grade': 'العلامة', 'dialog.course.semester': 'الفصل الدراسي',
      'dialog.semester.add': 'إضافة فصل دراسي', 'dialog.semester.edit': 'تغيير اسم الفصل', 'dialog.semester.name': 'اسم الفصل', 'dialog.semester.namePh': 'مثال: الفصل الأول 2026',

      'welcome.title': 'مرحباً بك في ScholarSync', 'welcome.text': 'جدولك وواجباتك وعلاماتك ومؤقّت تركيزك في مكان واحد — خاص ويعمل دون اتصال.',
      'welcome.language': 'اللغة', 'welcome.studyDays': 'أيام الدراسة', 'welcome.preset.sunThu': 'الأحد – الخميس', 'welcome.preset.sunThuHint': 'الشائع في الأردن والخليج',
      'welcome.preset.monFri': 'الاثنين – الجمعة', 'welcome.preset.monFriHint': 'أوروبا والأمريكتان ومعظم آسيا', 'welcome.gpaScale': 'نظام العلامات',
      'welcome.start': 'ابدأ من الصفر', 'welcome.sample': 'استكشف ببيانات تجريبية',

      'err.required': 'يرجى تعبئة الحقول المطلوبة.', 'err.endBeforeStart': 'يجب أن يكون وقت الانتهاء بعد وقت البدء.', 'err.credits': 'أدخل ساعات معتمدة صحيحة.', 'err.grade': 'أدخل علامة صحيحة.',
      'err.importInvalid': 'هذا الملف ليس نسخة احتياطية من ScholarSync.',
      'toast.exported': 'تم تصدير النسخة الاحتياطية', 'toast.imported': 'تمت استعادة النسخة الاحتياطية', 'toast.sampleLoaded': 'تم تحميل البيانات التجريبية', 'toast.erased': 'تم مسح جميع البيانات',
      'toast.updateReady': 'نسخة جديدة من ScholarSync جاهزة.', 'toast.restart': 'إعادة التشغيل', 'toast.offlineReady': 'ScholarSync جاهز للعمل دون اتصال.',
      'common.undo': 'تراجع', 'common.today': 'اليوم', 'common.tomorrow': 'غداً', 'common.yesterday': 'أمس', 'common.edit': 'تعديل', 'common.delete': 'حذف', 'common.untitled': 'بدون عنوان',
      'common.hoursShort': 'س', 'common.minutesShort': 'د',

      'scale.letter4.name': 'نظام 4.0 مع +/− (A، A−، B+ …)', 'scale.letter4.desc': 'العلامات الحرفية الأمريكية. A = 4.0، A− = 3.7، B+ = 3.3 … F = 0.',
      'scale.simple4.name': 'نظام 4.0 بحروف كاملة (A، B، C، D، F)', 'scale.simple4.desc': 'A = 4، B = 3، C = 2، D = 1، F = 0.',
      'scale.scale5.name': 'نظام 5.0 (A+، A، B+ …)', 'scale.scale5.desc': 'المستخدم في جامعات السعودية ودول الخليج. A+ = 5.0 … F = 1.0.',
      'scale.percent.name': 'النسبة المئوية (0–100)', 'scale.percent.desc': 'معدل موزون للعلامات المئوية — الشائع في الأردن ومصر وبلاد الشام.',
      'scale.german.name': 'النظام الألماني (1.0–5.0، الأقل أفضل)', 'scale.german.desc': '1.0 = ممتاز، 4.0 = ناجح، 5.0 = راسب. معدل موزون.'
    }
  };

  let lang = 'en';
  let pluralRules = new Intl.PluralRules('en');

  function setLanguage(l) {
    lang = STRINGS[l] ? l : 'en';
    pluralRules = new Intl.PluralRules(lang === 'ar' ? 'ar' : 'en');
  }
  function getLanguage() { return lang; }
  function locale() { return lang === 'ar' ? 'ar-u-nu-latn' : 'en-US'; }
  function dir() { return lang === 'ar' ? 'rtl' : 'ltr'; }

  function interpolate(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null) ? String(vars[k]) : m);
  }

  /** t('key', { n: 3, name: 'x' }) — supports plural objects keyed by CLDR categories. */
  function t(key, vars) {
    let entry = STRINGS[lang][key];
    if (entry === undefined) entry = STRINGS.en[key];
    if (entry === undefined) return key;
    if (typeof entry === 'object') {
      const n = vars && typeof vars.n === 'number' ? vars.n : 0;
      let cat = pluralRules.select(n);
      if (n === 0 && entry.zero !== undefined) cat = 'zero';
      entry = entry[cat] !== undefined ? entry[cat] : (entry.other !== undefined ? entry.other : Object.values(entry)[0]);
    }
    return interpolate(entry, vars);
  }

  /* ---- Formatting helpers ---- */
  function fmtDate(date, opts) {
    const d = (date instanceof Date) ? date : parseLocalDate(date);
    return new Intl.DateTimeFormat(locale(), opts || { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  }
  function fmtLongDate(date) {
    const d = (date instanceof Date) ? date : parseLocalDate(date);
    return new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  }
  function fmtTime(hhmm, hour12) {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(2000, 0, 1, h, m);
    return new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit', hour12: !!hour12 }).format(d);
  }
  function fmtNumber(n, digits) {
    return new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  }
  function dayName(dayIndex, style) {
    // dayIndex: 0 = Sunday … 6 = Saturday
    const d = new Date(2023, 0, 1 + dayIndex); // 1 Jan 2023 was a Sunday
    return new Intl.DateTimeFormat(locale(), { weekday: style || 'long' }).format(d);
  }
  function parseLocalDate(str) {
    if (!str) return new Date(NaN);
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  function toLocalDateStr(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** Translate all static nodes carrying data-i18n attributes. */
  function applyStatic(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    scope.querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
    scope.querySelectorAll('[data-i18n-title]').forEach(el => { const s = t(el.getAttribute('data-i18n-title')); el.setAttribute('title', s); el.setAttribute('aria-label', s); });
  }

  window.SS = window.SS || {};
  window.SS.i18n = { t, setLanguage, getLanguage, locale, dir, fmtDate, fmtLongDate, fmtTime, fmtNumber, dayName, parseLocalDate, toLocalDateStr, applyStatic, STRINGS };
})();
