const STORAGE_KEY = "habitTracker";
const THEME_STORAGE_KEY = "habitTheme";
const VIEW_STORAGE_KEY = "habitView";
const ACHIEVEMENTS_STORAGE_KEY = "habitAchievements";
const PROGRESSION_STORAGE_KEY = "habitProgression";
const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const LEVELS = [
  { level: 1, xp: 0, title: "Новичок" },
  { level: 2, xp: 100, title: "Ученик" },
  { level: 3, xp: 300, title: "Практик" },
  { level: 4, xp: 600, title: "Уверенный" },
  { level: 5, xp: 1000, title: "Опытный" },
  { level: 6, xp: 1500, title: "Продвинутый" },
  { level: 7, xp: 2200, title: "Эксперт" },
  { level: 8, xp: 3000, title: "Мастер" },
  { level: 9, xp: 4000, title: "Гуру" },
  { level: 10, xp: 5000, title: "Легенда" },
];
const HABIT_TEMPLATES = [
  { id: "healthy-morning", icon: "🌅", name: "Здоровое утро", habits: [["Зарядка", "sport"], ["Вода", "health"], ["Здоровый завтрак", "health"]] },
  { id: "productivity", icon: "🚀", name: "Продуктивность", habits: [["Планирование", "focus"], ["Работа 2 часа", "focus"], ["Чтение", "reading"]] },
  { id: "sports", icon: "🏃", name: "Спорт", habits: [["Тренировка", "sport"], ["Прогулка", "health"], ["Растяжка", "sport"]] },
  { id: "self-development", icon: "📚", name: "Саморазвитие", habits: [["Медитация", "rest"], ["Учёба", "focus"], ["Дневник", "creative"]] },
];
const ACHIEVEMENTS = [
  { id: "first-habit", icon: "🌱", name: "Первая привычка", description: "Добавьте свою первую привычку.", condition: (state) => state.createdHabits >= 1 },
  { id: "five-habits", icon: "🪴", name: "Пять привычек", description: "Добавьте пять привычек.", condition: (state) => state.createdHabits >= 5 },
  { id: "first-day", icon: "✨", name: "Первый день", description: "Отметьте выполнение привычки в первый раз.", condition: (state) => state.totalCompletions >= 1 },
  { id: "week-streak", icon: "🔥", name: "Неделя силы", description: "Выполняйте одну привычку 7 дней подряд.", condition: () => habits.some((habit) => longestStreak(habit) >= 7) },
  { id: "month-streak", icon: "💪", name: "Месяц дисциплины", description: "Выполняйте одну привычку 30 дней подряд.", condition: () => habits.some((habit) => longestStreak(habit) >= 30) },
  { id: "perfectionist", icon: "💎", name: "Перфекционист", description: "Выполните привычку 7 дней за одну неделю.", condition: () => habits.some((habit) => weekDateKeys().every((date) => habit.completedDates.includes(date))) },
  { id: "multitasker", icon: "⚡", name: "Многозадачный", description: "Выполните три привычки в один день.", condition: () => completedCountsByDate().some((count) => count >= 3) },
  { id: "fifty", icon: "🎯", name: "Полтинник", description: "Наберите 50 отметок выполнения.", condition: (state) => state.totalCompletions >= 50 },
  { id: "hundred", icon: "🏅", name: "Сотка", description: "Наберите 100 отметок выполнения.", condition: (state) => state.totalCompletions >= 100 },
  { id: "year-tracker", icon: "🌟", name: "Год с трекером", description: "Используйте приложение 365 дней.", condition: (state) => daysBetween(state.firstUsedDate, localDateKey(new Date())) >= 365 },
];
const CATEGORIES = [
  {
    id: "health",
    name: "Здоровье",
    description: "Бег, зарядка, вода",
    color: "green",
    icon: "health",
    paths: ["M3 12h4l3-8 4 16 3-8h4"],
  },
  {
    id: "sport",
    name: "Спорт",
    description: "Тренировки, сила",
    color: "amber",
    icon: "sport",
    paths: ["M6.5 6.5 17.5 17.5M4 8l4-4m8 16 4-4M3 12l9-9 9 9-9 9-9-9Z"],
  },
  {
    id: "focus",
    name: "Фокус",
    description: "Работа, учёба",
    color: "cyan",
    icon: "focus",
    paths: ["M12 3v3m0 12v3m9-9h-3M6 12H3m15.4 6.4-2.1-2.1M7.7 7.7 5.6 5.6m12.8 0-2.1 2.1M7.7 16.3l-2.1 2.1", "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"],
  },
  {
    id: "reading",
    name: "Чтение",
    description: "Книги, статьи",
    color: "violet",
    icon: "reading",
    paths: ["M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z", "M4 17.5A2.5 2.5 0 0 1 6.5 15H20", "M8 7h8M8 10h6"],
  },
  {
    id: "creative",
    name: "Творчество",
    description: "Рисование, музыка",
    color: "pink",
    icon: "creative",
    paths: ["m14.5 6.5 3 3M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z", "M12 3v2m0 14v2m9-9h-2M5 12H3"],
  },
  {
    id: "rest",
    name: "Отдых",
    description: "Сон, прогулки",
    color: "yellow",
    icon: "rest",
    paths: ["M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z"],
  },
];
const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]));
const COLOR_BY_ID = new Map(CATEGORIES.map((category) => [category.color, category]));
const habitsList = document.querySelector("#habitsList");
const openHabitDialogButton = document.querySelector("#openHabitDialog");
const habitDialog = document.querySelector("#habitDialog");
const habitForm = document.querySelector("#habitForm");
const habitInput = document.querySelector("#habitInput");
const categoryGrid = document.querySelector("#categoryGrid");
const createHabitButton = document.querySelector("#createHabitButton");
const weeklyGoalInput = document.querySelector("#weeklyGoalInput");
const noteDialog = document.querySelector("#noteDialog");
const templatesDialog = document.querySelector("#templatesDialog");
const templatesButton = document.querySelector("#templatesButton");
const templatesGrid = document.querySelector("#templatesGrid");
const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const noteDialogTitle = document.querySelector("#noteDialogTitle");
const deleteNoteButton = document.querySelector("#deleteNoteButton");
const themeToggle = document.querySelector("#themeToggle");
const exportButton = document.querySelector("#exportButton");
const totalHabitsValue = document.querySelector("#totalHabits");
const completedTodayValue = document.querySelector("#completedToday");
const bestStreakValue = document.querySelector("#bestStreak");
const progressCount = document.querySelector("#progressCount");
const progressTrack = document.querySelector("#progressTrack");
const weeklyComparison = document.querySelector("#weeklyComparison");
const todayWidget = document.querySelector("#todayWidget");
const todayDate = document.querySelector("#todayDate");
const levelWidget = document.querySelector("#levelWidget");
const levelIcon = document.querySelector("#levelIcon");
const levelLabel = document.querySelector("#levelLabel");
const xpLabel = document.querySelector("#xpLabel");
const levelProgress = document.querySelector("#levelProgress");
const weeklyTotal = document.querySelector("#weeklyTotal");
const weeklyBest = document.querySelector("#weeklyBest");
const weeklyBestDetail = document.querySelector("#weeklyBestDetail");
const weeklyMissed = document.querySelector("#weeklyMissed");
const weeklyMissedDetail = document.querySelector("#weeklyMissedDetail");
const monthNavigation = document.querySelector("#monthNavigation");
const monthTitle = document.querySelector("#monthTitle");
const achievementsButton = document.querySelector("#achievementsButton");
const achievementsGrid = document.querySelector("#achievementsGrid");
const achievementCount = document.querySelector("#achievementCount");
const achievementToast = document.querySelector("#achievementToast");
const exitingCards = new Set();
const closingTimers = new Map();
let selectedCategoryId = null;
let activeNote = null;
let needsHabitsMigration = false;
let habitView = loadHabitView();
let viewedMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let achievementState = loadAchievementState();
let toastQueue = [];
let toastIsActive = false;
let progressionState = loadProgressionState();
let todayUpdateTimer = null;

