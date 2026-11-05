/**
 * Виджет «Состояние года» — вторая строка календаря.
 * Подключается: <script src="/state-widget.js" defer></script>
 * Расчёт идёт в UTC-моментах, от зимнего солнцестояния (нуль цикла).
 * Локаль определяется по <html lang> страницы (ru по умолчанию).
 * Дополнительно подсвечивает текущее состояние в таблице Т1 (data-state="N").
 */
(function () {
  var DELTA = 365.2422 / 24; // суток на одно состояние ≈ 15.2184
  var EN = (document.documentElement.lang || "").toLowerCase().indexOf("en") === 0;

  // 24 состояния года: [имя RU, имя EN, знак, формула RU, формула EN] — канон серии
  var STATES = [
    ["Феху", "Fehu", "ᚠ", "начало, искра", "beginning, a spark"],
    ["Уруз", "Uruz", "ᚢ", "вихрь вариантов", "a vortex of options"],
    ["Турисаз", "Thurisaz", "ᚦ", "выбор, отсечение", "choice, cutting away"],
    ["Ансуз", "Ansuz", "ᚨ", "подтверждение, зелёный свет", "confirmation, the green light"],
    ["Райдо", "Raidho", "ᚱ", "первый шаг", "the first step"],
    ["Кеназ", "Kenaz", "ᚲ", "проявление, свет", "manifestation, light"],
    ["Гебо", "Gebo", "ᚷ", "гармония, равновесие", "harmony, balance"],
    ["Вуньо", "Wunjo", "ᚹ", "радость, выдох", "joy, an exhale"],
    ["Хагалаз", "Hagalaz", "ᚺ", "жизнь с результатом, рутина", "living with the result, routine"],
    ["Наутиз", "Nauthiz", "ᚾ", "нужда, сигнал", "need, a signal"],
    ["Иса", "Isa", "ᛁ", "пауза, концентрация", "pause, concentration"],
    ["Йера", "Jera", "ᛃ", "озарение, вспышка", "insight, a flash"],
    ["Перт", "Perthro", "ᛈ", "второй шанс", "a second chance"],
    ["Эйваз", "Eihwaz", "ᛇ", "действие на опыте", "action built on experience"],
    ["Альгиз", "Algiz", "ᛉ", "защита, интуиция", "protection, intuition"],
    ["Соулу", "Sowilo", "ᛋ", "идеальный исход", "the ideal outcome"],
    ["Тейваз", "Tiwaz", "ᛏ", "воля", "will"],
    ["Беркана", "Berkana", "ᛒ", "возрождение, новый статус", "rebirth, a new status"],
    ["Эваз", "Ehwaz", "ᛖ", "перенос, партнёрство", "a lift, partnership"],
    ["Маназ", "Mannaz", "ᛗ", "подтверждение, социум", "confirmation, community"],
    ["Лагуз", "Laguz", "ᛚ", "поток, доверие", "flow, trust"],
    ["Ингуз", "Ingwaz", "ᛜ", "семя, потенциал", "a seed, potential"],
    ["Отал", "Othala", "ᛟ", "наследие", "inheritance"],
    ["Дагаз", "Dagaz", "ᛞ", "завершение, перерождение", "completion, rebirth"]
  ];

  // Строки интерфейса виджета
  var T = EN ? {
    head: "State of the Year Calendar",
    now: "the year is currently in the state of",
    note: "24 rune states of the year: ~15 days each — a time calculation, not fortune-telling. Everyone is in the same state right now.",
    dayPre: "day ",
    dayPost: " of ~15",
    nodePre: "until node ",
    nodePost: " days",
    todayNode: "node today — the year switches to ",
    href: "https://dimaa.ru/en/calendar.html",
    title: "Open the State of the Year Calendar"
  } : {
    head: "Календарь состояний года",
    now: "сейчас год в состоянии",
    note: "24 состояния года по рунам: каждое ~15 дней — расчёт по времени, без гаданий. У всех сейчас одно и то же.",
    dayPre: "день ",
    dayPost: " из ~15",
    nodePre: "до узла ",
    nodePost: " сут",
    todayNode: "сегодня узел — год переключается в ",
    href: "https://dimaa.ru/calendar.html",
    title: "Открыть календарь состояний года"
  };

  // Моменты зимнего солнцестояния (нуль цикла), UTC. Источник: эфемериды.
  // Пополнять ежегодно: в ноябре добавлять следующий год.
  var T0 = {
    2024: Date.UTC(2024, 11, 21, 9, 21), // 12:21 МСК
    2025: Date.UTC(2025, 11, 21, 15, 3), // 18:03 МСК
    2026: Date.UTC(2026, 11, 21, 20, 50), // 23:50 МСК
    2027: Date.UTC(2027, 11, 22, 2, 42), // 05:42 МСК 22.12
    2028: Date.UTC(2028, 11, 21, 8, 20), // 11:20 МСК
    2029: Date.UTC(2029, 11, 21, 14, 14), // 17:14 МСК
    2030: Date.UTC(2030, 11, 21, 20, 9) // 23:09 МСК
  };

  function stateOf(now) {
    var t = now.getTime();
    var y = now.getUTCFullYear();
    var t0 = T0[y];
    if (t0 === undefined || t < t0) { t0 = T0[y - 1]; }
    if (t0 === undefined) return null; // год вне таблицы — молчим
    var days = (t - t0) / 864e5;
    if (days >= 24 * DELTA) return null; // T0 не пополнен — прячем (fail-silent)
    var k = Math.min(23, Math.floor(days / DELTA));
    var nodeAt = t0 + (k + 1) * DELTA * 864e5; // момент следующего узла
    return {
      num: k + 1,
      name: STATES[k][EN ? 1 : 0],
      glyph: STATES[k][2],
      formula: STATES[k][EN ? 4 : 3],
      dayInState: Math.floor(days - k * DELTA) + 1,
      daysToNode: Math.max(0, (nodeAt - t) / 864e5),
      // после Дагаз (24) следующий узел — Пустая (нуль нового цикла)
      nextName: k === 23 ? (EN ? "Blank Rune" : "Пустая") : STATES[k + 1][EN ? 1 : 0]
    };
  }

  function render() {
    var el = document.getElementById("state-of-year");
    if (!el) return;
    var s = stateOf(new Date());
    if (!s) { el.style.display = "none"; return; }
    var dDays = Math.round(s.daysToNode);
    var tail = s.daysToNode < 0.5
      ? T.todayNode + s.nextName
      : T.nodePre + s.nextName + " ≈ " + dDays + (EN ? (dDays === 1 ? " day" : " days") : T.nodePost);
    el.innerHTML =
      '<a class="soy" href="' + T.href + '" title="' + T.title + '">' +
        '<span class="soy-glyph">' + s.glyph + "</span>" +
        '<span class="soy-main"><b>' + T.head + "</b> — " + T.now + " <b>" + s.name + "</b> (" +
          s.num + (EN ? " of 24" : " из 24") + ") — <i>" + s.formula + "</i></span>" +
        '<span class="soy-sub">' + T.dayPre + s.dayInState + T.dayPost + " · " + tail + " →</span>" +
        '<span class="soy-note">' + T.note + "</span>" +
      "</a>";
    highlightRow(s.num);
    markDial(s);
  }

  // Подсветка текущего сегмента на SVG-циферблате (календарь). Если циферблата нет — тихо выходим.
  function markDial(s) {
    var dial = document.querySelector(".cal-dial");
    if (!dial) return;
    var prev = dial.querySelector(".dial-seg.is-now");
    if (prev) prev.classList.remove("is-now");
    var cur = dial.querySelector('.dial-seg[data-state="' + s.num + '"]');
    if (cur) cur.classList.add("is-now");
    var name = dial.querySelector(".dial-name");
    var sub = dial.querySelector(".dial-sub");
    if (name) name.textContent = s.name;
    if (sub) sub.textContent = (EN ? "day " + s.dayInState : "день " + s.dayInState) + " · " + s.num + "/24";
  }

  // Подсветка текущего состояния в таблице Т1 (блок 5). Если таблицы нет — тихо выходим.
  function highlightRow(num) {
    if (highlightRow.done) {
      if (highlightRow.prev) { highlightRow.prev.classList.remove("is-now"); }
    }
    var row = document.querySelector('tr[data-state="' + num + '"]');
    if (!row) return;
    row.classList.add("is-now");
    highlightRow.prev = row;
    highlightRow.done = true;
  }

  function start() {
    render();
    setInterval(render, 60000); // пересчёт раз в минуту
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
