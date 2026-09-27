/**
 * Polimona Music Planner - Storage Manager
 * Handles LocalStorage persistence, tasks, categories, teaching lessons, backup and restore.
 */

const STORAGE_KEYS = {
  TASKS: 'polimona_tasks_v1',
  CATEGORIES: 'polimona_categories_v1',
  SETTINGS: 'polimona_settings_v1',
  UI_STATE: 'polimona_uistate_v1',
  LESSONS: 'polimona_lessons_v1'
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-music', name: 'Музыка', icon: '🎹', isSystem: true },
  { id: 'cat-performance', name: 'Выступления', icon: '🎤', isSystem: true },
  { id: 'cat-study', name: 'Учёба', icon: '🎼', isSystem: true },
  { id: 'cat-recording', name: 'Записи', icon: '🎧', isSystem: true },
  { id: 'cat-organization', name: 'Организация', icon: '📅', isSystem: true },
  { id: 'cat-personal', name: 'Личное', icon: '📚', isSystem: true }
];

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  hideCompleted: false,
  workStartHour: 10, // 10:00
  workEndHour: 20    // 20:00
};

const DEFAULT_UI_STATE = {
  viewMode: 'categories',       // 'categories' | 'flat'
  currentFilter: 'all',         // 'all' | 'burning' | 'active' | 'completed'
  calendarMode: 'tasks',        // 'tasks' | 'teaching'
  selectedCalendarDate: null,
  collapsedCategories: {}       // { [catId]: boolean }
};

class StorageService {
  constructor() {
    this.initDefaultsIfEmpty();
  }

  initDefaultsIfEmpty() {
    // 1. Categories
    const existingCatsRaw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!existingCatsRaw) {
      this.saveCategories(DEFAULT_CATEGORIES);
    } else {
      try {
        const parsed = JSON.parse(existingCatsRaw);
        let changed = false;
        parsed.forEach(c => {
          if (c.id && c.id.startsWith('cat-') && !c.id.startsWith('cat_') && c.isSystem === undefined) {
            c.isSystem = true;
            changed = true;
          }
        });
        if (changed) {
          this.saveCategories(parsed);
        }
      } catch (e) {
        this.saveCategories(DEFAULT_CATEGORIES);
      }
    }