function loadHabitView() {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === "month" ? "month" : "week";
  } catch (error) {
    console.error("Не удалось прочитать режим календаря из localStorage.", error);
    return "week";
  }
}

function loadAchievementState() {
  const today = localDateKey(new Date());

  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};

    return {
      unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked.filter((id) => ACHIEVEMENTS.some((item) => item.id === id)) : [],
      createdHabits: Number.isInteger(parsed.createdHabits) && parsed.createdHabits >= 0 ? parsed.createdHabits : 0,
      firstUsedDate: isDateKey(parsed.firstUsedDate) ? parsed.firstUsedDate : today,
      totalCompletions: Number.isInteger(parsed.totalCompletions) && parsed.totalCompletions >= 0 ? parsed.totalCompletions : 0,
    };
  } catch (error) {
    console.error("Не удалось прочитать достижения из localStorage.", error);
    return { unlocked: [], createdHabits: 0, firstUsedDate: today, totalCompletions: 0 };
  }
}

function loadProgressionState() {
  try {
    const stored = localStorage.getItem(PROGRESSION_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      xp: Number.isInteger(parsed.xp) && parsed.xp >= 0 ? parsed.xp : 0,
      rewardedCompletions: Array.isArray(parsed.rewardedCompletions)
        ? parsed.rewardedCompletions.filter((key) => typeof key === "string")
        : [],
      rewardedGoals: Array.isArray(parsed.rewardedGoals)
        ? parsed.rewardedGoals.filter((key) => typeof key === "string")
        : [],
    };
  } catch (error) {
    console.error("Не удалось прочитать опыт из localStorage.", error);
    return { xp: 0, rewardedCompletions: [], rewardedGoals: [] };
  }
}

function saveHabitView() {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, habitView);
  } catch (error) {
    console.error("Не удалось сохранить режим календаря в localStorage.", error);
  }
}

function saveProgressionState() {
  try {
    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progressionState));
  } catch (error) {
    console.error("Не удалось сохранить опыт в localStorage.", error);
  }
}

function saveAchievementState() {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievementState));
  } catch (error) {
    console.error("Не удалось сохранить достижения в localStorage.", error);
  }
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function weekDateKey(dayIndex) {
  const date = new Date();
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset + dayIndex);
  return localDateKey(date);
}

function shiftDateKey(dateKey, amount) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

function daysBetween(firstDate, secondDate) {
  const [firstYear, firstMonth, firstDay] = firstDate.split("-").map(Number);
  const [secondYear, secondMonth, secondDay] = secondDate.split("-").map(Number);
  const first = Date.UTC(firstYear, firstMonth - 1, firstDay);
  const second = Date.UTC(secondYear, secondMonth - 1, secondDay);
  return Math.floor((second - first) / 86400000);
}

function weekDateKeys() {
  return DAYS_OF_WEEK.map((_, index) => weekDateKey(index));
}

function startOfWeek(dateKey, weekOffset = 0) {
  const date = new Date(`${dateKey}T12:00:00`);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset + weekOffset * 7);
  return localDateKey(date);
}

function countForWeek(habit, weekStart) {
  return DAYS_OF_WEEK.reduce((count, _, index) => (
    count + (habit.completedDates.includes(shiftDateKey(weekStart, index)) ? 1 : 0)
  ), 0);
}

function monthDateKeys(date = viewedMonth) {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => (
    localDateKey(new Date(date.getFullYear(), date.getMonth(), index + 1))
  ));
}

function totalCompletions() {
  return habits.reduce((total, habit) => total + new Set(habit.completedDates).size, 0);
}

function completedCountsByDate() {
  const counts = new Map();
  habits.forEach((habit) => {
    new Set(habit.completedDates).forEach((date) => {
      counts.set(date, (counts.get(date) || 0) + 1);
    });
  });
  return [...counts.values()];
}

function isDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function loadHabits() {
  try {
    const storedHabits = localStorage.getItem(STORAGE_KEY);

    if (storedHabits === null) {
      return [];
    }

    const parsedHabits = JSON.parse(storedHabits);

    if (!Array.isArray(parsedHabits)) {
      throw new TypeError("Сохранённые привычки должны быть массивом.");
    }

    const validHabits = parsedHabits.filter((habit) => (
      habit
      && typeof habit.id === "string"
      && typeof habit.name === "string"
      && Array.isArray(habit.days)
    ));

    needsHabitsMigration = validHabits.length !== parsedHabits.length;

    return validHabits.map((habit, index) => {
      const category = CATEGORY_BY_ID.has(habit.category)
        ? CATEGORY_BY_ID.get(habit.category)
        : COLOR_BY_ID.get(habit.color) || CATEGORIES[index % CATEGORIES.length];
      const days = Array.from({ length: DAYS_OF_WEEK.length }, (_, dayIndex) => habit.days[dayIndex] === true);
      const completedDates = new Set(
        Array.isArray(habit.completedDates)
          ? habit.completedDates.filter(isDateKey)
          : [],
      );
      const notes = habit.notes && typeof habit.notes === "object" && !Array.isArray(habit.notes)
        ? Object.fromEntries(
          Object.entries(habit.notes)
            .filter(([date, note]) => isDateKey(date) && typeof note === "string" && note.trim()),
        )
        : {};
      const weeklyGoal = Number.isInteger(habit.weeklyGoal) && habit.weeklyGoal >= 1 && habit.weeklyGoal <= 7
        ? habit.weeklyGoal
        : 7;

      days.forEach((isDone, dayIndex) => {
        const date = weekDateKey(dayIndex);

        if (isDone && !completedDates.has(date)) {
          completedDates.add(date);
          needsHabitsMigration = true;
        }
      });

      const currentWeekDays = DAYS_OF_WEEK.map((_, dayIndex) => completedDates.has(weekDateKey(dayIndex)));

      if (currentWeekDays.some((isDone, dayIndex) => isDone !== days[dayIndex])) {
        needsHabitsMigration = true;
      }

      if (
        habit.category !== category.id
        || habit.color !== category.color
        || habit.icon !== category.icon
        || !Array.isArray(habit.completedDates)
        || !habit.notes
        || habit.weeklyGoal !== weeklyGoal
      ) {
        needsHabitsMigration = true;
      }

      return {
        id: habit.id,
        name: habit.name,
        days: currentWeekDays,
        category: category.id,
        color: category.color,
        icon: category.icon,
        completedDates: [...completedDates].sort(),
        notes,
        weeklyGoal,
      };
    });
  } catch (error) {
    console.error("Не удалось прочитать привычки из localStorage.", error);
    return [];
  }
}

let habits = loadHabits();

function saveHabits() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("Не удалось сохранить привычки в localStorage.", error);
  }
}

if (needsHabitsMigration) {
  saveHabits();
}

function createSvg(paths, className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");

  if (className) {
    svg.setAttribute("class", className);
  }

  paths.forEach((pathData) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
  });

  return svg;
}

function renderCategoryOptions() {
  CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category-option";
    button.type = "button";
    button.dataset.category = category.id;
    button.setAttribute("aria-pressed", "false");

    const icon = document.createElement("span");
    icon.className = "category-option__icon";
    icon.append(createSvg(category.paths));

    const name = document.createElement("span");
    name.className = "category-option__name";
    name.textContent = category.name;

    const description = document.createElement("span");
    description.className = "category-option__description";
    description.textContent = category.description;

    button.append(icon, name, description);
    categoryGrid.append(button);
  });
}

function renderTemplateOptions() {
  HABIT_TEMPLATES.forEach((template) => {
    const button = document.createElement("button");
    button.className = "habit-template";
    button.type = "button";
    button.dataset.templateId = template.id;

    const icon = document.createElement("span");
    icon.className = "habit-template__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = template.icon;

    const name = document.createElement("span");
    name.className = "habit-template__name";
    name.textContent = template.name;

    const list = document.createElement("span");
    list.className = "habit-template__list";
    list.textContent = template.habits.map(([habitName]) => habitName).join(" · ");

    button.append(icon, name, list);
    templatesGrid.append(button);
  });
}

function addHabitTemplate(templateId) {
  const template = HABIT_TEMPLATES.find((item) => item.id === templateId);

  if (!template) {
    return;
  }

  const existingNames = new Set(habits.map((habit) => habit.name.trim().toLocaleLowerCase("ru-RU")));
  const addedHabits = template.habits.reduce((added, [name, categoryId]) => {
    const normalizedName = name.toLocaleLowerCase("ru-RU");
    if (existingNames.has(normalizedName)) {
      return added;
    }

    const habit = createHabit(name, categoryId, 7);
    if (habit) {
      existingNames.add(normalizedName);
      habits.push(habit);
      added.push(habit);
    }
    return added;
  }, []);

  if (addedHabits.length === 0) {
    closeModal(templatesDialog);
    showNotification("Все привычки из этого набора уже добавлены.");
    return;
  }

  achievementState.createdHabits += addedHabits.length;
  saveHabits();
  saveAchievementState();
  renderHabits({ staggeredHabitIds: addedHabits.map((habit) => habit.id) });
  evaluateAchievements();
  closeModal(templatesDialog);
}

function updateThemeIcon(theme) {
  const iconPaths = theme === "dark"
    ? ["M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z"]
    : ["M12 3v2m0 14v2m9-9h-2M5 12H3m15.4 6.4-1.4-1.4M7 7 5.6 5.6m12.8 0L17 7M7 17l-1.4 1.4", "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"];

  themeToggle.replaceChildren(createSvg(iconPaths));
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Переключить на светлую тему" : "Переключить на тёмную тему",
  );
  themeToggle.title = theme === "dark" ? "Светлая тема" : "Тёмная тема";
}

