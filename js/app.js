/**
 * Polimona Music Planner - Main Application Logic
 * Mobile-first PWA for iPhone Safari
 * Includes Dual Calendar (Tasks + Teaching Schedule with Green Windows / Grey Busy Days)
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // Application State
  // -------------------------------------------------------------
  let tasks = [];
  let categories = [];
  let lessons = [];
  let settings = {};
  let uiState = {
    viewMode: 'categories',       // 'categories' | 'flat'
    currentFilter: 'all',         // 'all' | 'burning' | 'active' | 'completed'
    calendarMode: 'tasks',        // 'tasks' | 'teaching'
    selectedCalendarDate: null,
    collapsedCategories: {}       // { [catId]: boolean }
  };
  let searchQuery = '';

  // Calendar State
  let calCurrentYear = new Date().getFullYear();
  let calCurrentMonth = new Date().getMonth(); // 0-11
  let calSelectedDate = null; // 'YYYY-MM-DD'

  // Modals state
  let editingTaskId = null;
  let editingCategoryId = null;
  let editingLessonId = null;
  let pendingDeleteCatId = null;

  // -------------------------------------------------------------
  // DOM Elements
  // -------------------------------------------------------------
  const currentDateBadge = document.getElementById('currentDateBadge');
  const tasksListContainer = document.getElementById('tasksListContainer');
  const taskSearchInput = document.getElementById('taskSearchInput');
  const viewModeCategoriesBtn = document.getElementById('viewModeCategoriesBtn');
  const viewModeFlatBtn = document.getElementById('viewModeFlatBtn');
  const summaryPills = document.querySelectorAll('.summary-pill');

  const countAll = document.getElementById('countAll');
  const countRegular = document.getElementById('countRegular');
  const countDeadlines = document.getElementById('countDeadlines');
  const countActive = document.getElementById('countActive');
  const countCompleted = document.getElementById('countCompleted');

  // Navigation
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const navAddTask = document.getElementById('navAddTask');
  const tabContents = document.querySelectorAll('.tab-content');

  // Modals & Backdrops
  const modalBackdrop = document.getElementById('modalBackdrop');

  // Task Sheet & Form
  const taskSheet = document.getElementById('taskSheet');
  const taskSheetTitle = document.getElementById('taskSheetTitle');
  const taskForm = document.getElementById('taskForm');
  const taskIdInput = document.getElementById('taskIdInput');
  const taskTitleInput = document.getElementById('taskTitleInput');
  const taskDescInput = document.getElementById('taskDescInput');
  const taskCategoryOptions = document.getElementById('taskCategoryOptions');
  const taskDeadlineDate = document.getElementById('taskDeadlineDate');
  const taskDeadlineTime = document.getElementById('taskDeadlineTime');
  const taskDeadlineEndTime = document.getElementById('taskDeadlineEndTime');
  const taskDurationBadge = document.getElementById('taskDurationBadge');
  const btnClearEndTime = document.getElementById('btnClearEndTime');
  const taskTypeInputs = document.querySelectorAll('input[name="taskType"]');
  const taskTypeNote = document.getElementById('taskTypeNote');
  const taskTitleLabel = document.getElementById('taskTitleLabel');
  const taskDateLabel = document.getElementById('taskDateLabel');
  const taskTimeLabel = document.getElementById('taskTimeLabel');
  const btnClearTaskDate = document.getElementById('btnClearTaskDate');
  const deleteTaskBtn = document.getElementById('deleteTaskBtn');
  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  const closeTaskSheetBtn = document.getElementById('closeTaskSheetBtn');

  // Category Sheet & Form
  const categorySheet = document.getElementById('categorySheet');
  const catSheetTitle = document.getElementById('catSheetTitle');
  const categoryForm = document.getElementById('categoryForm');
  const catIdInput = document.getElementById('catIdInput');
  const catNameInput = document.getElementById('catNameInput');
  const catEmojiPicker = document.getElementById('catEmojiPicker');
  const catSelectedIcon = document.getElementById('catSelectedIcon');
  const saveCatBtn = document.getElementById('saveCatBtn');
  const openAddCategoryBtn = document.getElementById('openAddCategoryBtn');
  const openAddCategoryBtnLarge = document.getElementById('openAddCategoryBtnLarge');
  const closeCatSheetBtn = document.getElementById('closeCatSheetBtn');
  const cancelCatBtn = document.getElementById('cancelCatBtn');

  // Category Screen Lists
  const systemCategoryList = document.getElementById('systemCategoryList');
  const customCategoryList = document.getElementById('customCategoryList');
  const customCatCountBadge = document.getElementById('customCatCountBadge');

  // Safe Category Deletion Sheet
  const deleteCategorySheet = document.getElementById('deleteCategorySheet');
  const deleteCatSheetTitle = document.getElementById('deleteCatSheetTitle');
  const deleteCatIconDisplay = document.getElementById('deleteCatIconDisplay');
  const deleteCatNameDisplay = document.getElementById('deleteCatNameDisplay');
  const deleteCatCountDisplay = document.getElementById('deleteCatCountDisplay');
  const migrationOptionBox = document.getElementById('migrationOptionBox');
  const migrationTargetSelect = document.getElementById('migrationTargetSelect');
  const confirmDeleteCatBtn = document.getElementById('confirmDeleteCatBtn');
  const cancelDeleteCatBtn = document.getElementById('cancelDeleteCatBtn');
  const closeDeleteCatSheetBtn = document.getElementById('closeDeleteCatSheetBtn');

  // Dual Calendar Elements
  const btnCalModeTasks = document.getElementById('btnCalModeTasks');
  const btnCalModeTeaching = document.getElementById('btnCalModeTeaching');
  const btnCalPrevMonth = document.getElementById('btnCalPrevMonth');
  const btnCalNextMonth = document.getElementById('btnCalNextMonth');
  const btnCalToday = document.getElementById('btnCalToday');
  const calMonthTitle = document.getElementById('calMonthTitle');
  const calendarDaysGrid = document.getElementById('calendarDaysGrid');
  const calendarLegendBar = document.getElementById('calendarLegendBar');
  const calSelectedDayHeading = document.getElementById('calSelectedDayHeading');
  const calSelectedDaySubheading = document.getElementById('calSelectedDaySubheading');
  const calDayHeaderAction = document.getElementById('calDayHeaderAction');
  const calendarDayDetailsContent = document.getElementById('calendarDayDetailsContent');

  // Floating Day Popover (Минюшка дня)
  const calendarPopoverBackdrop = document.getElementById('calendarPopoverBackdrop');
  const calendarPopover = document.getElementById('calendarPopover');
  const popoverBeak = document.getElementById('popoverBeak');
  const popoverDateBadge = document.getElementById('popoverDateBadge');
  const popoverDayNum = document.getElementById('popoverDayNum');
  const popoverDayName = document.getElementById('popoverDayName');
  const popoverDateHeading = document.getElementById('popoverDateHeading');
  const popoverItemsCount = document.getElementById('popoverItemsCount');
  const closePopoverBtn = document.getElementById('closePopoverBtn');
  const popoverItemsList = document.getElementById('popoverItemsList');
  const popoverAddTaskBtn = document.getElementById('popoverAddTaskBtn');
  const popoverAddLessonBtn = document.getElementById('popoverAddLessonBtn');

  // Lesson Sheet & Form
  const lessonSheet = document.getElementById('lessonSheet');
  const lessonSheetTitle = document.getElementById('lessonSheetTitle');
  const lessonForm = document.getElementById('lessonForm');
  const lessonIdInput = document.getElementById('lessonIdInput');
  const lessonStudentInput = document.getElementById('lessonStudentInput');
  const lessonSubjectChips = document.getElementById('lessonSubjectChips');
  const lessonSubjectInput = document.getElementById('lessonSubjectInput');
  const lessonDateInput = document.getElementById('lessonDateInput');
  const lessonStartTimeInput = document.getElementById('lessonStartTimeInput');
  const lessonEndTimeInput = document.getElementById('lessonEndTimeInput');
  const lessonNotesInput = document.getElementById('lessonNotesInput');
  const deleteLessonBtn = document.getElementById('deleteLessonBtn');
  const cancelLessonBtn = document.getElementById('cancelLessonBtn');
  const closeLessonSheetBtn = document.getElementById('closeLessonSheetBtn');

  // Settings
  const settingSoundToggle = document.getElementById('settingSoundToggle');
  const settingHideCompletedToggle = document.getElementById('settingHideCompletedToggle');
  const btnExportData = document.getElementById('btnExportData');
  const btnImportDataTrigger = document.getElementById('btnImportDataTrigger');
  const fileImportInput = document.getElementById('fileImportInput');
  const btnResetData = document.getElementById('btnResetData');

  // Toast
  const toastBanner = document.getElementById('toastBanner');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');

  // Emojis for categories
  const AVAILABLE_EMOJIS = [
    '🎹', '🎤', '🎧', '🎼', '🎻', '🎸', 
    '🎺', '🥁', '🎵', '🎶', '📚', '⭐', 
    '📀', '💼', '☕', '💡', '🔔', '✨'
  ];

  // Subject icon mapping for lessons
  const SUBJECT_ICONS = {
    'Вокал': '🎤',
    'Фортепиано': '🎹',
    'Сольфеджио': '🎼',
    'Гитара': '🎸',
    'Скрипка': '🎻',
    'Теория': '📚'
  };

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------
  function init() {
    loadData();
    initCalendarState();
    renderCurrentDate();
    initEventListeners();
    initEmojiPicker();
    initLessonSubjectChips();
    applyStoredStateToUI();
    renderApp();

    setInterval(() => {
      renderApp();
    }, 60000);
  }

  function loadData() {
    tasks = window.storageService.getTasks();
    categories = window.storageService.getCategories();
    lessons = window.storageService.getLessons();
    settings = window.storageService.getSettings();
    uiState = window.storageService.getUIState();

    if (window.soundEffects) {
      window.soundEffects.setEnabled(settings.soundEnabled);
    }
  }

  function initCalendarState() {
    const today = new Date();
    calCurrentYear = today.getFullYear();
    calCurrentMonth = today.getMonth();

    if (uiState.selectedCalendarDate) {
      calSelectedDate = uiState.selectedCalendarDate;
      const parts = calSelectedDate.split('-');
      if (parts.length === 3) {
        calCurrentYear = parseInt(parts[0], 10);
        calCurrentMonth = parseInt(parts[1], 10) - 1;
      }
    } else {
      calSelectedDate = window.storageService.formatDateIso(today);
    }
  }

  function renderCurrentDate() {
    const now = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const dateFormatted = now.toLocaleDateString('ru-RU', options);
    const capitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
    currentDateBadge.textContent = capitalized;
  }

  function applyStoredStateToUI() {
    settingSoundToggle.checked = !!settings.soundEnabled;
    settingHideCompletedToggle.checked = !!settings.hideCompleted;

    // View mode
    if (uiState.viewMode === 'flat') {
      viewModeFlatBtn.classList.add('active');
      viewModeCategoriesBtn.classList.remove('active');
    } else {
      viewModeCategoriesBtn.classList.add('active');
      viewModeFlatBtn.classList.remove('active');
    }

    // Filter pill
    summaryPills.forEach(pill => {
      if (pill.getAttribute('data-filter') === uiState.currentFilter) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Calendar mode
    if (uiState.calendarMode === 'teaching') {
      btnCalModeTeaching.classList.add('active');
      btnCalModeTasks.classList.remove('active');
    } else {
      btnCalModeTasks.classList.add('active');
      btnCalModeTeaching.classList.remove('active');
    }
  }

  // -------------------------------------------------------------
  // Time & Duration Utilities
  // -------------------------------------------------------------
  function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function minutesToTime(mins) {
    const totalMins = ((mins % (24 * 60)) + (24 * 60)) % (24 * 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function calculateDurationText(startTime, endTime) {
    if (!startTime || !endTime) return '';
    const s = timeToMinutes(startTime);
    const e = timeToMinutes(endTime);
    if (e <= s) return '';
    const diff = e - s;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0 && m > 0) return `${h} ч ${m} м`;
    if (h > 0) return `${h} ч`;
    return `${m} мин`;
  }

  function updateTaskDurationBadge() {
    if (!taskDurationBadge) return;
    const s = taskDeadlineTime ? taskDeadlineTime.value : '';
    const e = taskDeadlineEndTime ? taskDeadlineEndTime.value : '';
    const text = calculateDurationText(s, e);
    if (text) {
      taskDurationBadge.textContent = text;
      taskDurationBadge.style.display = 'inline-flex';
    } else {
      taskDurationBadge.textContent = '';
      taskDurationBadge.style.display = 'none';
    }
  }

  // -------------------------------------------------------------
  // Deadline & Regular Tasks Evaluation
  // -------------------------------------------------------------
  function evaluateTaskDeadline(task) {
    const isDeadline = task.isDeadline === true || task.taskType === 'deadline';

    if (task.completed) {
      return {
        level: 6,
        status: 'completed',
        label: '✓ Выполнено',
        badgeClass: 'badge-completed',
        isBurning: false,
        isOverdue: false,
        isDeadline
      };
    }

    // 1. REGULAR TASK (Обычная задача / дело / пара / покупка)
    if (!isDeadline) {
      if (!task.deadlineDate) {
        return {
          level: 5,
          status: 'regular-nodate',
          label: '📝 Обычная задача',
          badgeClass: 'badge-regular-task',
          isBurning: false,
          isOverdue: false,
          isDeadline: false
        };
      }

      const timeStr = task.deadlineTime || '';
      const endTimeStr = task.deadlineEndTime || '';
      const plannedObj = new Date(`${task.deadlineDate}T${timeStr || '12:00'}:00`);
      let formatted = formatRegularDate(plannedObj, !!task.deadlineTime);
      if (timeStr && endTimeStr) {
        const durText = calculateDurationText(timeStr, endTimeStr);
        const rangeText = `${timeStr} – ${endTimeStr}${durText ? ` (${durText})` : ''}`;
        formatted = formatted.replace(timeStr, rangeText);
      }

      return {
        level: 4,
        status: 'regular-scheduled',
        label: `📅 ${formatted}`,
        badgeClass: 'badge-regular-date',
        isBurning: false,
        isOverdue: false,
        isDeadline: false,
        deadlineObj: plannedObj
      };
    }

    // 2. DEADLINE TASK (Срочный дедлайн)
    if (!task.deadlineDate) {
      return {
        level: 3,
        status: 'deadline-nodate',
        label: '⏰ Без точной даты',
        badgeClass: 'badge-normal',
        isBurning: false,
        isOverdue: false,
        isDeadline: true
      };
    }

    const timeStr = task.deadlineTime || '23:59';
    const deadlineObj = new Date(`${task.deadlineDate}T${timeStr}:00`);
    const now = new Date();
    const diffMs = deadlineObj.getTime() - now.getTime();

    // 2.1 Дедлайн прошёл
    if (diffMs < 0) {
      return {
        level: 1,
        status: 'overdue',
        label: '⚠️ ДЕДЛАЙН ПРОШЁЛ',
        badgeClass: 'badge-overdue',
        isBurning: false,
        isOverdue: true,
        isDeadline: true,
        deadlineObj
      };
    }

    // 2.2 Горит дедлайн (меньше 24 часов)
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    if (diffMs <= twentyFourHoursMs) {
      const hoursLeft = Math.max(1, Math.round(diffMs / (60 * 60 * 1000)));
      return {
        level: 2,
        status: 'burning',
        label: '🔥 ГОРИТ ДЕДЛАЙН',
        subLabel: `${hoursLeft} ч. осталось`,
        badgeClass: 'badge-burning',
        isBurning: true,
        isOverdue: false,
        isDeadline: true,
        deadlineObj
      };
    }

    // 2.3 Больше 24 часов
    const formattedDate = formatDeadlineDate(deadlineObj);
    return {
      level: 3,
      status: 'normal',
      label: `⏰ Дедлайн: ${formattedDate}`,
      badgeClass: 'badge-deadline',
      isBurning: false,
      isOverdue: false,
      isDeadline: true,
      deadlineObj
    };
  }

  function formatRegularDate(dateObj, hasTime) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();

    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (isToday) return hasTime ? `Сегодня, ${timeStr}` : 'Сегодня';
    if (isTomorrow) return hasTime ? `Завтра, ${timeStr}` : 'Завтра';
    if (isYesterday) return hasTime ? `Вчера, ${timeStr}` : 'Вчера';

    const options = { day: 'numeric', month: 'short' };
    const dateFormatted = dateObj.toLocaleDateString('ru-RU', options);
    return hasTime ? `${dateFormatted}, ${timeStr}` : dateFormatted;
  }

  function formatDeadlineDate(dateObj) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();

    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (isToday) return `Сегодня, ${timeStr}`;
    if (isTomorrow) return `Завтра, ${timeStr}`;

    const options = { day: 'numeric', month: 'short' };
    const dateFormatted = dateObj.toLocaleDateString('ru-RU', options);
    return `${dateFormatted}, ${timeStr}`;
  }

  function sortTasks(taskList) {
    const priorityWeights = { high: 3, medium: 2, low: 1 };

    return [...taskList].sort((a, b) => {
      // 1. Completed tasks always go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.completed && b.completed) {
        return new Date(b.completedAt || b.createdAt || 0).getTime() - new Date(a.completedAt || a.createdAt || 0).getTime();
      }

      const evalA = evaluateTaskDeadline(a);
      const evalB = evaluateTaskDeadline(b);

      // 2. Urgent deadlines (overdue or burning) take top priority
      const isUrgentA = evalA.isDeadline && (evalA.isOverdue || evalA.isBurning);
      const isUrgentB = evalB.isDeadline && (evalB.isOverdue || evalB.isBurning);

      if (isUrgentA || isUrgentB) {
        if (isUrgentA && !isUrgentB) return -1;
        if (!isUrgentA && isUrgentB) return 1;
        // Both are urgent: overdue (level 1) before burning (level 2)
        if (evalA.level !== evalB.level) {
          return evalA.level - evalB.level;
        }
        if (evalA.deadlineObj && evalB.deadlineObj) {
          return evalA.deadlineObj.getTime() - evalB.deadlineObj.getTime();
        }
      }

      // 3. Dated tasks & deadlines: chronological order (earliest first)
      if (evalA.deadlineObj && evalB.deadlineObj) {
        const timeDiff = evalA.deadlineObj.getTime() - evalB.deadlineObj.getTime();
        if (timeDiff !== 0) return timeDiff;
        // Same time: deadline before regular task
        if (evalA.isDeadline !== evalB.isDeadline) {
          return evalA.isDeadline ? -1 : 1;
        }
      } else if (evalA.deadlineObj && !evalB.deadlineObj) {
        return -1; // dated task before undated task
      } else if (!evalA.deadlineObj && evalB.deadlineObj) {
        return 1;
      }

      // 4. Undated or identical time: priority weight
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightA !== weightB) {
        return weightB - weightA;
      }

      // 5. Newest creation first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }

  function getFilteredTasks() {
    let filtered = [...tasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => {
        const titleMatch = t.title && t.title.toLowerCase().includes(q);
        const descMatch = t.description && t.description.toLowerCase().includes(q);
        return titleMatch || descMatch;
      });
    }

    if (settings.hideCompleted && uiState.currentFilter !== 'completed') {
      filtered = filtered.filter(t => !t.completed);
    }

    if (uiState.currentFilter === 'regular') {
      filtered = filtered.filter(t => {
        const evalRes = evaluateTaskDeadline(t);
        return !t.completed && !evalRes.isDeadline;
      });
    } else if (uiState.currentFilter === 'deadlines') {
      filtered = filtered.filter(t => {
        const evalRes = evaluateTaskDeadline(t);
        return !t.completed && evalRes.isDeadline;
      });
    } else if (uiState.currentFilter === 'burning') {
      filtered = filtered.filter(t => {
        const evalRes = evaluateTaskDeadline(t);
        return !t.completed && (evalRes.isBurning || evalRes.isOverdue);
      });
    } else if (uiState.currentFilter === 'active') {
      filtered = filtered.filter(t => !t.completed);
    } else if (uiState.currentFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    return filtered;
  }

  function updateSummaryCounts() {
    const total = tasks.length;
    let regularCount = 0;
    let deadlinesCount = 0;
    let activeCount = 0;
    let completedCount = 0;

    tasks.forEach(t => {
      if (t.completed) {
        completedCount++;
      } else {
        activeCount++;
        const evalRes = evaluateTaskDeadline(t);
        if (evalRes.isDeadline) {
          deadlinesCount++;
        } else {
          regularCount++;
        }
      }
    });

    if (countAll) countAll.textContent = total;
    if (countRegular) countRegular.textContent = regularCount;
    if (countDeadlines) countDeadlines.textContent = deadlinesCount;
    if (countActive) countActive.textContent = activeCount;
    if (countCompleted) countCompleted.textContent = completedCount;
  }

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------
  function renderApp() {
    updateSummaryCounts();
    renderTasksScreen();
    renderCategoriesScreen();
    renderDualCalendar();
  }

  function renderTasksScreen() {
    const filteredTasks = getFilteredTasks();

    if (tasks.length === 0) {
      tasksListContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎼</div>
          <div class="empty-state-title">Пока нет задач</div>
          <div class="empty-state-text">Добавьте первую задачу для подготовки к репетиции, записи или концерту</div>
          <button class="btn-primary-ghost" id="emptyStateAddBtn">
            <span>➕ Создать задачу</span>
          </button>
        </div>
      `;
      const btn = document.getElementById('emptyStateAddBtn');
      if (btn) btn.addEventListener('click', openAddTaskModal);
      return;
    }

    if (filteredTasks.length === 0) {
      tasksListContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">Ничего не найдено</div>
          <div class="empty-state-text">Попробуйте изменить поисковый запрос или фильтры</div>
        </div>
      `;
      return;
    }

    if (uiState.viewMode === 'flat') {
      renderFlatTaskList(filteredTasks);
    } else {
      renderGroupedTaskList(filteredTasks);
    }
  }

  function renderGroupedTaskList(taskList) {
    let html = '';

    categories.forEach(cat => {
      const catTasks = taskList.filter(t => t.categoryId === cat.id);
      if (catTasks.length === 0 && (searchQuery.trim() || uiState.currentFilter !== 'all')) {
        return;
      }

      const sortedCatTasks = sortTasks(catTasks);
      const isCollapsed = !!uiState.collapsedCategories[cat.id];
      const hasBurning = sortedCatTasks.some(t => {
        const res = evaluateTaskDeadline(t);
        return !t.completed && res.isDeadline && (res.isBurning || res.isOverdue);
      });

      html += `
        <section class="category-group" data-cat-id="${cat.id}">
          <div class="category-group-header" data-toggle-cat="${cat.id}">
            <div class="cat-header-title">
              <span class="cat-icon">${cat.icon}</span>
              <span>${escapeHtml(cat.name)}</span>
              ${hasBurning ? '<span style="font-size: 13px;" title="Есть горящие дедлайны">🔥</span>' : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="cat-header-count">${sortedCatTasks.length}</span>
              <span style="font-size: 12px; color: var(--espresso-400); transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.2s;">▼</span>
            </div>
          </div>
          
          <div class="category-tasks" style="display: ${isCollapsed ? 'none' : 'flex'};">
            ${
              sortedCatTasks.length > 0 
                ? sortedCatTasks.map(t => renderTaskCard(t)).join('') 
                : `<div style="padding: 12px 14px; background: rgba(255,255,255,0.4); border-radius: 14px; font-size: 13px; color: var(--espresso-400); text-align: center;">В этой категории задач пока нет</div>`
            }
          </div>
        </section>
      `;
    });

    tasksListContainer.innerHTML = html;
    attachTaskCardListeners(tasksListContainer);
  }

  function renderFlatTaskList(taskList) {
    const sorted = sortTasks(taskList);
    let html = `
      <div class="category-tasks">
        ${sorted.map(t => renderTaskCard(t)).join('')}
      </div>
    `;
    tasksListContainer.innerHTML = html;
    attachTaskCardListeners(tasksListContainer);
  }

  function renderTaskCard(task) {
    const urgency = evaluateTaskDeadline(task);
    const cat = categories.find(c => c.id === task.categoryId) || { name: 'Общее', icon: '🎵' };

    let cardBorderClass = '';
    if (!task.completed && urgency.isDeadline) {
      if (urgency.isBurning) cardBorderClass = 'burning-border';
      else if (urgency.isOverdue) cardBorderClass = 'overdue-border';
    }

    const priorityLabels = {
      high: { symbol: '𝆑𝆑', text: 'Высокий', cls: 'priority-high' },
      medium: { symbol: '𝆑', text: 'Средний', cls: 'priority-medium' },
      low: { symbol: '𝆏', text: 'Обычный', cls: 'priority-low' }
    };
    const prioInfo = priorityLabels[task.priority] || priorityLabels.medium;

    return `
      <div class="task-card ${task.completed ? 'is-completed' : ''} ${cardBorderClass}" data-task-id="${task.id}">
        <div class="task-main-row">
          <div class="custom-checkbox" data-action="toggle-complete" data-id="${task.id}" role="checkbox" aria-checked="${task.completed}">
            ${task.completed ? '✓' : ''}
          </div>
          <div class="task-body" data-action="edit-task" data-id="${task.id}">
            <div class="task-title-line">
              <span class="task-title">${escapeHtml(task.title)}</span>
              <button class="task-action-btn" data-action="edit-task" data-id="${task.id}" aria-label="Параметры задачи">···</button>
            </div>
            ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
          </div>
        </div>

        <div class="task-meta-row">
          <span class="deadline-badge ${urgency.badgeClass}">
            ${urgency.label}
          </span>
          <span class="priority-pill ${prioInfo.cls}">
            <span style="font-family: var(--font-serif); font-style: italic;">${prioInfo.symbol}</span>
            <span>${prioInfo.text}</span>
          </span>
          <span class="task-cat-tag">
            <span>${cat.icon}</span>
            <span>${escapeHtml(cat.name)}</span>
          </span>
        </div>
      </div>
    `;
  }

  function attachTaskCardListeners(container) {
    const checkboxes = container.querySelectorAll('[data-action="toggle-complete"]');
    checkboxes.forEach(chk => {
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = chk.getAttribute('data-id');
        toggleTask(id);
      });
    });

    const editTriggers = container.querySelectorAll('[data-action="edit-task"]');
    editTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openEditTaskModal(id);
      });
    });

    const catHeaders = container.querySelectorAll('[data-toggle-cat]');
    catHeaders.forEach(hdr => {
      hdr.addEventListener('click', () => {
        const catId = hdr.getAttribute('data-toggle-cat');
        uiState.collapsedCategories[catId] = !uiState.collapsedCategories[catId];
        window.storageService.saveUIState({ collapsedCategories: uiState.collapsedCategories });
        renderApp();
      });
    });
  }

  function toggleTask(id) {
    const updated = window.storageService.toggleTaskCompleted(id);
    if (updated) {
      if (updated.completed) {
        if (window.soundEffects) window.soundEffects.playComplete();
        showToast('🎵 Задача выполнена!');
      } else {
        if (window.soundEffects) window.soundEffects.playUncomplete();
        showToast('↩️ Задача возвращена в работу');
      }
      loadData();
      renderApp();
    }
  }

  // -------------------------------------------------------------
  // DUAL CALENDAR SYSTEM
  // Mode 1: Tasks by Categories
  // Mode 2: Teaching Lessons & Free Windows (Green = free windows, Grey = busy days)
  // -------------------------------------------------------------
  function renderDualCalendar() {
    renderCalendarMonthTitle();
    renderCalendarGrid();
    renderCalendarLegend();
    renderCalendarDayDetails();
  }

  function renderCalendarMonthTitle() {
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    calMonthTitle.textContent = `${monthNames[calCurrentMonth]} ${calCurrentYear}`;
  }

  function renderCalendarLegend() {
    if (uiState.calendarMode === 'teaching') {
      calendarLegendBar.innerHTML = `
        <div class="legend-item">
          <div class="legend-chip-green"></div>
          <span><b>Зелёный:</b> Есть свободные окна для записи</span>
        </div>
        <div class="legend-item">
          <div class="legend-chip-grey"></div>
          <span><b>Серый:</b> День полностью занят</span>
        </div>
      `;
    } else {
      calendarLegendBar.innerHTML = `
        <div class="legend-item">
          <span class="cal-dot dot-burning"></span>
          <span>🔥 Горит</span>
        </div>
        <div class="legend-item">
          <span class="cal-dot dot-overdue"></span>
          <span>⚠️ Просрочен</span>
        </div>
        <div class="legend-item">
          <span class="cal-dot dot-deadline"></span>
          <span>⏰ Дедлайн</span>
        </div>
        <div class="legend-item">
          <span class="cal-dot dot-regular"></span>
          <span>📝 Задача</span>
        </div>
        <div class="legend-item">
          <span class="cal-dot dot-completed"></span>
          <span>✓ Сделано</span>
        </div>
      `;
    }
  }

  function renderCalendarGrid() {
    const todayStr = window.storageService.formatDateIso(new Date());

    // First day of current month
    const firstDay = new Date(calCurrentYear, calCurrentMonth, 1);
    // 0 = Sunday, 1 = Monday ... convert to Monday-based (0 = Mon, 6 = Sun)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    // Total days in current month
    const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
    // Total days in previous month
    const daysInPrevMonth = new Date(calCurrentYear, calCurrentMonth, 0).getDate();

    let gridHtml = '';

    // 1. Previous month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const prevMonth = calCurrentMonth === 0 ? 11 : calCurrentMonth - 1;
      const prevYear = calCurrentMonth === 0 ? calCurrentYear - 1 : calCurrentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      gridHtml += renderCalendarCell(dateStr, dNum, true, todayStr);
    }

    // 2. Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${calCurrentYear}-${String(calCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      gridHtml += renderCalendarCell(dateStr, day, false, todayStr);
    }

    // 3. Next month leading days (to fill 7-day columns)
    const totalCells = startDayOfWeek + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = calCurrentMonth === 11 ? 0 : calCurrentMonth + 1;
      const nextYear = calCurrentMonth === 11 ? calCurrentYear + 1 : calCurrentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      gridHtml += renderCalendarCell(dateStr, day, true, todayStr);
    }

    calendarDaysGrid.innerHTML = gridHtml;

    // Attach click listener for each day cell
    calendarDaysGrid.querySelectorAll('.cal-day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.soundEffects) window.soundEffects.playTap();
        const dateStr = cell.getAttribute('data-date');
        calSelectedDate = dateStr;
        uiState.selectedCalendarDate = dateStr;
        window.storageService.saveUIState({ selectedCalendarDate: dateStr });

        calendarDaysGrid.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('is-selected'));
        cell.classList.add('is-selected');

        renderCalendarDayDetails();
        showCalendarPopover(dateStr, cell);
      });
    });
  }

  function getCalendarEventShortTitle(title) {
    if (!title) return '';
    let t = title.replace(/^Пара:\s*/i, '').replace(/^Урок:\s*/i, '').trim();
    if (t.length > 9) {
      return t.slice(0, 8) + '…';
    }
    return t;
  }

  function renderCalendarCell(dateStr, dayNum, isOtherMonth, todayStr) {
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === calSelectedDate;

    let cellClasses = ['cal-day-cell'];
    if (isOtherMonth) cellClasses.push('other-month');
    if (isToday) cellClasses.push('is-today');
    if (isSelected) cellClasses.push('is-selected');

    const dayTasks = tasks.filter(t => t.deadlineDate === dateStr);
    const dayLessons = lessons.filter(l => l.date === dateStr);

    let cellEvents = [];
    let windowIndicatorHtml = '';

    if (uiState.calendarMode === 'teaching') {
      // Teaching Schedule: Free Windows (Green) vs Fully Busy (Grey)
      const scheduleStatus = evaluateTeachingDaySchedule(dayLessons, dateStr);

      if (scheduleStatus.status === 'free-windows') {
        cellClasses.push('day-free-windows');
        windowIndicatorHtml = `<span class="cal-window-indicator badge-green">${scheduleStatus.label}</span>`;
      } else if (scheduleStatus.status === 'busy') {
        cellClasses.push('day-busy');
        windowIndicatorHtml = `<span class="cal-window-indicator badge-grey">Занято</span>`;
      }

      // Show lessons as event rows in cell
      dayLessons.forEach(l => {
        cellEvents.push({
          title: l.studentName,
          dotCls: 'event-lesson',
          time: l.startTime
        });
      });
    } else {
      // All tasks & lessons
      dayTasks.forEach(t => {
        let dotCls = 'event-regular';
        if (t.completed) dotCls = 'event-completed';
        else if (t.isDeadline || t.taskType === 'deadline') dotCls = 'event-deadline';

        cellEvents.push({
          title: t.title,
          dotCls,
          time: t.deadlineTime || ''
        });
      });

      dayLessons.forEach(l => {
        cellEvents.push({
          title: l.studentName,
          dotCls: 'event-lesson',
          time: l.startTime
        });
      });
    }

    cellEvents.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

    let eventsHtml = '';
    if (cellEvents.length > 0) {
      const maxShown = 3;
      const visible = cellEvents.slice(0, maxShown);
      const overflow = cellEvents.length - maxShown;

      eventsHtml = `
        <div class="cal-day-events-list">
          ${visible.map(e => `
            <div class="cal-cell-event ${e.dotCls}" title="${escapeHtml(e.title)}">
              <span class="event-dot"></span>
              <span class="event-text">${escapeHtml(getCalendarEventShortTitle(e.title))}</span>
            </div>
          `).join('')}
          ${overflow > 0 ? `<div class="cal-cell-event event-more">+${overflow}</div>` : ''}
        </div>
      `;
    }

    return `
      <div class="${cellClasses.join(' ')}" data-date="${dateStr}">
        <div class="cal-day-header">
          <span class="cal-day-number">${dayNum}</span>
        </div>
        ${windowIndicatorHtml}
        ${eventsHtml}
      </div>
    `;
  }

  function showCalendarPopover(dateStr, cellEl) {
    if (!calendarPopover || !cellEl) return;

    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayNum = dateObj.getDate();
    const dayNamesShort = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    const dayNameShort = dayNamesShort[dateObj.getDay()];
    const monthNamesGen = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const dateFormatted = `${dayNum} ${monthNamesGen[dateObj.getMonth()]}`;

    if (popoverDayNum) popoverDayNum.textContent = dayNum;
    if (popoverDayName) popoverDayName.textContent = dayNameShort;
    if (popoverDateHeading) popoverDateHeading.textContent = dateFormatted;

    const dayTasks = tasks.filter(t => t.deadlineDate === dateStr);
    const dayLessons = lessons.filter(l => l.date === dateStr);
    const totalCount = dayTasks.length + dayLessons.length;

    if (popoverItemsCount) {
      if (totalCount === 0) {
        popoverItemsCount.textContent = 'Нет записей';
      } else {
        popoverItemsCount.textContent = `${totalCount} ${getNounPlural(totalCount, 'событие', 'события', 'событий')}`;
      }
    }

    let itemsHtml = '';
    if (totalCount === 0) {
      itemsHtml = `
        <div class="popover-empty">
          <div style="font-size: 26px; margin-bottom: 6px;">🎼</div>
          <div>На этот день ничего не запланировано</div>
        </div>
      `;
    } else {
      const unified = [];
      dayTasks.forEach(t => {
        const evalRes = evaluateTaskDeadline(t);
        let dotCls = 'dot-regular';
        if (t.completed) dotCls = 'dot-completed';
        else if (evalRes.isDeadline) dotCls = 'dot-deadline';

        unified.push({
          type: 'task',
          id: t.id,
          title: t.title,
          time: t.deadlineTime || '',
          endTime: t.deadlineEndTime || '',
          dotCls,
          isDone: t.completed,
          notes: t.description || ''
        });
      });

      dayLessons.forEach(l => {
        unified.push({
          type: 'lesson',
          id: l.id,
          title: l.studentName,
          time: l.startTime,
          endTime: l.endTime,
          dotCls: 'dot-lesson',
          isDone: false,
          notes: (l.subject ? l.subject : '') + (l.notes ? ` • ${l.notes}` : '')
        });
      });

      unified.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

      itemsHtml = unified.map(item => {
        let timeStr = '';
        let durStr = '';
        if (item.time) {
          timeStr = item.time;
          if (item.endTime) {
            timeStr += ` - ${item.endTime}`;
            durStr = calculateDurationText(item.time, item.endTime);
          }
        } else {
          timeStr = 'Без времени';
        }

        let subLine = timeStr;
        if (item.notes) {
          subLine += ` • ${escapeHtml(item.notes)}`;
        }

        return `
          <div class="popover-item ${item.isDone ? 'is-done' : ''}" data-popover-type="${item.type}" data-popover-id="${item.id}">
            <div class="popover-item-left">
              <span class="popover-item-dot ${item.dotCls}"></span>
              <div class="popover-item-info">
                <div class="popover-item-title">${escapeHtml(item.title)}</div>
                <div class="popover-item-sub">${subLine}</div>
              </div>
            </div>
            ${durStr ? `<div class="popover-item-dur">${durStr}</div>` : ''}
          </div>
        `;
      }).join('');
    }

    if (popoverItemsList) {
      popoverItemsList.innerHTML = itemsHtml;
      popoverItemsList.querySelectorAll('.popover-item').forEach(itemEl => {
        itemEl.addEventListener('click', () => {
          const type = itemEl.getAttribute('data-popover-type');
          const id = itemEl.getAttribute('data-popover-id');
          hideCalendarPopover();
          if (type === 'task') {
            openEditTaskModal(id);
          } else if (type === 'lesson') {
            openEditLessonModal(id);
          }
        });
      });
    }

    // Position Popover
    const calendarCard = document.querySelector('.calendar-card');
    if (!calendarCard) return;

    calendarPopover.style.display = 'flex';
    if (calendarPopoverBackdrop) calendarPopoverBackdrop.style.display = 'block';

    const cardRect = calendarCard.getBoundingClientRect();
    const cellRect = cellEl.getBoundingClientRect();

    const cellCenterX = (cellRect.left + cellRect.width / 2) - cardRect.left;
    const popoverWidth = Math.min(320, cardRect.width - 16);
    calendarPopover.style.width = `${popoverWidth}px`;

    let leftPos = cellCenterX - (popoverWidth / 2);
    if (leftPos < 8) leftPos = 8;
    if (leftPos + popoverWidth > cardRect.width - 8) {
      leftPos = cardRect.width - popoverWidth - 8;
    }
    calendarPopover.style.left = `${leftPos}px`;

    // Position beak
    const beakOffset = cellCenterX - leftPos - 7;
    const clampedBeakOffset = Math.max(16, Math.min(popoverWidth - 28, beakOffset));
    if (popoverBeak) {
      popoverBeak.style.left = `${clampedBeakOffset}px`;
    }

    // Vertical position
    const popoverHeight = calendarPopover.offsetHeight || 230;
    const cellTopInCard = cellRect.top - cardRect.top;
    const cellBottomInCard = cellRect.bottom - cardRect.top;

    if (cellTopInCard > popoverHeight + 15) {
      // Above cell
      const topPos = cellTopInCard - popoverHeight - 10;
      calendarPopover.style.top = `${topPos}px`;
      if (popoverBeak) popoverBeak.className = 'popover-beak beak-bottom';
    } else {
      // Below cell
      const topPos = cellBottomInCard + 10;
      calendarPopover.style.top = `${topPos}px`;
      if (popoverBeak) popoverBeak.className = 'popover-beak beak-top';
    }
  }

  function hideCalendarPopover() {
    if (calendarPopover) calendarPopover.style.display = 'none';
    if (calendarPopoverBackdrop) calendarPopoverBackdrop.style.display = 'none';
  }

  /**
   * Evaluates teaching schedule for a day:
   * Returns { status: 'free-windows' | 'busy' | 'none', label: string }
   */
  function evaluateTeachingDaySchedule(dayLessons, dateStr) {
    if (!dayLessons || dayLessons.length === 0) {
      // Check if it's past or future
      const todayIso = window.storageService.formatDateIso(new Date());
      if (dateStr < todayIso) {
        return { status: 'none', label: '' };
      }
      // Future or today with 0 lessons: completely free! (Green)
      return { status: 'free-windows', label: 'Свободно' };
    }

    // Sort lessons by startTime
    const sorted = [...dayLessons].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Calculate total lesson minutes
    let totalLessonMinutes = 0;
    sorted.forEach(l => {
      const sMin = timeToMinutes(l.startTime);
      const eMin = timeToMinutes(l.endTime);
      totalLessonMinutes += Math.max(0, eMin - sMin);
    });

    // Check if there are significant gaps (windows >= 45 min)
    let hasFreeWindows = false;
    const workStart = 10 * 60; // 10:00
    const workEnd = 20 * 60;   // 20:00

    const firstStart = timeToMinutes(sorted[0].startTime);
    if (firstStart - workStart >= 45) {
      hasFreeWindows = true;
    }

    for (let i = 0; i < sorted.length - 1; i++) {
      const curEnd = timeToMinutes(sorted[i].endTime);
      const nextStart = timeToMinutes(sorted[i + 1].startTime);
      if (nextStart - curEnd >= 45) {
        hasFreeWindows = true;
        break;
      }
    }

    const lastEnd = timeToMinutes(sorted[sorted.length - 1].endTime);
    if (workEnd - lastEnd >= 45) {
      hasFreeWindows = true;
    }

    // If day is packed with >= 5 hours of lessons and no free windows -> busy (Grey)
    if (totalLessonMinutes >= 300 && !hasFreeWindows) {
      return { status: 'busy', label: 'Занято' };
    }

    // Has lessons AND free windows -> Green
    if (hasFreeWindows) {
      return { status: 'free-windows', label: 'Окна' };
    }

    return { status: 'busy', label: 'Занято' };
  }

  // -------------------------------------------------------------
  // Calendar Day Details Panel
  // -------------------------------------------------------------
  function renderCalendarDayDetails() {
    if (!calSelectedDate) return;

    const parts = calSelectedDate.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

    // Russian date headers
    const dayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'long' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

    calSelectedDayHeading.textContent = formattedDate;
    calSelectedDaySubheading.textContent = capitalizedDay;

    if (uiState.calendarMode === 'teaching') {
      renderTeachingDayDetails();
    } else {
      renderTasksDayDetails();
    }
  }

  // Render Day Details: Tasks Mode
  function renderTasksDayDetails() {
    calDayHeaderAction.innerHTML = `
      <button class="btn-primary-ghost" id="btnAddDayTask">
        <span>➕ Задача</span>
      </button>
    `;
    const btn = document.getElementById('btnAddDayTask');
    if (btn) {
      btn.addEventListener('click', () => {
        openAddTaskModalWithDate(calSelectedDate);
      });
    }

    const dayTasks = tasks.filter(t => t.deadlineDate === calSelectedDate);
    const sorted = sortTasks(dayTasks);

    if (sorted.length === 0) {
      calendarDayDetailsContent.innerHTML = `
        <div class="empty-state" style="padding: 24px 10px;">
          <div style="font-size: 32px; margin-bottom: 6px;">🎼</div>
          <div class="empty-state-title" style="font-size: 16px;">На этот день нет задач и дедлайнов</div>
          <div class="empty-state-text" style="font-size: 13px;">Хотите запланировать пару, репетицию или задачу на эту дату?</div>
          <button class="btn-primary-ghost" id="btnEmptyAddDayTask" style="margin-top: 10px;">
            <span>➕ Создать задачу</span>
          </button>
        </div>
      `;
      const emptyBtn = document.getElementById('btnEmptyAddDayTask');
      if (emptyBtn) emptyBtn.addEventListener('click', () => openAddTaskModalWithDate(calSelectedDate));
      return;
    }

    let html = `<div class="category-tasks">${sorted.map(t => renderTaskCard(t)).join('')}</div>`;
    calendarDayDetailsContent.innerHTML = html;
    attachTaskCardListeners(calendarDayDetailsContent);
  }

  // Render Day Details: Teaching Schedule & Free Windows Mode
  function renderTeachingDayDetails() {
    calDayHeaderAction.innerHTML = `
      <button class="btn-primary-ghost" id="btnAddDayLesson">
        <span>➕ Записать урок</span>
      </button>
    `;
    const btn = document.getElementById('btnAddDayLesson');
    if (btn) {
      btn.addEventListener('click', () => {
        openAddLessonModal(calSelectedDate);
      });
    }

    const dayLessons = lessons.filter(l => l.date === calSelectedDate);
    dayLessons.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Working interval: 10:00 to 20:00
    const workStart = 10 * 60;
    const workEnd = 20 * 60;

    let timelineItems = [];

    if (dayLessons.length === 0) {
      // Entire day is free window
      timelineItems.push({
        type: 'free',
        startMins: workStart,
        endMins: workEnd,
        startTime: '10:00',
        endTime: '20:00',
        durationMins: workEnd - workStart
      });
    } else {
      let currentPointer = workStart;

      dayLessons.forEach(lesson => {
        const lStart = timeToMinutes(lesson.startTime);
        const lEnd = timeToMinutes(lesson.endTime);

        // If there is gap before this lesson
        if (lStart - currentPointer >= 20) {
          timelineItems.push({
            type: 'free',
            startMins: currentPointer,
            endMins: lStart,
            startTime: minutesToTime(currentPointer),
            endTime: minutesToTime(lStart),
            durationMins: lStart - currentPointer
          });
        }

        // Add the lesson
        timelineItems.push({
          type: 'lesson',
          lesson: lesson
        });

        currentPointer = Math.max(currentPointer, lEnd);
      });

      // Gap after the last lesson
      if (workEnd - currentPointer >= 20) {
        timelineItems.push({
          type: 'free',
          startMins: currentPointer,
          endMins: workEnd,
          startTime: minutesToTime(currentPointer),
          endTime: minutesToTime(workEnd),
          durationMins: workEnd - currentPointer
        });
      }
    }

    // Render Timeline HTML
    let html = '<div class="teaching-timeline">';

    timelineItems.forEach(item => {
      if (item.type === 'free') {
        const hours = Math.floor(item.durationMins / 60);
        const mins = item.durationMins % 60;
        let durationText = '';
        if (hours > 0) durationText += `${hours} ч `;
        if (mins > 0) durationText += `${mins} мин`;

        html += `
          <div class="free-window-card">
            <div class="free-window-info">
              <span class="free-window-badge">✨ Свободно</span>
              <div>
                <div class="free-window-time">${item.startTime} — ${item.endTime}</div>
                <div class="free-window-duration">${durationText.trim()} для записи ученика</div>
              </div>
            </div>
            <button class="btn-book-window" data-window-start="${item.startTime}" data-window-end="${item.endTime}">
              Записать
            </button>
          </div>
        `;
      } else {
        const l = item.lesson;
        const icon = SUBJECT_ICONS[l.subject] || '🎵';
        html += `
          <div class="lesson-card" data-lesson-id="${l.id}">
            <div class="lesson-left">
              <div class="lesson-icon-box">${icon}</div>
              <div>
                <div class="lesson-student-title">${escapeHtml(l.studentName)}</div>
                <div class="lesson-time-range">⏰ ${l.startTime} — ${l.endTime} • ${escapeHtml(l.subject)}</div>
                ${l.notes ? `<div class="lesson-notes-text">📝 ${escapeHtml(l.notes)}</div>` : ''}
              </div>
            </div>
            <button class="task-action-btn" data-edit-lesson="${l.id}" aria-label="Редактировать урок">···</button>
          </div>
        `;
      }
    });

    html += '</div>';
    calendarDayDetailsContent.innerHTML = html;

    // Attach timeline action listeners
    calendarDayDetailsContent.querySelectorAll('[data-window-start]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.getAttribute('data-window-start');
        openAddLessonModal(calSelectedDate, s);
      });
    });

    calendarDayDetailsContent.querySelectorAll('[data-edit-lesson]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-lesson');
        openEditLessonModal(id);
      });
    });
  }

  // -------------------------------------------------------------
  // Lesson Modal Handling
  // -------------------------------------------------------------
  function initLessonSubjectChips() {
    lessonSubjectChips.querySelectorAll('.subject-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        lessonSubjectChips.querySelectorAll('.subject-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        lessonSubjectInput.value = chip.getAttribute('data-subject');
      });
    });
  }

  function openAddLessonModal(dateStr, startHour = '14:00') {
    if (window.soundEffects) window.soundEffects.playTap();
    editingLessonId = null;
    lessonSheetTitle.textContent = 'Записать урок';
    lessonForm.reset();
    lessonIdInput.value = '';
    deleteLessonBtn.style.display = 'none';

    lessonDateInput.value = dateStr || window.storageService.formatDateIso(new Date());
    lessonStartTimeInput.value = startHour;

    // Default end time + 1 hour
    const sParts = startHour.split(':');
    const endH = String(Math.min(23, parseInt(sParts[0], 10) + 1)).padStart(2, '0');
    lessonEndTimeInput.value = `${endH}:${sParts[1]}`;

    // Select Vocal by default
    lessonSubjectInput.value = 'Вокал';
    lessonSubjectChips.querySelectorAll('.subject-chip').forEach(c => {
      if (c.getAttribute('data-subject') === 'Вокал') c.classList.add('active');
      else c.classList.remove('active');
    });

    openSheet(lessonSheet);
    setTimeout(() => lessonStudentInput.focus(), 300);
  }

  function openEditLessonModal(id) {
    if (window.soundEffects) window.soundEffects.playTap();
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) return;

    editingLessonId = id;
    lessonSheetTitle.textContent = 'Редактировать урок';
    lessonIdInput.value = lesson.id;
    lessonStudentInput.value = lesson.studentName;
    lessonSubjectInput.value = lesson.subject || 'Вокал';
    lessonDateInput.value = lesson.date;
    lessonStartTimeInput.value = lesson.startTime;
    lessonEndTimeInput.value = lesson.endTime;
    lessonNotesInput.value = lesson.notes || '';
    deleteLessonBtn.style.display = 'block';

    // Highlight active subject chip
    lessonSubjectChips.querySelectorAll('.subject-chip').forEach(c => {
      if (c.getAttribute('data-subject') === lesson.subject) c.classList.add('active');
      else c.classList.remove('active');
    });

    openSheet(lessonSheet);
  }

  function handleLessonFormSubmit(e) {
    e.preventDefault();
    const studentName = lessonStudentInput.value.trim();
    if (!studentName) return;

    const subject = lessonSubjectInput.value || 'Вокал';
    const date = lessonDateInput.value;
    const startTime = lessonStartTimeInput.value;
    const endTime = lessonEndTimeInput.value;
    const notes = lessonNotesInput.value.trim();

    if (editingLessonId) {
      window.storageService.updateLesson({
        id: editingLessonId,
        studentName,
        subject,
        date,
        startTime,
        endTime,
        notes
      });
      showToast('✨ Урок обновлён');
    } else {
      const newLesson = {
        id: 'lesson_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        studentName,
        subject,
        date,
        startTime,
        endTime,
        notes,
        status: 'scheduled'
      };
      window.storageService.addLesson(newLesson);
      if (window.soundEffects) window.soundEffects.playComplete();
      showToast('🎹 Урок записан в расписание!');
    }

    closeSheet(lessonSheet);
    loadData();
    renderDualCalendar();
  }

  function handleDeleteLesson() {
    if (!editingLessonId) return;
    if (confirm('Удалить эту запись урока?')) {
      window.storageService.deleteLesson(editingLessonId);
      showToast('🗑️ Урок удален');
      closeSheet(lessonSheet);
      loadData();
      renderDualCalendar();
    }
  }

  // -------------------------------------------------------------
  // Task Modal Handling
  // -------------------------------------------------------------
  function openAddTaskModal() {
    openAddTaskModalWithDate(window.storageService.formatDateIso(new Date()), 'regular');
  }

  function updateTaskTypeFormUI(type) {
    if (type === 'deadline') {
      if (taskTypeNote) {
        taskTypeNote.textContent = 'Для сдачи нот, курсовых, заявок на конкурсы (предупредит за 24 ч)';
      }
      if (taskTitleLabel) taskTitleLabel.textContent = 'Название дедлайна';
      if (taskDateLabel) taskDateLabel.textContent = '🔥 Срок сдачи (дедлайн)';
      if (taskTimeLabel) taskTimeLabel.textContent = '⏰ Время сдачи';
      if (taskTitleInput) taskTitleInput.placeholder = 'Например: Сдать нотную партитуру для квартета';
    } else {
      if (taskTypeNote) {
        taskTypeNote.textContent = 'Для пар, уроков, репетиций и списков дел — не горит красным';
      }
      if (taskTitleLabel) taskTitleLabel.textContent = 'Название задачи';
      if (taskDateLabel) taskDateLabel.textContent = '📅 Запланировано на';
      if (taskTimeLabel) taskTimeLabel.textContent = '⏰ Время';
      if (taskTitleInput) taskTitleInput.placeholder = 'Например: Сходить на пару по полифонии';
    }
  }

  function openAddTaskModalWithDate(initialDate, defaultType = 'regular') {
    if (window.soundEffects) window.soundEffects.playTap();
    editingTaskId = null;
    taskSheetTitle.textContent = defaultType === 'deadline' ? 'Новый дедлайн' : 'Новая задача';
    taskForm.reset();
    taskIdInput.value = '';
    deleteTaskBtn.style.display = 'none';

    taskDeadlineDate.value = initialDate || '';
    taskDeadlineTime.value = '11:40';
    if (taskDeadlineEndTime) taskDeadlineEndTime.value = '';
    updateTaskDurationBadge();

    const typeRadio = taskForm.querySelector(`input[name="taskType"][value="${defaultType}"]`);
    if (typeRadio) typeRadio.checked = true;
    updateTaskTypeFormUI(defaultType);

    const defaultPrio = taskForm.querySelector('input[name="priority"][value="medium"]');
    if (defaultPrio) defaultPrio.checked = true;

    renderCategoryOptionsInTaskForm();
    openSheet(taskSheet);
    setTimeout(() => taskTitleInput.focus(), 300);
  }

  function openEditTaskModal(id) {
    if (window.soundEffects) window.soundEffects.playTap();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    const isDeadline = task.isDeadline === true || task.taskType === 'deadline';
    const typeValue = isDeadline ? 'deadline' : 'regular';

    taskSheetTitle.textContent = isDeadline ? 'Редактировать дедлайн' : 'Редактировать задачу';
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskDescInput.value = task.description || '';
    taskDeadlineDate.value = task.deadlineDate || '';
    taskDeadlineTime.value = task.deadlineTime || (isDeadline ? '18:00' : '11:40');
    if (taskDeadlineEndTime) {
      taskDeadlineEndTime.value = task.deadlineEndTime || '';
    }
    updateTaskDurationBadge();

    deleteTaskBtn.style.display = 'block';

    const typeRadio = taskForm.querySelector(`input[name="taskType"][value="${typeValue}"]`);
    if (typeRadio) typeRadio.checked = true;
    updateTaskTypeFormUI(typeValue);

    const prioRadio = taskForm.querySelector(`input[name="priority"][value="${task.priority}"]`);
    if (prioRadio) prioRadio.checked = true;

    renderCategoryOptionsInTaskForm(task.categoryId);
    openSheet(taskSheet);
  }

  function renderCategoryOptionsInTaskForm(selectedCatId) {
    const selected = selectedCatId || (categories.length > 0 ? categories[0].id : '');
    let html = '';
    categories.forEach(cat => {
      const isChecked = cat.id === selected;
      html += `
        <label class="category-radio-item">
          <input type="radio" name="taskCategory" value="${cat.id}" ${isChecked ? 'checked' : ''}>
          <div class="category-radio-box">
            <span class="cat-ico">${cat.icon}</span>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 86px;">${escapeHtml(cat.name)}</span>
          </div>
        </label>
      `;
    });
    taskCategoryOptions.innerHTML = html;
  }

  function handleTaskFormSubmit(e) {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    const typeChecked = taskForm.querySelector('input[name="taskType"]:checked');
    const taskType = typeChecked ? typeChecked.value : 'regular';
    const isDeadline = taskType === 'deadline';

    const desc = taskDescInput.value.trim();
    const deadlineDate = taskDeadlineDate.value;
    const deadlineTime = deadlineDate ? (taskDeadlineTime.value || (isDeadline ? '18:00' : '11:40')) : '';
    const deadlineEndTime = (deadlineDate && taskDeadlineEndTime) ? taskDeadlineEndTime.value.trim() : '';
    const prioChecked = taskForm.querySelector('input[name="priority"]:checked');
    const priority = prioChecked ? prioChecked.value : 'medium';
    const catChecked = taskForm.querySelector('input[name="taskCategory"]:checked');
    const categoryId = catChecked ? catChecked.value : (categories[0] ? categories[0].id : 'cat-music');

    if (editingTaskId) {
      window.storageService.updateTask({
        id: editingTaskId,
        title,
        description: desc,
        categoryId,
        taskType,
        isDeadline,
        deadlineDate,
        deadlineTime,
        deadlineEndTime,
        priority
      });
      showToast(isDeadline ? '✨ Дедлайн сохранен' : '✨ Задача сохранена');
    } else {
      const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title,
        description: desc,
        categoryId,
        taskType,
        isDeadline,
        deadlineDate,
        deadlineTime,
        deadlineEndTime,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
      };
      window.storageService.addTask(newTask);
      if (window.soundEffects) window.soundEffects.playTap();
      showToast(isDeadline ? '🔥 Дедлайн добавлен' : '🎵 Задача добавлена');
    }

    closeSheet(taskSheet);
    loadData();
    renderApp();
  }

  function handleDeleteTask() {
    if (!editingTaskId) return;
    if (confirm('Удалить эту задачу?')) {
      window.storageService.deleteTask(editingTaskId);
      showToast('🗑️ Задача удалена');
      closeSheet(taskSheet);
      loadData();
      renderApp();
    }
  }

  // -------------------------------------------------------------
  // Category Management Screen
  // -------------------------------------------------------------
  function renderCategoriesScreen() {
    const systemCats = categories.filter(c => c.isSystem);
    const customCats = categories.filter(c => !c.isSystem);

    customCatCountBadge.textContent = customCats.length;

    // Standard Categories
    let systemHtml = '';
    systemCats.forEach(cat => {
      const catTasks = tasks.filter(t => t.categoryId === cat.id);
      const activeCount = catTasks.filter(t => !t.completed).length;

      systemHtml += `
        <div class="cat-manage-card" data-cat-id="${cat.id}">
          <div class="cat-manage-left">
            <div class="cat-manage-icon">${cat.icon}</div>
            <div>
              <div class="cat-manage-name">${escapeHtml(cat.name)}</div>
              <div class="cat-manage-sub">${activeCount} активных задач</div>
            </div>
          </div>
          <div class="cat-manage-actions">
            <button class="btn-icon-sm" data-edit-cat="${cat.id}" title="Редактировать категорию">✏️</button>
            <span class="system-locked-badge" title="Стандартная категория защищена от удаления">🔒</span>
          </div>
        </div>
      `;
    });
    systemCategoryList.innerHTML = systemHtml;

    // User Categories
    let customHtml = '';
    if (customCats.length === 0) {
      customHtml = `
        <div class="empty-custom-cats-card">
          <div class="empty-custom-cats-icon">✨</div>
          <div style="font-weight: 700; color: var(--espresso-900);">Ваши личные категории</div>
          <div class="empty-custom-cats-text">
            Создайте свои разделы задач, например: <b>🎻 Репетиции</b>, <b>🎸 Гитара</b>, <b>🎤 Вокал</b> или <b>💼 Работа</b>
          </div>
        </div>
      `;
    } else {
      customCats.forEach(cat => {
        const catTasks = tasks.filter(t => t.categoryId === cat.id);
        const activeCount = catTasks.filter(t => !t.completed).length;

        customHtml += `
          <div class="cat-manage-card is-custom-cat" data-cat-id="${cat.id}">
            <div class="cat-manage-left">
              <div class="cat-manage-icon">${cat.icon}</div>
              <div>
                <div class="cat-manage-name">${escapeHtml(cat.name)}</div>
                <div class="cat-manage-sub">${activeCount} активных задач</div>
              </div>
            </div>
            <div class="cat-manage-actions">
              <button class="btn-icon-sm" data-edit-cat="${cat.id}" title="Редактировать категорию">✏️</button>
              <button class="btn-icon-sm danger" data-delete-cat="${cat.id}" title="Удалить категорию">🗑️</button>
            </div>
          </div>
        `;
      });
    }
    customCategoryList.innerHTML = customHtml;

    // Attach listeners
    document.querySelectorAll('[data-edit-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-cat');
        openEditCategoryModal(id);
      });
    });

    document.querySelectorAll('[data-delete-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-cat');
        promptSafeCategoryDeletion(id);
      });
    });
  }

  function initEmojiPicker() {
    let html = '';
    AVAILABLE_EMOJIS.forEach(emoji => {
      html += `
        <button type="button" class="btn-icon-sm cat-emoji-opt" data-emoji="${emoji}">
          ${emoji}
        </button>
      `;
    });
    catEmojiPicker.innerHTML = html;

    catEmojiPicker.querySelectorAll('.cat-emoji-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji');
        catSelectedIcon.value = emoji;
        updateSelectedEmojiUI(emoji);
      });
    });
  }

  function updateSelectedEmojiUI(selectedEmoji) {
    catEmojiPicker.querySelectorAll('.cat-emoji-opt').forEach(btn => {
      if (btn.getAttribute('data-emoji') === selectedEmoji) {
        btn.style.borderColor = 'var(--butter-500)';
        btn.style.background = 'var(--butter-200)';
        btn.style.transform = 'scale(1.12)';
      } else {
        btn.style.borderColor = 'var(--border-color)';
        btn.style.background = '#FFFFFF';
        btn.style.transform = 'scale(1)';
      }
    });
  }

  function openAddCategoryModal() {
    if (window.soundEffects) window.soundEffects.playTap();
    editingCategoryId = null;
    catSheetTitle.textContent = 'Новая категория';
    saveCatBtn.textContent = 'Создать';
    categoryForm.reset();
    catIdInput.value = '';
    catSelectedIcon.value = '🎻';
    updateSelectedEmojiUI('🎻');
    openSheet(categorySheet);
    setTimeout(() => catNameInput.focus(), 300);
  }

  function openEditCategoryModal(id) {
    if (window.soundEffects) window.soundEffects.playTap();
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    editingCategoryId = id;
    catSheetTitle.textContent = 'Редактировать категорию';
    saveCatBtn.textContent = 'Сохранить';
    catIdInput.value = cat.id;
    catNameInput.value = cat.name;
    catSelectedIcon.value = cat.icon || '🎵';
    updateSelectedEmojiUI(catSelectedIcon.value);
    openSheet(categorySheet);
    setTimeout(() => catNameInput.focus(), 300);
  }

  function handleCategoryFormSubmit(e) {
    e.preventDefault();
    const name = catNameInput.value.trim();
    const icon = catSelectedIcon.value || '🎵';
    if (!name) return;

    if (editingCategoryId) {
      window.storageService.updateCategory(editingCategoryId, name, icon);
      showToast('📂 Категория обновлена');
    } else {
      const newCat = {
        id: 'cat_custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name,
        icon,
        isSystem: false
      };
      window.storageService.addCategory(newCat);
      showToast('✨ Категория создана');
    }

    closeSheet(categorySheet);
    loadData();
    renderApp();
  }

  function promptSafeCategoryDeletion(catId) {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    if (cat.isSystem) {
      alert('Стандартные системные категории защищены от удаления.');
      return;
    }

    pendingDeleteCatId = catId;
    deleteCatIconDisplay.textContent = cat.icon;
    deleteCatNameDisplay.textContent = cat.name;

    const catTasks = tasks.filter(t => t.categoryId === catId);
    const count = catTasks.length;

    if (count === 0) {
      deleteCatSheetTitle.textContent = 'Удалить пустую категорию?';
      deleteCatCountDisplay.textContent = 'В этой категории нет задач.';
      migrationOptionBox.style.display = 'none';
      confirmDeleteCatBtn.textContent = 'Удалить категорию';
    } else {
      deleteCatSheetTitle.textContent = `Удалить «${cat.name}»?`;
      deleteCatCountDisplay.textContent = `В этой категории находится ${count} ${getNounPlural(count, 'задача', 'задачи', 'задач')}.`;
      migrationOptionBox.style.display = 'flex';
      confirmDeleteCatBtn.textContent = 'Перенести задачи и удалить';

      const otherCats = categories.filter(c => c.id !== catId);
      let optHtml = '';
      otherCats.forEach(oc => {
        optHtml += `<option value="${oc.id}">${oc.icon} ${escapeHtml(oc.name)}</option>`;
      });
      migrationTargetSelect.innerHTML = optHtml;
    }

    openSheet(deleteCategorySheet);
  }

  function handleConfirmDeleteCategory() {
    if (!pendingDeleteCatId) return;

    const cat = categories.find(c => c.id === pendingDeleteCatId);
    const catTasks = tasks.filter(t => t.categoryId === pendingDeleteCatId);
    const hasTasks = catTasks.length > 0;

    let targetCatId = null;
    let targetCatName = '';

    if (hasTasks) {
      targetCatId = migrationTargetSelect.value;
      const targetCat = categories.find(c => c.id === targetCatId);
      targetCatName = targetCat ? targetCat.name : '';
      if (!targetCatId) {
        alert('Пожалуйста, выберите категорию для переноса задач.');
        return;
      }
    }

    const result = window.storageService.deleteCategory(pendingDeleteCatId, targetCatId);

    if (result.success) {
      closeSheet(deleteCategorySheet);
      pendingDeleteCatId = null;
      loadData();
      renderApp();

      if (hasTasks) {
        showToast(`🗑️ Категория удалена, задачи перенесены в «${targetCatName}»`);
      } else {
        showToast('🗑️ Категория удалена');
      }
    } else {
      alert('Не удалось удалить категорию: ' + result.reason);
    }
  }

  function getNounPlural(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return five;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  }

  // -------------------------------------------------------------
  // Sheet Modal Transitions
  // -------------------------------------------------------------
  function openSheet(sheetElement) {
    modalBackdrop.classList.add('open');
    sheetElement.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet(sheetElement) {
    sheetElement.classList.remove('open');
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAllSheets() {
    closeSheet(taskSheet);
    closeSheet(categorySheet);
    closeSheet(deleteCategorySheet);
    closeSheet(lessonSheet);
  }

  // -------------------------------------------------------------
  // Toast Notifications
  // -------------------------------------------------------------
  let toastTimer = null;
  function showToast(msg) {
    toastMessage.textContent = msg;
    toastBanner.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastBanner.classList.remove('show');
    }, 2500);
  }

  // -------------------------------------------------------------
  // Event Listeners
  // -------------------------------------------------------------
  function initEventListeners() {
    // Navigation items
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        hideCalendarPopover();
        const tabId = item.getAttribute('data-tab');

        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        tabContents.forEach(c => c.classList.remove('active'));
        const activeTab = document.getElementById(tabId);
        if (activeTab) activeTab.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Add Task Button
    navAddTask.addEventListener('click', () => {
      // If currently on calendar teaching mode, offer adding lesson or task
      if (document.getElementById('tab-calendar').classList.contains('active') && uiState.calendarMode === 'teaching') {
        openAddLessonModal(calSelectedDate);
      } else {
        openAddTaskModal();
      }
    });

    // Summary filter pills
    summaryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        summaryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        uiState.currentFilter = pill.getAttribute('data-filter');
        window.storageService.saveUIState({ currentFilter: uiState.currentFilter });
        renderTasksScreen();
      });
    });

    // Search input
    taskSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTasksScreen();
    });

    // View mode toggle
    viewModeCategoriesBtn.addEventListener('click', () => {
      uiState.viewMode = 'categories';
      window.storageService.saveUIState({ viewMode: 'categories' });
      viewModeCategoriesBtn.classList.add('active');
      viewModeFlatBtn.classList.remove('active');
      renderTasksScreen();
    });

    viewModeFlatBtn.addEventListener('click', () => {
      uiState.viewMode = 'flat';
      window.storageService.saveUIState({ viewMode: 'flat' });
      viewModeFlatBtn.classList.add('active');
      viewModeCategoriesBtn.classList.remove('active');
      renderTasksScreen();
    });

    // Dual Calendar Mode Switchers
    btnCalModeTasks.addEventListener('click', () => {
      if (window.soundEffects) window.soundEffects.playTap();
      uiState.calendarMode = 'tasks';
      window.storageService.saveUIState({ calendarMode: 'tasks' });
      btnCalModeTasks.classList.add('active');
      btnCalModeTeaching.classList.remove('active');
      renderDualCalendar();
    });

    btnCalModeTeaching.addEventListener('click', () => {
      if (window.soundEffects) window.soundEffects.playTap();
      uiState.calendarMode = 'teaching';
      window.storageService.saveUIState({ calendarMode: 'teaching' });
      btnCalModeTeaching.classList.add('active');
      btnCalModeTasks.classList.remove('active');
      renderDualCalendar();
    });

    // Calendar Month Navigation
    btnCalPrevMonth.addEventListener('click', () => {
      if (window.soundEffects) window.soundEffects.playTap();
      if (calCurrentMonth === 0) {
        calCurrentMonth = 11;
        calCurrentYear--;
      } else {
        calCurrentMonth--;
      }
      renderDualCalendar();
    });

    btnCalNextMonth.addEventListener('click', () => {
      if (window.soundEffects) window.soundEffects.playTap();
      if (calCurrentMonth === 11) {
        calCurrentMonth = 0;
        calCurrentYear++;
      } else {
        calCurrentMonth++;
      }
      renderDualCalendar();
    });

    btnCalToday.addEventListener('click', () => {
      if (window.soundEffects) window.soundEffects.playTap();
      const today = new Date();
      calCurrentYear = today.getFullYear();
      calCurrentMonth = today.getMonth();
      calSelectedDate = window.storageService.formatDateIso(today);
      uiState.selectedCalendarDate = calSelectedDate;
      window.storageService.saveUIState({ selectedCalendarDate: calSelectedDate });
      renderDualCalendar();
    });

    // Lesson Sheet Events
    closeLessonSheetBtn.addEventListener('click', () => closeSheet(lessonSheet));
    cancelLessonBtn.addEventListener('click', () => closeSheet(lessonSheet));
    lessonForm.addEventListener('submit', handleLessonFormSubmit);
    deleteLessonBtn.addEventListener('click', handleDeleteLesson);

    // Task Sheet Events
    closeTaskSheetBtn.addEventListener('click', () => closeSheet(taskSheet));
    cancelTaskBtn.addEventListener('click', () => closeSheet(taskSheet));
    taskForm.addEventListener('submit', handleTaskFormSubmit);
    deleteTaskBtn.addEventListener('click', handleDeleteTask);

    if (btnClearTaskDate) {
      btnClearTaskDate.addEventListener('click', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        taskDeadlineDate.value = '';
        taskDeadlineTime.value = '';
      });
    }

    taskTypeInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        updateTaskTypeFormUI(input.value);
        if (editingTaskId) {
          taskSheetTitle.textContent = input.value === 'deadline' ? 'Редактировать дедлайн' : 'Редактировать задачу';
        } else {
          taskSheetTitle.textContent = input.value === 'deadline' ? 'Новый дедлайн' : 'Новая задача';
        }
      });
    });

    // Task Duration & Time Listeners
    if (taskDeadlineTime) {
      taskDeadlineTime.addEventListener('input', updateTaskDurationBadge);
      taskDeadlineTime.addEventListener('change', updateTaskDurationBadge);
    }
    if (taskDeadlineEndTime) {
      taskDeadlineEndTime.addEventListener('input', updateTaskDurationBadge);
      taskDeadlineEndTime.addEventListener('change', updateTaskDurationBadge);
    }

    // Quick Duration Chips (+45 мин, +1 час, +1 ч 20 м (пара), +1.5 часа)
    document.querySelectorAll('.btn-quick-dur[data-mins]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        const mins = parseInt(btn.getAttribute('data-mins'), 10);
        let start = taskDeadlineTime.value || '11:40';
        taskDeadlineTime.value = start;
        const sMin = timeToMinutes(start);
        const eMin = (sMin + mins) % (24 * 60);
        if (taskDeadlineEndTime) {
          taskDeadlineEndTime.value = minutesToTime(eMin);
        }
        updateTaskDurationBadge();
      });
    });

    if (btnClearEndTime) {
      btnClearEndTime.addEventListener('click', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        if (taskDeadlineEndTime) taskDeadlineEndTime.value = '';
        updateTaskDurationBadge();
      });
    }

    // Floating Calendar Popover Controls
    if (popoverAddTaskBtn) {
      popoverAddTaskBtn.addEventListener('click', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        hideCalendarPopover();
        openAddTaskModalWithDate(calSelectedDate || window.storageService.formatDateIso(new Date()));
      });
    }

    if (popoverAddLessonBtn) {
      popoverAddLessonBtn.addEventListener('click', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        hideCalendarPopover();
        openAddLessonModal(calSelectedDate || window.storageService.formatDateIso(new Date()));
      });
    }

    if (closePopoverBtn) {
      closePopoverBtn.addEventListener('click', () => {
        if (window.soundEffects) window.soundEffects.playTap();
        hideCalendarPopover();
      });
    }

    if (calendarPopoverBackdrop) {
      calendarPopoverBackdrop.addEventListener('click', hideCalendarPopover);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideCalendarPopover();
      }
    });

    // Category Sheet Events
    openAddCategoryBtn.addEventListener('click', openAddCategoryModal);
    if (openAddCategoryBtnLarge) {
      openAddCategoryBtnLarge.addEventListener('click', openAddCategoryModal);
    }
    closeCatSheetBtn.addEventListener('click', () => closeSheet(categorySheet));
    cancelCatBtn.addEventListener('click', () => closeSheet(categorySheet));
    categoryForm.addEventListener('submit', handleCategoryFormSubmit);

    // Safe Category Deletion Sheet Events
    confirmDeleteCatBtn.addEventListener('click', handleConfirmDeleteCategory);
    cancelDeleteCatBtn.addEventListener('click', () => closeSheet(deleteCategorySheet));
    closeDeleteCatSheetBtn.addEventListener('click', () => closeSheet(deleteCategorySheet));

    // Backdrop Click
    modalBackdrop.addEventListener('click', closeAllSheets);

    // Settings switches
    settingSoundToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      window.storageService.saveSettings({ soundEnabled: enabled });
      if (window.soundEffects) window.soundEffects.setEnabled(enabled);
      showToast(enabled ? '🔔 Звуки включены' : '🔕 Звуки выключены');
    });

    settingHideCompletedToggle.addEventListener('change', (e) => {
      const hide = e.target.checked;
      window.storageService.saveSettings({ hideCompleted: hide });
      settings.hideCompleted = hide;
      renderApp();
    });

    // Backup & Export JSON
    btnExportData.addEventListener('click', () => {
      const dataStr = window.storageService.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `polimona_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('💾 Резервная копия скачана');
    });

    // Import JSON with validation and confirmation
    btnImportDataTrigger.addEventListener('click', () => {
      fileImportInput.click();
    });

    fileImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const proceed = confirm('Импорт заменит текущие задачи, категории и расписание данными из файла. Продолжить?');
      if (!proceed) {
        fileImportInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = window.storageService.importAllData(event.target.result);
        if (result.success) {
          loadData();
          applyStoredStateToUI();
          renderApp();
          showToast(`📥 Восстановлено: ${result.tasksCount} задач, ${result.lessonsCount} уроков`);
        } else {
          alert('Ошибка при импорте файла: ' + result.error);
        }
      };
      reader.readAsText(file);
      fileImportInput.value = '';
    });

    // Reset to defaults
    btnResetData.addEventListener('click', () => {
      if (confirm('Сбросить все задачи, категории и расписание к начальным демонстрационным?')) {
        window.storageService.resetToDefaults();
        loadData();
        initCalendarState();
        applyStoredStateToUI();
        renderApp();
        showToast('🔄 Данные сброшены к начальным');
      }
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