    // 2. Settings
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.saveSettings(DEFAULT_SETTINGS);
    }

    // 3. UI State
    if (!localStorage.getItem(STORAGE_KEYS.UI_STATE)) {
      this.saveUIState(DEFAULT_UI_STATE);
    }

    // 4. Tasks Seed
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      const now = new Date();
      const todayStr = this.formatDateIso(now);

      const burningDate = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const burningDateStr = this.formatDateIso(burningDate);
      const burningTimeStr = this.formatTimeIso(burningDate);

      const overdueDate = new Date(now.getTime() - 26 * 60 * 60 * 1000);
      const overdueDateStr = this.formatDateIso(overdueDate);
      const overdueTimeStr = this.formatTimeIso(overdueDate);

      const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const futureDateStr = this.formatDateIso(futureDate);

      const nextWeekDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextWeekDateStr = this.formatDateIso(nextWeekDate);

      const sampleTasks = [
        {
          id: 'task-seed-1',
          title: 'Финальный саундчек перед акустическим сетом',
          description: 'Проверить микрофон Shure SM58, отстроить мониторную линию и пресеты реверберации.',
          categoryId: 'cat-performance',
          taskType: 'deadline',
          isDeadline: true,
          deadlineDate: burningDateStr,
          deadlineTime: burningTimeStr,
          priority: 'high',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-seed-2',
          title: 'Сдать нотную партитуру для струнного квартета',
          description: 'Внести правки дирижёра в партию альта и распечатать чистые партии.',
          categoryId: 'cat-study',
          taskType: 'deadline',
          isDeadline: true,
          deadlineDate: overdueDateStr,
          deadlineTime: overdueTimeStr,
          priority: 'high',
          completed: false,
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
          id: 'task-seed-3',
          title: 'Пара: БЖД',
          description: 'Аудитория 204. Зачётные нормативы и конспект.',
          categoryId: 'cat-study',
          taskType: 'regular',
          isDeadline: false,
          deadlineDate: todayStr,
          deadlineTime: '11:40',
          deadlineEndTime: '12:40',
          priority: 'medium',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-seed-4',
          title: 'Пара: Полифония',
          description: 'Аудитория 304. Модуляции в тональности второй степени родства.',
          categoryId: 'cat-study',
          taskType: 'regular',
          isDeadline: false,
          deadlineDate: todayStr,
          deadlineTime: '13:30',
          deadlineEndTime: '15:00',
          priority: 'medium',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-seed-5',
          title: 'Купить новый комплект струн D\'Addario',
          description: 'Зайти в музыкальный магазин после занятий, калибр 11-52.',
          categoryId: 'cat-personal',
          taskType: 'regular',
          isDeadline: false,
          deadlineDate: '',
          deadlineTime: '',
          deadlineEndTime: '',
          priority: 'low',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-seed-6',
          title: 'Замена струн на акустической гитаре',
          description: 'Поставить свежий комплект Elixir 11-52 и обработать накладку лимонным маслом.',
          categoryId: 'cat-personal',
          taskType: 'regular',
          isDeadline: false,
          deadlineDate: overdueDateStr,
          deadlineTime: '12:00',
          deadlineEndTime: '13:00',
          priority: 'low',
          completed: true,
          completedAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
        }
      ];

      this.saveTasks(sampleTasks);
    }

    // 5. Teaching Lessons Seed
    if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) {
      const now = new Date();
      const todayStr = this.formatDateIso(now);

      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowStr = this.formatDateIso(tomorrow);

      const afterTomorrow = new Date(now);
      afterTomorrow.setDate(now.getDate() + 2);
      const afterTomorrowStr = this.formatDateIso(afterTomorrow);

      const sampleLessons = [
        // Today: Lessons matching schedule
        {
          id: 'lesson-seed-1',
          date: todayStr,
          startTime: '12:00',
          endTime: '13:00',
          studentName: 'Руслана 2/4',
          subject: 'Вокал',
          notes: 'Распевка, дыхание, вокальный репертуар',
          status: 'scheduled'
        },
        {
          id: 'lesson-seed-2',
          date: todayStr,
          startTime: '19:00',
          endTime: '20:00',
          studentName: 'Татьяна Высокосова',
          subject: 'Фортепиано',
          notes: 'Чтение нот, блюзовый квадрат, оплата +3200',
          status: 'scheduled'
        },

        // Tomorrow: 5 back-to-back lessons (busy day -> grey!)
        {
          id: 'lesson-seed-3',
          date: tomorrowStr,
          startTime: '11:00',
          endTime: '12:30',
          studentName: 'Елизавета',
          subject: 'Вокал',
          notes: 'Подготовка к вокальному конкурсу',
          status: 'scheduled'
        },
        {
          id: 'lesson-seed-4',
          date: tomorrowStr,
          startTime: '12:30',
          endTime: '14:00',
          studentName: 'Даниил',
          subject: 'Сольфеджио',
          notes: 'Интервалы, диктанты, септаккорды',
          status: 'scheduled'
        },
        {
          id: 'lesson-seed-5',
          date: tomorrowStr,
          startTime: '14:30',
          endTime: '16:00',
          studentName: 'София',
          subject: 'Фортепиано',
          notes: 'Этюды Черни, прелюдия Шопена',
          status: 'scheduled'
        },
        {
          id: 'lesson-seed-6',
          date: tomorrowStr,
          startTime: '16:30',
          endTime: '18:00',
          studentName: 'Иван',
          subject: 'Гитара',
          notes: 'Бой, баррэ, фингерстайл вступление',
          status: 'scheduled'
        },
        {
          id: 'lesson-seed-7',
          date: tomorrowStr,
          startTime: '18:15',
          endTime: '19:45',
          studentName: 'Мария',
          subject: 'Вокал',
          notes: 'Джазовый стандарт Autumn Leaves',
          status: 'scheduled'
        },

        // Day after tomorrow: 1 afternoon lesson (green window!)
        {
          id: 'lesson-seed-8',
          date: afterTomorrowStr,
          startTime: '15:00',
          endTime: '16:30',
          studentName: 'Артём',
          subject: 'Фортепиано',
          notes: 'Чтение с листа, блюзовый квадрат',
          status: 'scheduled'
        }
      ];

      this.saveLessons(sampleLessons);
    }
  }

  formatDateIso(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTimeIso(d) {
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }

  // -----------------------------------------------------------
  // Tasks CRUD
  // -----------------------------------------------------------
  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      let changed = false;
      parsed.forEach(t => {
        if (t.isDeadline === undefined) {
          if (t.taskType === 'deadline') {
            t.isDeadline = true;
          } else if (t.taskType === 'regular') {
            t.isDeadline = false;
          } else {
            // Backward compatibility: If seed-1 or seed-2, treat as deadline, otherwise regular
            if (t.id === 'task-seed-1' || t.id === 'task-seed-2') {
              t.isDeadline = true;
              t.taskType = 'deadline';
            } else {
              t.isDeadline = false;
              t.taskType = 'regular';
            }
          }
          changed = true;
        } else if (!t.taskType) {
          t.taskType = t.isDeadline ? 'deadline' : 'regular';
          changed = true;
        }
      });
      if (changed) {
        this.saveTasks(parsed);
      }
      return parsed;
    } catch (e) {
      console.error('Failed to load tasks', e);
      return [];
    }
  }

  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch (e) {
      console.error('Failed to save tasks', e);
      return false;
    }
  }

  addTask(task) {
    const tasks = this.getTasks();
    tasks.unshift(task);
    this.saveTasks(tasks);
    return task;
  }

  updateTask(updatedTask) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === updatedTask.id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updatedTask };
      this.saveTasks(tasks);
      return tasks[idx];
    }
    return null;
  }

  deleteTask(taskId) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    this.saveTasks(tasks);
    return true;
  }

  toggleTaskCompleted(taskId) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      this.saveTasks(tasks);
      return task;
    }
    return null;
  }

  // -----------------------------------------------------------
  // Teaching Lessons CRUD
  // -----------------------------------------------------------
  getLessons() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LESSONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load lessons', e);
      return [];
    }
  }

  saveLessons(lessons) {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
      return true;
    } catch (e) {
      console.error('Failed to save lessons', e);
      return false;
    }
  }

  addLesson(lesson) {
    const lessons = this.getLessons();
    lessons.push(lesson);
    this.saveLessons(lessons);
    return lesson;
  }

  updateLesson(updatedLesson) {
    const lessons = this.getLessons();
    const idx = lessons.findIndex(l => l.id === updatedLesson.id);
    if (idx !== -1) {
      lessons[idx] = { ...lessons[idx], ...updatedLesson };
      this.saveLessons(lessons);
      return lessons[idx];
    }
    return null;
  }

  deleteLesson(lessonId) {
    let lessons = this.getLessons();
    lessons = lessons.filter(l => l.id !== lessonId);
    this.saveLessons(lessons);
    return true;
  }

  // -----------------------------------------------------------
  // Categories CRUD
  // -----------------------------------------------------------
  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch (e) {
      console.error('Failed to load categories', e);
      return DEFAULT_CATEGORIES;
    }
  }

  saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch (e) {
      console.error('Failed to save categories', e);
      return false;
    }
  }

  addCategory(category) {
    const categories = this.getCategories();
    if (category.isSystem === undefined) {
      category.isSystem = false;
    }
    categories.push(category);
    this.saveCategories(categories);
    return category;
  }

  updateCategory(id, newName, newIcon) {
    const categories = this.getCategories();
    const cat = categories.find(c => c.id === id);
    if (cat) {
      if (newName) cat.name = newName.trim();
      if (newIcon) cat.icon = newIcon.trim();
      this.saveCategories(categories);
      return cat;
    }
    return null;
  }

  deleteCategory(id, targetCategoryId = null) {
    let categories = this.getCategories();
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return { success: false, reason: 'not_found' };

    if (catToDelete.isSystem) {
      return { success: false, reason: 'system_category_protected' };
    }

    const tasks = this.getTasks();
    const tasksInCategory = tasks.filter(t => t.categoryId === id);

    let reassignedCount = 0;
    if (tasksInCategory.length > 0) {
      if (!targetCategoryId) {
        return { success: false, reason: 'requires_target_category', taskCount: tasksInCategory.length };
      }
      tasks.forEach(t => {
        if (t.categoryId === id) {
          t.categoryId = targetCategoryId;
          reassignedCount++;
        }
      });
      this.saveTasks(tasks);
    }

    categories = categories.filter(c => c.id !== id);
    this.saveCategories(categories);

    return { success: true, reassignedCount };
  }

  // -----------------------------------------------------------
  // Settings
  // -----------------------------------------------------------
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save settings', e);
      return DEFAULT_SETTINGS;
    }
  }

  // -----------------------------------------------------------
  // UI State
  // -----------------------------------------------------------
  getUIState() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UI_STATE);
      return data ? { ...DEFAULT_UI_STATE, ...JSON.parse(data) } : DEFAULT_UI_STATE;
    } catch (e) {
      return DEFAULT_UI_STATE;
    }
  }

  saveUIState(state) {
    try {
      const current = this.getUIState();
      const updated = { ...current, ...state };
      localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save UI state', e);
      return DEFAULT_UI_STATE;
    }
  }

  // -----------------------------------------------------------
  // Backup, Export, Validate & Import
  // -----------------------------------------------------------
  exportAllData() {
    return JSON.stringify({
      version: 3,
      appName: 'Polimona To-Do & Teaching Calendar',
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      categories: this.getCategories(),
      lessons: this.getLessons(),
      settings: this.getSettings(),
      uiState: this.getUIState()
    }, null, 2);
  }

  validateImportData(jsonString) {
    try {
      if (!jsonString || typeof jsonString !== 'string') {
        return { valid: false, error: 'Файл пуст или некорректен' };
      }
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Неверный формат JSON-объекта' };
      }

      if (!Array.isArray(parsed.tasks)) {
        return { valid: false, error: 'В файле отсутствует список задач' };
      }
      if (!Array.isArray(parsed.categories)) {
        return { valid: false, error: 'В файле отсутствует список категорий' };
      }

      return { valid: true, data: parsed };
    } catch (e) {
      return { valid: false, error: 'Синтаксическая ошибка в JSON: ' + e.message };
    }
  }

  importAllData(jsonString) {
    const check = this.validateImportData(jsonString);
    if (!check.valid) {
      return { success: false, error: check.error };
    }

    const parsed = check.data;

    const categoriesMap = new Map();
    DEFAULT_CATEGORIES.forEach(sc => categoriesMap.set(sc.id, { ...sc }));
    parsed.categories.forEach(c => {
      categoriesMap.set(c.id, {
        id: c.id,
        name: c.name,
        icon: c.icon || '🎵',
        isSystem: c.isSystem !== undefined ? !!c.isSystem : c.id.startsWith('cat-') && !c.id.startsWith('cat_')
      });
    });

    const finalCategories = Array.from(categoriesMap.values());

    this.saveTasks(parsed.tasks);
    this.saveCategories(finalCategories);

    if (Array.isArray(parsed.lessons)) {
      this.saveLessons(parsed.lessons);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      this.saveSettings(parsed.settings);
    }
    if (parsed.uiState && typeof parsed.uiState === 'object') {
      this.saveUIState(parsed.uiState);
    }

    return {
      success: true,
      tasksCount: parsed.tasks.length,
      categoriesCount: finalCategories.length,
      lessonsCount: Array.isArray(parsed.lessons) ? parsed.lessons.length : 0
    };
  }

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.LESSONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.UI_STATE);
    this.initDefaultsIfEmpty();
  }
}

window.storageService = new StorageService();