function applyTheme(theme, persist = true) {
  const selectedTheme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = selectedTheme;
  updateThemeIcon(selectedTheme);

  if (!persist) {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
  } catch (error) {
    console.error("Не удалось сохранить тему в localStorage.", error);
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch (error) {
    console.error("Не удалось прочитать тему из localStorage.", error);
    return "dark";
  }
}

function habitCurrentStreak(habit) {
  const completed = new Set(habit.completedDates);
  const today = localDateKey(new Date());
  let date = completed.has(today) ? today : shiftDateKey(today, -1);
  let streak = 0;

  while (completed.has(date)) {
    streak += 1;
    date = shiftDateKey(date, -1);
  }

  return streak;
}

function longestStreak(habit) {
  const today = localDateKey(new Date());
  const dates = [...new Set(habit.completedDates)]
    .filter((date) => date <= today)
    .sort();
  let longest = 0;
  let current = 0;
  let previousDate = null;

  dates.forEach((date) => {
    current = previousDate && shiftDateKey(previousDate, 1) === date ? current + 1 : 1;
    longest = Math.max(longest, current);
    previousDate = date;
  });

  return longest;
}

function weeklyCount(habit) {
  return habit.days.filter(Boolean).length;
}

function monthCount(habit, date = viewedMonth) {
  const dates = new Set(monthDateKeys(date));
  return habit.completedDates.filter((completedDate) => dates.has(completedDate)).length;
}

function habitPeriodCount(habit) {
  return habitView === "month" ? monthCount(habit) : weeklyCount(habit);
}

function habitPeriodLength() {
  return habitView === "month" ? monthDateKeys().length : DAYS_OF_WEEK.length;
}

function russianCount(value, singular, paucal, plural) {
  const remainder100 = value % 100;
  const remainder10 = value % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return `${value} ${plural}`;
  }

  if (remainder10 === 1) {
    return `${value} ${singular}`;
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return `${value} ${paucal}`;
  }

  return `${value} ${plural}`;
}

function updateWeeklyStats() {
  const completedThisWeek = habits.reduce((total, habit) => total + weeklyCount(habit), 0);
  weeklyTotal.textContent = russianCount(completedThisWeek, "раз", "раза", "раз");

  if (habits.length === 0) {
    weeklyBest.textContent = "—";
    weeklyBestDetail.textContent = "пока нет отметок";
    weeklyMissed.textContent = "—";
    weeklyMissedDetail.textContent = "пока нет привычек";
    return;
  }

  const rankedHabits = [...habits].sort((first, second) => weeklyCount(second) - weeklyCount(first));
  const best = rankedHabits[0];
  const mostMissed = rankedHabits[rankedHabits.length - 1];
  weeklyBest.textContent = best.name;
  weeklyBestDetail.textContent = `${weeklyCount(best)} / 7`;
  weeklyMissed.textContent = mostMissed.name;
  weeklyMissedDetail.textContent = `${weeklyCount(mostMissed)} / 7`;
}

function updateDashboard(animate = false) {
  const today = localDateKey(new Date());
  const completedToday = habits.filter((habit) => habit.completedDates.includes(today)).length;
  const bestStreak = habits.reduce((longest, habit) => Math.max(longest, longestStreak(habit)), 0);

  setDashboardValue(totalHabitsValue, String(habits.length), animate);
  setDashboardValue(completedTodayValue, String(completedToday), animate);
  setDashboardValue(bestStreakValue, String(bestStreak), animate);
  progressCount.textContent = `${completedToday} из ${habits.length}`;

  progressTrack.max = Math.max(habits.length, 1);
  progressTrack.value = completedToday;
  updateWeeklyComparison();
  updateWeeklyStats();
}

function updateWeeklyComparison() {
  const currentWeek = startOfWeek(localDateKey(new Date()));
  const previousWeek = shiftDateKey(currentWeek, -7);
  const possibleCompletions = habits.length * DAYS_OF_WEEK.length;
  const currentCompletions = habits.reduce((total, habit) => total + countForWeek(habit, currentWeek), 0);
  const previousCompletions = habits.reduce((total, habit) => total + countForWeek(habit, previousWeek), 0);
  const currentRate = possibleCompletions ? currentCompletions / possibleCompletions * 100 : 0;
  const previousRate = possibleCompletions ? previousCompletions / possibleCompletions * 100 : 0;

  weeklyComparison.classList.remove("is-better", "is-worse", "is-same");

  if (currentRate === previousRate) {
    weeklyComparison.textContent = "= На том же уровне";
    weeklyComparison.classList.add("is-same");
    return;
  }

  const difference = previousRate === 0
    ? 100
    : Math.max(1, Math.round(Math.abs(currentRate - previousRate) / previousRate * 100));

  if (currentRate > previousRate) {
    weeklyComparison.textContent = `📈 +${difference}% к прошлой неделе`;
    weeklyComparison.classList.add("is-better");
  } else {
    weeklyComparison.textContent = `📉 −${difference}% к прошлой неделе`;
    weeklyComparison.classList.add("is-worse");
  }
}

function getLevelForXP(xp) {
  return [...LEVELS].reverse().find((level) => xp >= level.xp) || LEVELS[0];
}

function updateLevelWidget() {
  const currentLevel = getLevelForXP(progressionState.xp);
  const nextLevel = LEVELS[currentLevel.level] || null;
  const xpIntoLevel = progressionState.xp - currentLevel.xp;
  const xpToNextLevel = nextLevel ? nextLevel.xp - currentLevel.xp : 1;
  const progress = nextLevel ? Math.min(100, xpIntoLevel / xpToNextLevel * 100) : 100;

  levelLabel.textContent = `Уровень ${currentLevel.level} · ${currentLevel.title}`;
  xpLabel.textContent = `${progressionState.xp} XP`;
  levelProgress.max = 100;
  levelProgress.value = progress;
  levelWidget.title = nextLevel
    ? `${progressionState.xp} XP · ещё ${nextLevel.xp - progressionState.xp} XP до уровня ${nextLevel.level}`
    : `${progressionState.xp} XP · максимальный уровень`;
}

function awardExperience(amount) {
  const previousLevel = getLevelForXP(progressionState.xp);
  progressionState.xp += amount;
  saveProgressionState();
  updateLevelWidget();

  const newLevel = getLevelForXP(progressionState.xp);
  if (newLevel.level > previousLevel.level) {
    showNotification(`🏅 Новый уровень: ${newLevel.title}!`);
    levelWidget.classList.remove("is-leveling-up");
    void levelWidget.offsetWidth;
    levelWidget.classList.add("is-leveling-up");
    levelIcon.addEventListener("animationend", () => levelWidget.classList.remove("is-leveling-up"), { once: true });
  }
}

function updateTodayWidget() {
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const date = `${dateLabel.charAt(0).toLocaleUpperCase("ru-RU")}${dateLabel.slice(1)}`;
  todayDate.textContent = date;
  todayWidget.title = date;

  window.clearTimeout(todayUpdateTimer);
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  todayUpdateTimer = window.setTimeout(() => {
    updateTodayWidget();
    renderHabits();
  }, nextDay.getTime() - now.getTime());
}

