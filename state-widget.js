/**
 * Виджет «Состояние года» — вторая строка календаря.
 * Подключается на calendar.html: <script src="/state-widget.js" defer></script>
 * Расчёт идёт в UTC-моментах, от зимнего солнцестояния (нуль цикла).
 * Дополнительно подсвечивает текущее состояние в таблице Т1 (data-state="N").
 */
(function () {
  var DELTA = 365.2422 / 24; // суток на одно состояние ≈ 15.2184

  // 24 состояния года: [имя, знак, формула] — канон серии
  var STATES = [
    ["Феху", "ᚠ", "начало, искра"],
    ["Уруз", "ᚢ", "вихрь вариантов"],
    ["Турисаз", "ᚦ", "выбор, отсечение"],
    ["Ансуз", "ᚨ", "подтверждение, зелёный свет"],
    ["Райдо", "ᚱ", "первый шаг"],
    ["Кеназ", "ᚲ", "проявление, свет"],
    ["Гебо", "ᚷ", "гармония, равновесие"],
    ["Вуньо", "ᚹ", "радость, выдох"],
    ["Хагалаз", "ᚺ", "жизнь с результатом, рутина"],
    ["Наутиз", "ᚾ", "нужда, сигнал"],
    ["Иса", "ᛁ", "пауза, концентрация"],
    ["Йера", "ᛃ", "озарение, вспышка"],
    ["Перт", "ᛈ", "второй шанс"],
    ["Эйваз", "ᛇ", "действие на опыте"],
    ["Альгиз", "ᛉ", "защита, интуиция"],
    ["Соулу", "ᛋ", "идеальный исход"],
    ["Тейваз", "ᛏ", "воля"],
    ["Беркана", "ᛒ", "возрождение, новый статус"],
    ["Эваз", "ᛖ", "перенос, партнёрство"],
    ["Маназ", "ᛗ", "подтверждение, социум"],
    ["Лагуз", "ᛚ", "поток, доверие"],
    ["Ингуз", "ᛜ", "семя, потенциал"],
    ["Отал", "ᛟ", "наследие"],
    ["Дагаз", "ᛞ", "завершение, перерождение"]
  ];

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
      name: STATES[k][0],
      glyph: STATES[k][1],
      formula: STATES[k][2],
      dayInState: Math.floor(days - k * DELTA) + 1,
      daysToNode: Math.max(0, (nodeAt - t) / 864e5),
      // после Дагаз (24) следующий узел — Пустая (нуль нового цикла)
      nextName: k === 23 ? "Пустая" : STATES[k + 1][0]
    };
  }

  function render() {
    var el = document.getElementById("state-of-year");
    if (!el) return;
    var s = stateOf(new Date());
    if (!s) { el.style.display = "none"; return; }
    var tail = s.daysToNode < 0.5
      ? "сегодня узел — год переключается в " + s.nextName
      : "до узла " + s.nextName + " ≈ " + Math.round(s.daysToNode) + " сут";
    el.innerHTML =
      '<a class="soy" href="calendar.html">' +
        '<span class="soy-glyph">' + s.glyph + "</span>" +
        '<span class="soy-main">Сейчас год в состоянии <b>' + s.name + "</b> (" +
          s.num + " из 24) — <i>" + s.formula + "</i></span>" +
        '<span class="soy-sub">день ' + s.dayInState + " из ~15 · " + tail + " →</span>" +
      "</a>";
    highlightRow(s.num);
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
