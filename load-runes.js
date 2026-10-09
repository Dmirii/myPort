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
        const runesUrl = window.location.pathname.startsWith('/en/') ? '/runes-en.json' : '/runes.json';
        const response = await fetch(runesUrl);
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
// Locale-aware: на страницах /en/ возвращаются английские версии
function getDiagnosticGroups() {
    if (window.location.pathname.startsWith('/en/')) {
        return [
            { id: "A", title: "Inception", range: "1–4", vibe: "I have an idea, but I don't know where to start", states: [1,2,3,4] },
            { id: "B", title: "Movement", range: "5–8", vibe: "I've already started, but something is going wrong", states: [5,6,7,8] },
            { id: "C", title: "Transformation", range: "9–12", vibe: "I live with the result, but I feel discomfort", states: [9,10,11,12] },
            { id: "D", title: "Rebirth", range: "13–16", vibe: "I'm restarting based on my experience", states: [13,14,15,16] },
            { id: "E", title: "Completion", range: "17–20", vibe: "I'm completing a big stage", states: [17,18,19,20] },
            { id: "F", title: "Legacy", range: "21–24", vibe: "I'm passing on my experience and closing the cycle", states: [21,22,23,24] }
        ];
    }
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
    if (window.location.pathname.startsWith('/en/')) {
        return [
            { num: 1, title: "I can't get started", signs: ["No idea", "Fear of the first step", "Waiting for the perfect moment"], error: "You are stuck before Fehu or after Uruz — there is no choice.", steps: ["Find the spark — ask yourself: what do I want?", "Take the first step — any step"], target: 1 },
            { num: 2, title: "Frozen in the choice", signs: ["Fear of making a mistake", "I look at the options and can't choose", "I keep changing my mind"], error: "Uruz without Thurisaz — you are not cutting away the excess.", steps: ["Make the choice", "Accept that some options will disappear"], target: 3 },
            { num: 3, title: "Done, but no joy", signs: ["The result is there, but there's emptiness", "I feel no satisfaction", "I doubt myself"], error: "You skipped Kenaz (didn't show the world) or Gebo (no balance).", steps: ["Show the result to others", "Find the balance between the old and the new"], target: 6 },
            { num: 4, title: "The result exists, but it drains me", signs: ["Tired of what I created", "The routine is killing me", "I've lost the meaning"], error: "Stuck in Hagalaz — not seeing Nauthiz.", steps: ["Hear the discomfort", "Find what can be improved"], target: 9 },
            { num: 5, title: "Fed up with everything, want nothing", signs: ["Apathy", "Hard to get up in the morning", "Loss of interest"], error: "Isa without Jera — a pause without an insight.", steps: ["Allow yourself the pause", "Trust that the insight will come"], target: 11 },
            { num: 6, title: "I know what to do, but I don't do it", signs: ["I understand I need to act", "But I can't make myself", "I keep postponing"], error: "No Raidho — fear of the first step.", steps: ["Take the smallest possible action", "Don't wait for inspiration"], target: 5 }
        ];
    }
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