function setDashboardValue(element, value, animate) {
  if (element.textContent === value) {
    return;
  }

  element.textContent = value;

  if (!animate) {
    return;
  }

  element.classList.remove("is-updating");
  void element.offsetWidth;
  element.classList.add("is-updating");
  element.addEventListener("animationend", () => {
    element.classList.remove("is-updating");
  }, { once: true });
}

function openModal(dialog, initialFocus) {
  const timer = closingTimers.get(dialog);

  if (timer) {
    window.clearTimeout(timer);
    closingTimers.delete(dialog);
  }

  dialog.classList.remove("is-closing");

  if (!dialog.open) {
    dialog.showModal();
  }

  if (initialFocus) {
    window.requestAnimationFrame(() => initialFocus.focus());
  }
}

function closeModal(dialog) {
  if (!dialog.open || dialog.classList.contains("is-closing")) {
    return;
  }

  dialog.classList.add("is-closing");
  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
  const timer = window.setTimeout(() => {
    if (dialog.open) {
      dialog.close();
    }

    dialog.classList.remove("is-closing");
    closingTimers.delete(dialog);

    if (dialog === habitDialog) {
      openHabitDialogButton.focus();
    } else if (dialog === templatesDialog) {
      templatesButton.focus();
    } else if (activeNote) {
      habitsList.querySelector(
        `[data-action="toggle-day"][data-habit-id="${CSS.escape(activeNote.habitId)}"][data-date="${activeNote.date}"]`,
      )?.focus();
    }
  }, delay);

  closingTimers.set(dialog, timer);
}

function createHabit(name, categoryId, weeklyGoal = 7) {
  const normalizedName = name.trim();
  const category = CATEGORY_BY_ID.get(categoryId);

  if (!normalizedName || !category) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    name: normalizedName,
    days: Array(DAYS_OF_WEEK.length).fill(false),
    category: category.id,
    color: category.color,
    icon: category.icon,
    completedDates: [],
    notes: {},
    weeklyGoal,
  };
}

function addHabit(name, categoryId, weeklyGoal = 7) {
  const habit = createHabit(name, categoryId, weeklyGoal);

  if (!habit) {
    return false;
  }

  habits.push(habit);
  achievementState.createdHabits += 1;
  saveHabits();
  saveAchievementState();
  renderHabits({ animatedHabitId: habit.id, animateDashboard: true });
  evaluateAchievements();
  return true;
}

function toggleDate(habitId, date) {
  const habit = habits.find((item) => item.id === habitId);

  if (!habit || !isDateKey(date)) {
    return;
  }

  const completedDates = new Set(habit.completedDates);
  const isDone = !completedDates.has(date);

  if (isDone) {
    completedDates.add(date);
    achievementState.totalCompletions += 1;
    awardCompletionExperience(habit, date);
  } else {
    completedDates.delete(date);
  }

  habit.completedDates = [...completedDates].sort();
  weekDateKeys().forEach((weekDate, index) => {
    habit.days[index] = completedDates.has(weekDate);
  });
  saveHabits();
  saveAchievementState();
  updateHabitCard(habit, date);
  updateDashboard();
  awardWeeklyGoalIfReached(habit);
  evaluateAchievements();
}

function awardCompletionExperience(habit, date) {
  const rewardKey = `${habit.id}:${date}`;
  if (progressionState.rewardedCompletions.includes(rewardKey)) {
    return;
  }

  progressionState.rewardedCompletions.push(rewardKey);
  saveProgressionState();
  awardExperience(10);
}

function awardWeeklyGoalIfReached(habit) {
  const weekStart = startOfWeek(localDateKey(new Date()));
  const rewardKey = `${habit.id}:${weekStart}`;
  const count = countForWeek(habit, weekStart);

  if (count < habit.weeklyGoal || progressionState.rewardedGoals.includes(rewardKey)) {
    return;
  }

  progressionState.rewardedGoals.push(rewardKey);
  saveProgressionState();
  awardExperience(100);
}

function deleteHabit(habitId, card) {
  habits = habits.filter((habit) => habit.id !== habitId);
  saveHabits();
  card.classList.add("is-exiting");
  card.setAttribute("aria-hidden", "true");
  exitingCards.add(card);
  renderHabits({ animateDashboard: true });

  const removalDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;

  window.setTimeout(() => {
    exitingCards.delete(card);
    card.remove();

    if (habits.length === 0) {
      renderHabits();
    }
  }, removalDelay);
}

function openNoteDialog(habitId, date) {
  const habit = habits.find((item) => item.id === habitId);

  if (!habit || !isDateKey(date)) {
    return;
  }

  activeNote = { habitId, date };
  noteDialogTitle.textContent = `${formatDateLabel(date)} · ${habit.name}`;
  noteInput.value = habit.notes[date] || "";
  deleteNoteButton.hidden = !habit.notes[date];
  openModal(noteDialog, noteInput);
}

function saveNote(note) {
  if (!activeNote) {
    return;
  }

  const habit = habits.find((item) => item.id === activeNote.habitId);

  if (!habit) {
    activeNote = null;
    return;
  }

  const normalizedNote = note.trim();

  if (normalizedNote) {
    habit.notes[activeNote.date] = normalizedNote;
  } else {
    delete habit.notes[activeNote.date];
  }

  saveHabits();
  const focusTarget = activeNote;
  updateHabitDateNote(habit, focusTarget.date);
  closeModal(noteDialog);
  activeNote = focusTarget;
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`));
}

function createDayButton(habit, date, labelText, dayIndex = null) {
  const button = document.createElement("button");
  const isDone = habit.completedDates.includes(date);
  const note = habit.notes[date] || "";
  const today = date === localDateKey(new Date());

  button.className = isDone ? "habit-day done" : "habit-day";
  button.classList.toggle("is-today", today);

  button.type = "button";
  button.dataset.action = "toggle-day";
  button.dataset.habitId = habit.id;
  button.dataset.date = date;
  if (dayIndex !== null) {
    button.dataset.dayIndex = String(dayIndex);
  }
  button.dataset.hasNote = String(Boolean(note));
  button.title = note ? `${formatDateLabel(date)}: ${note} (правый клик — изменить)` : `${formatDateLabel(date)} (правый клик — добавить заметку)`;
  button.setAttribute("aria-pressed", String(isDone));
  button.setAttribute(
    "aria-label",
    `${labelText}: ${habit.name}, ${isDone ? "выполнено" : "не выполнено"}${note ? `, заметка: ${note}` : ""}`,
  );

  const square = document.createElement("span");
  square.className = "habit-day__square";
  square.setAttribute("aria-hidden", "true");
  square.append(createSvg(["m5 12 4 4L19 6"]));

  const label = document.createElement("span");
  label.textContent = labelText;

  button.append(square, label);
  return button;
}

function createProgressRing(percent) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "habit-card__ring");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Выполнено ${percent}% за неделю`);

  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("class", "habit-card__ring-track");
  track.setAttribute("cx", "12");
  track.setAttribute("cy", "12");
  track.setAttribute("r", "10");

  const progress = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  progress.setAttribute("class", "habit-card__ring-progress");
  progress.setAttribute("cx", "12");
  progress.setAttribute("cy", "12");
  progress.setAttribute("r", "10");
  progress.setAttribute("stroke-dasharray", "62.83");
  progress.setAttribute("stroke-dashoffset", String(62.83 * (1 - percent / 100)));

  svg.append(track, progress);
  return svg;
}

