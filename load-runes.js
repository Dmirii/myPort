/**
 * Загрузка данных о рунах из JSON
 * Используется в rune-map.html и diagnostics.html
 */

let RUNES_DATA = null;
let GROUPS_DATA = null;
let DEADLOCKS_DATA = null;

async function loadRunesData() {
    if (RUNES_DATA) return RUNES_DATA;
    
    try {
        const response = await fetch('/runes.json');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        RUNES_DATA = data.runes;
        return RUNES_DATA;
    } catch (error) {
        console.warn('Не удалось загрузить данные о рунах:', error);
        return [];
    }
}

// Группы для диагностики (можно тоже вынести в JSON, но они специфичны для квиза)
function getDiagnosticGroups() {
    return [
        { id: "A", title: "Зарождение", range: "1–4", vibe: "У меня есть идея, но я не знаю, с чего начать", states: [1,2,3,4] },
        { id: "B", title: "Движение", range: "5–8", vibe: "Я уже начал, но что-то идёт не так", states: [5,6,7,8] },
        { id: "C", title: "Трансформация", range: "9–12", vibe: "Я живу с результатом, но чувствую дискомфорт", states: [9,10,11,12] },
        { id: "D", title: "Перерождение", range: "13–16", vibe: "Я перезапускаюсь на основе опыта", states: [13,14,15,16] },
        { id: "E", title: "Завершение", range: "17–20", vibe: "Я завершаю большой этап", states: [17,18,19,20] },
        { id: "F", title: "Наследие", range: "21–24", vibe: "Я передаю опыт и завершаю цикл", states: [21,22,23,24] }
    ];
}

function getDeadlocks() {
    return [
        { num: 1, title: "Не могу начать", signs: ["Нет идеи", "Страх первого шага", "Жду идеального момента"], error: "Ты застрял до Феху или после Уруз — нет выбора.", steps: ["Найди искру — задай вопрос: чего я хочу?", "Сделай первый шаг — любой"], target: 1 },
        { num: 2, title: "Завис в выборе", signs: ["Страх ошибиться", "Смотрю на варианты и не могу выбрать", "Меняю решения"], error: "Уруз без Турисаз — ты не отсекаешь лишнее.", steps: ["Сделай выбор", "Прими, что часть вариантов исчезнет"], target: 3 },
        { num: 3, title: "Сделал, но нет радости", signs: ["Результат есть, но пустота", "Не чувствую удовлетворения", "Сомневаюсь"], error: "Пропустил Кеназ (не показал миру) или Гебо (нет баланса).", steps: ["Покажи результат другим", "Найди баланс между старым и новым"], target: 6 },
        { num: 4, title: "Результат есть, но выматывает", signs: ["Устал от того, что создал", "Рутина убивает", "Потерял смысл"], error: "Застрял в Хагалаз — не вижу Наутиз.", steps: ["Услышь дискомфорт", "Найди, что можно улучшить"], target: 9 },
        { num: 5, title: "Всё надоело, ничего не хочу", signs: ["Апатия", "Тяжело вставать утром", "Потеря интереса"], error: "Иса без Йера — пауза без озарения.", steps: ["Разреши себе паузу", "Верь, что озарение придёт"], target: 11 },
        { num: 6, title: "Знаю, что надо, но не делаю", signs: ["Понимаю, что нужно действовать", "Но не могу заставить себя", "Откладываю"], error: "Нет Райдо — страх первого шага.", steps: ["Сделай самое маленькое действие", "Не жди вдохновения"], target: 5 }
    ];
}

// Функция для поиска руны по номеру
function getRuneByNum(num, runes) {
    return runes.find(r => r.num === num);
}

// Функция для безопасного экранирования HTML
function esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}