function createAchievement(description) {
  const badge = document.createElement("span");
  badge.className = "achievement-badge";
  badge.textContent = "🏆";
  badge.title = description;
  badge.setAttribute("aria-label", description);
  return badge;
}

function createHabitCard(habit, options) {
  const card = document.createElement("article");
  card.className = "habit-card";
  card.dataset.color = habit.color;
  card.dataset.habitId = habit.id;

  const staggerIndex = options.staggeredHabitIds?.indexOf(habit.id) ?? -1;
  if (staggerIndex >= 0) {
    card.classList.add("is-pending-entry");
    const staggerDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : staggerIndex * 100;
    window.setTimeout(() => {
      if (!card.isConnected) {
        return;
      }
      card.classList.remove("is-pending-entry");
      card.classList.add("is-entering");
    }, staggerDelay);
    card.addEventListener("animationend", () => card.classList.remove("is-entering"), { once: true });
  } else if (options.animatedHabitId === habit.id) {
    card.classList.add("is-entering");
    card.addEventListener("animationend", () => {
      card.classList.remove("is-entering");
    }, { once: true });
  }

  const header = document.createElement("div");
  header.className = "habit-card__header";

  const identity = document.createElement("div");
  identity.className = "habit-card__identity";

  const icon = document.createElement("span");
  icon.className = "habit-card__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.append(createSvg(CATEGORY_BY_ID.get(habit.category)?.paths || CATEGORIES[0].paths));

  const name = document.createElement("h2");
  name.className = "habit-card__name";
  name.textContent = habit.name;
  identity.append(icon, name);

  const actions = document.createElement("div");
  actions.className = "habit-card__actions";

  const count = document.createElement("span");
  count.className = "habit-card__count";
  count.textContent = `${habitPeriodCount(habit)} / ${habitPeriodLength()}`;

  const achievementBadges = document.createElement("span");
  achievementBadges.className = "habit-card__achievements";
  if (longestStreak(habit) >= 7) {
    achievementBadges.append(createAchievement("7 дней подряд без пропусков"));
  }
  if (habit.completedDates.length >= 30) {
    achievementBadges.append(createAchievement("30 выполнений всего"));
  }

  const deleteButton = document.createElement("button");
  deleteButton.className = "habit-card__delete";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete-habit";
  deleteButton.dataset.habitId = habit.id;
  deleteButton.setAttribute("aria-label", `Удалить привычку «${habit.name}»`);
  deleteButton.append(createSvg(["m7 7 10 10M17 7 7 17"]));

  actions.append(count, achievementBadges, deleteButton);
  header.append(identity, actions);

  const insights = document.createElement("div");
  insights.className = "habit-card__insights";

  const streak = document.createElement("span");
  streak.className = "habit-card__streak";
  const currentStreak = habitCurrentStreak(habit);
  streak.textContent = `🔥 ${russianCount(currentStreak, "день", "дня", "дней")} подряд`;

  const percent = Math.round((habitPeriodCount(habit) / habitPeriodLength()) * 100);
  const weeklyProgress = document.createElement("span");
  weeklyProgress.className = "habit-card__weekly";
  const progressRing = createProgressRing(percent);
  progressRing.setAttribute("aria-label", `Выполнено ${percent}% ${habitView === "month" ? "за месяц" : "за неделю"}`);
  weeklyProgress.append(progressRing);
  const percentLabel = document.createElement("span");
  percentLabel.textContent = `${percent}% ${habitView === "month" ? "за месяц" : "за неделю"}`;
  weeklyProgress.append(percentLabel);
  insights.append(streak, weeklyProgress);

  const days = document.createElement("div");
  days.className = "habit-card__days";
  days.setAttribute("aria-label", habitView === "month" ? "Дни месяца" : "Дни недели");
  if (options.animateCalendar) {
    days.classList.add("is-changing");
    days.addEventListener("animationend", () => days.classList.remove("is-changing"), { once: true });
  }

  if (habitView === "month") {
    createMonthCalendar(habit).forEach((day) => days.append(day));
    days.classList.add("habit-card__days--month");
  } else {
    weekDateKeys().forEach((date, index) => {
      days.append(createDayButton(habit, date, DAYS_OF_WEEK[index], index));
    });
  }

  const goalCount = countForWeek(habit, startOfWeek(localDateKey(new Date())));
  const goalComplete = goalCount >= habit.weeklyGoal;
  const goal = document.createElement("div");
  goal.className = `habit-card__goal${goalComplete ? " is-complete" : ""}`;

  const goalLabel = document.createElement("span");
  goalLabel.className = "habit-card__goal-label";
  goalLabel.textContent = `${goalComplete ? "✓ Цель выполнена" : "Выполнено"}: ${goalCount} / ${habit.weeklyGoal}`;

  const goalProgress = document.createElement("progress");
  goalProgress.className = "habit-card__goal-progress";
  goalProgress.max = habit.weeklyGoal;
  goalProgress.value = Math.min(goalCount, habit.weeklyGoal);
  goalProgress.setAttribute("aria-label", `Цель на неделю: ${goalCount} из ${habit.weeklyGoal}`);
  goal.append(goalLabel, goalProgress);

  card.append(header, insights, days, goal);
  return card;
}

function createMonthCalendar(habit) {
  const dates = monthDateKeys();
  const startOffset = (viewedMonth.getDay() + 6) % 7;
  const elements = Array.from({ length: startOffset }, () => {
    const blank = document.createElement("span");
    blank.className = "habit-day__placeholder";
    blank.setAttribute("aria-hidden", "true");
    return blank;
  });

  dates.forEach((date) => {
    elements.push(createDayButton(habit, date, String(Number(date.slice(-2)))));
  });

  return elements;
}

function updateHabitCard(habit, date) {
  const card = habitsList.querySelector(`.habit-card[data-habit-id="${CSS.escape(habit.id)}"]`);

  if (!card) {
    return;
  }

  const dayButton = card.querySelector(`[data-date="${date}"]`);
  if (!dayButton) {
    return;
  }

  const isDone = habit.completedDates.includes(date);
  const note = habit.notes[date] || "";

  dayButton.classList.toggle("done", isDone);
  dayButton.setAttribute("aria-pressed", String(isDone));
  dayButton.setAttribute(
    "aria-label",
    `${formatDateLabel(date)}: ${habit.name}, ${isDone ? "выполнено" : "не выполнено"}${note ? `, заметка: ${note}` : ""}`,
  );
  dayButton.title = note
    ? `${formatDateLabel(date)}: ${note} (правый клик — изменить)`
    : `${formatDateLabel(date)} (правый клик — добавить заметку)`;

  const square = dayButton.querySelector(".habit-day__square");
  square.classList.remove("is-pulsing");
  void square.offsetWidth;
  square.classList.add("is-pulsing");
  square.addEventListener("animationend", () => {
    square.classList.remove("is-pulsing");
  }, { once: true });

  const count = card.querySelector(".habit-card__count");
  count.textContent = `${habitPeriodCount(habit)} / ${habitPeriodLength()}`;

  const currentStreak = habitCurrentStreak(habit);
  card.querySelector(".habit-card__streak").textContent = `🔥 ${russianCount(currentStreak, "день", "дня", "дней")} подряд`;

  const percent = Math.round((habitPeriodCount(habit) / habitPeriodLength()) * 100);
  const ring = card.querySelector(".habit-card__ring");
  ring.setAttribute("aria-label", `Выполнено ${percent}% ${habitView === "month" ? "за месяц" : "за неделю"}`);
  ring.querySelector(".habit-card__ring-progress").setAttribute(
    "stroke-dashoffset",
    String(62.83 * (1 - percent / 100)),
  );
  card.querySelector(".habit-card__weekly span").textContent = `${percent}% ${habitView === "month" ? "за месяц" : "за неделю"}`;

  const goalCount = countForWeek(habit, startOfWeek(localDateKey(new Date())));
  const goalComplete = goalCount >= habit.weeklyGoal;
  const goal = card.querySelector(".habit-card__goal");
  goal.classList.toggle("is-complete", goalComplete);
  goal.querySelector(".habit-card__goal-label").textContent = `${goalComplete ? "✓ Цель выполнена" : "Выполнено"}: ${goalCount} / ${habit.weeklyGoal}`;
  const goalProgress = goal.querySelector(".habit-card__goal-progress");
  goalProgress.max = habit.weeklyGoal;
  goalProgress.value = Math.min(goalCount, habit.weeklyGoal);
  goalProgress.setAttribute("aria-label", `Цель на неделю: ${goalCount} из ${habit.weeklyGoal}`);

  updateHabitAchievements(card, habit);
}

function updateHabitDateNote(habit, date) {
  const dayButton = habitsList.querySelector(
    `.habit-card[data-habit-id="${CSS.escape(habit.id)}"] [data-date="${date}"]`,
  );

  if (!dayButton) {
    return;
  }

  const note = habit.notes[date] || "";
  dayButton.dataset.hasNote = String(Boolean(note));
  dayButton.title = note
    ? `${formatDateLabel(date)}: ${note} (правый клик — изменить)`
    : `${formatDateLabel(date)} (правый клик — добавить заметку)`;
  dayButton.setAttribute(
    "aria-label",
    `${formatDateLabel(date)}: ${habit.name}, ${habit.completedDates.includes(date) ? "выполнено" : "не выполнено"}${note ? `, заметка: ${note}` : ""}`,
  );
}

function updateHabitAchievements(card, habit) {
  const badges = card.querySelector(".habit-card__achievements");
  const descriptions = [];

  if (longestStreak(habit) >= 7) {
    descriptions.push("7 дней подряд без пропусков");
  }

  if (habit.completedDates.length >= 30) {
    descriptions.push("30 выполнений всего");
  }

  const currentDescriptions = [...badges.children].map((badge) => badge.title);

  if (descriptions.length === currentDescriptions.length
    && descriptions.every((description, index) => description === currentDescriptions[index])) {
    return;
  }

  badges.replaceChildren(...descriptions.map(createAchievement));
}

function updateCalendarControls() {
  document.querySelectorAll(".view-switch__button").forEach((button) => {
    const active = button.dataset.view === habitView;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  monthNavigation.hidden = habitView !== "month";

  const formattedMonth = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(viewedMonth);
  monthTitle.textContent = `${formattedMonth.charAt(0).toLocaleUpperCase("ru-RU")}${formattedMonth.slice(1)} ${viewedMonth.getFullYear()}`;
}

function renderAchievements(newAchievementIds = []) {
  const unlocked = new Set(achievementState.unlocked);
  achievementCount.textContent = `${unlocked.size} / ${ACHIEVEMENTS.length}`;
  achievementsGrid.replaceChildren(...ACHIEVEMENTS.map((achievement) => {
    const card = document.createElement("article");
    const isUnlocked = unlocked.has(achievement.id);
    const isNew = newAchievementIds.includes(achievement.id);
    card.className = `achievement-card${isUnlocked ? " is-unlocked" : ""}${isNew ? " is-new" : ""}`;
    card.dataset.achievementId = achievement.id;
    if (isNew) {
      card.addEventListener("animationend", () => card.classList.remove("is-new"), { once: true });
    }

    const icon = document.createElement("span");
    icon.className = "achievement-card__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = isUnlocked ? achievement.icon : "🔒";

    const title = document.createElement("h3");
    title.className = "achievement-card__title";
    title.textContent = achievement.name;

    const description = document.createElement("p");
    description.className = "achievement-card__description";
    description.textContent = achievement.description;

    card.append(icon, title, description);
    return card;
  }));
}

function evaluateAchievements() {
  const unlocked = new Set(achievementState.unlocked);
  const newlyUnlocked = ACHIEVEMENTS.filter((achievement) => (
    !unlocked.has(achievement.id) && achievement.condition(achievementState)
  ));

  if (newlyUnlocked.length === 0) {
    renderAchievements();
    return;
  }

  newlyUnlocked.forEach((achievement) => {
    achievementState.unlocked.push(achievement.id);
  });
  saveAchievementState();
  renderAchievements(newlyUnlocked.map((achievement) => achievement.id));
  newlyUnlocked.forEach((achievement) => showNotification(`🏆 Новое достижение: ${achievement.name}!`));
  newlyUnlocked.forEach(() => awardExperience(50));
}

function showNotification(message) {
  toastQueue.push(message);
  if (toastIsActive) {
    return;
  }

  toastIsActive = true;
  displayNextAchievementToast();
}

function displayNextAchievementToast() {
  const message = toastQueue.shift();

  if (!message) {
    toastIsActive = false;
    return;
  }

  achievementToast.textContent = message;
  achievementToast.hidden = false;
  achievementToast.classList.remove("is-visible");
  void achievementToast.offsetWidth;
  achievementToast.classList.add("is-visible");
  window.setTimeout(() => {
    achievementToast.classList.remove("is-visible");
    window.setTimeout(() => {
      achievementToast.hidden = true;
      displayNextAchievementToast();
    }, 250);
  }, 4000);
}

function setHabitView(view) {
  habitView = view === "month" ? "month" : "week";
  saveHabitView();
  updateCalendarControls();
  renderHabits({ animateCalendar: true });
}

function renderHabits(options = {}) {
  habitsList.replaceChildren();
  updateCalendarControls();

  if (habits.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Добавьте первую привычку";
    habitsList.append(emptyState);
  } else {
    habits.forEach((habit) => {
      habitsList.append(createHabitCard(habit, options));
    });
  }

  exitingCards.forEach((card) => {
    habitsList.append(card);
  });

  updateDashboard(options.animateDashboard === true);
}

function exportHabits() {
  const exportData = {
    exportedAt: new Date().toISOString(),
    habits,
  };
  const file = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `habit-tracker-${localDateKey(new Date())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

renderCategoryOptions();
renderTemplateOptions();
applyTheme(loadTheme(), false);
saveHabitView();
renderHabits();
achievementState.createdHabits = Math.max(achievementState.createdHabits, habits.length);
achievementState.totalCompletions = Math.max(achievementState.totalCompletions, totalCompletions());
saveAchievementState();
updateLevelWidget();
updateTodayWidget();
evaluateAchievements();

document.querySelectorAll(".view-switch__button").forEach((button) => {
  button.addEventListener("click", () => setHabitView(button.dataset.view));
});

document.querySelector("#previousMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1);
  renderHabits({ animateCalendar: true });
});

document.querySelector("#nextMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1);
  renderHabits({ animateCalendar: true });
});

achievementsButton.addEventListener("click", () => {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  document.querySelector("#achievementsSection").scrollIntoView({ behavior, block: "start" });
});

templatesButton.addEventListener("click", () => {
  openModal(templatesDialog);
});

templatesGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-template-id]");
  if (button && templatesGrid.contains(button)) {
    addHabitTemplate(button.dataset.templateId);
  }
});

openHabitDialogButton.addEventListener("click", () => {
  selectedCategoryId = null;
  habitInput.value = "";
  weeklyGoalInput.value = "7";
  categoryGrid.querySelectorAll(".category-option").forEach((option) => {
    option.setAttribute("aria-pressed", "false");
    option.classList.remove("is-pulsing");
  });
  createHabitButton.disabled = true;
  openModal(habitDialog, habitInput);
});

categoryGrid.addEventListener("click", (event) => {
  const option = event.target.closest(".category-option");

  if (!option || !categoryGrid.contains(option)) {
    return;
  }

  selectedCategoryId = option.dataset.category;
  categoryGrid.querySelectorAll(".category-option").forEach((categoryOption) => {
    categoryOption.setAttribute("aria-pressed", String(categoryOption === option));
    categoryOption.classList.remove("is-pulsing");
  });
  void option.offsetWidth;
  option.classList.add("is-pulsing");
  createHabitButton.disabled = false;
});

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (addHabit(habitInput.value, selectedCategoryId, Number(weeklyGoalInput.value))) {
    habitForm.reset();
    selectedCategoryId = null;
    createHabitButton.disabled = true;
    categoryGrid.querySelectorAll(".category-option").forEach((option) => {
      option.setAttribute("aria-pressed", "false");
    });
    closeModal(habitDialog);
  }
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(document.getElementById(button.dataset.closeDialog));
  });
});

[habitDialog, noteDialog, templatesDialog].forEach((dialog) => {
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal(dialog);
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(dialog);
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeModal(dialog);
    }
  });
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveNote(noteInput.value);
});

deleteNoteButton.addEventListener("click", () => {
  saveNote("");
});

themeToggle.addEventListener("click", () => {
  applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
});

exportButton.addEventListener("click", exportHabits);

habitsList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button || !habitsList.contains(button)) {
    return;
  }

  if (button.dataset.action === "delete-habit") {
    const card = button.closest(".habit-card");

    if (card && !card.classList.contains("is-exiting")) {
      deleteHabit(button.dataset.habitId, card);
    }

    return;
  }

  if (button.dataset.action === "toggle-day") {
    toggleDate(button.dataset.habitId, button.dataset.date);
  }
});

habitsList.addEventListener("contextmenu", (event) => {
  const dayButton = event.target.closest("button[data-action='toggle-day']");

  if (!dayButton || !habitsList.contains(dayButton)) {
    return;
  }

  event.preventDefault();
  openNoteDialog(dayButton.dataset.habitId, dayButton.dataset.date);
});
