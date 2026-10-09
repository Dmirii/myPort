/**
 * Загрузка навигации для всех страниц + хлебные крошки (Breadcrumbs)
 * Locale-aware: страницы в /en/ получают английское меню (/en/menu.html)
 * и английские хлебные крошки. Также вычисляет ссылку переключателя языка.
 */

// ===== ОПРЕДЕЛЕНИЕ ЯЗЫКА ТЕКУЩЕЙ СТРАНИЦЫ =====
const SITE_LANG = window.location.pathname.startsWith('/en/') ? 'en' : 'ru';

// Страницы, у которых есть английская версия (для переключателя языка)
const TRANSLATED_PAGES = ['index.html', 'methodology.html', 'rune-map.html', 'port.html', 'diagnostics.html', 'feedback.html'];

async function loadMenu() {
    const placeholder = document.getElementById('menuPlaceholder');
    if (!placeholder) return;

    try {
        const menuUrl = SITE_LANG === 'en' ? '/en/menu.html' : '/menu.html';
        const response = await fetch(menuUrl);
        if (!response.ok) throw new Error('Network error');
        const html = await response.text();
        placeholder.innerHTML = html;
        setLangSwitchHref();
    } catch (error) {
        console.warn('Не удалось загрузить меню:', error);
    }
}

// ===== ССЫЛКА НА ВЕРСИЮ СТРАНИЦЫ НА ДРУГОМ ЯЗЫКЕ =====
function getAlternateUrl() {
    const path = window.location.pathname;
    if (SITE_LANG === 'en') {
        // /en/... -> русская версия (русская версия есть всегда)
        let p = path.replace(/^\/en\/?/, '/');
        if (p === '/index.html') p = '/';
        return p + window.location.hash;
    }
    // ru -> en: только если страница переведена, иначе — английская главная
    let page = (path === '/' || path === '') ? 'index.html' : path.replace(/^\//, '');
    if (TRANSLATED_PAGES.includes(page)) {
        const target = page === 'index.html' ? '/en/' : '/en/' + page;
        return target + window.location.hash;
    }
    return '/en/';
}

function setLangSwitchHref() {
    const link = document.getElementById('langSwitch');
    if (link) link.setAttribute('href', getAlternateUrl());
}

// ===== ХЛЕБНЫЕ КРОШКИ ДЛЯ SEO =====
function addBreadcrumbs() {
    const path = window.location.pathname;
    const url = window.location.href;
    const domain = 'https://dimaa.ru';
    const EN = SITE_LANG === 'en';
    const homeName = EN ? 'Home' : 'Главная';
    const homeUrl = EN ? domain + '/en/' : domain + '/';

    // Название страницы
    let pageName = document.title.split('|')[0]?.trim() || (EN ? 'Page' : 'Страница');
    pageName = pageName.replace(/\s*[—–-]\s*(Дмитрий Антонов|Dmitry Antonov)$/, '').trim();

    // Если это главная страница
    if (path === '/' || path === '/index.html' || path === '/en/' || path === '/en/index.html') {
        injectBreadcrumb({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": homeName, "item": homeUrl }
            ]
        });
        return;
    }

    // Определяем раздел
    let section = EN ? 'Page' : 'Страница';
    let sectionUrl = homeUrl;

    if (path.includes('book') && !path.includes('methodology')) {
        section = EN ? 'Books' : 'Книги';
        sectionUrl = homeUrl + '#books';
        const h1 = document.querySelector('.book-info h1') || document.querySelector('h1');
        if (h1) pageName = h1.textContent.trim();
    } else if (path.includes('methodology')) {
        section = EN ? 'Methodology' : 'Методология';
        sectionUrl = domain + (EN ? '/en/methodology.html' : '/methodology.html');
    } else if (path.includes('rune-map')) {
        section = EN ? 'Rune Map' : 'Карта рун';
        sectionUrl = domain + (EN ? '/en/rune-map.html' : '/rune-map.html');
    } else if (path.includes('diagnostics')) {
        section = EN ? 'Diagnostics' : 'Диагностика';
        sectionUrl = domain + (EN ? '/en/diagnostics.html' : '/diagnostics.html');
    } else if (path.includes('port')) {
        section = EN ? 'Lab' : 'Лаборатория';
        sectionUrl = domain + (EN ? '/en/port.html' : '/port.html');
    } else if (path.includes('feedback')) {
        section = EN ? 'Subscribe' : 'Подписка';
        sectionUrl = domain + '/feedback.html';
    } else if (path.includes('privacy')) {
        section = EN ? 'Privacy Policy' : 'Политика';
        sectionUrl = domain + '/privacy.html';
    } else if (path.includes('404')) {
        section = EN ? 'Error' : 'Ошибка';
        sectionUrl = homeUrl;
    }

    injectBreadcrumb({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": homeName, "item": homeUrl },
            { "@type": "ListItem", "position": 2, "name": section, "item": sectionUrl },
            { "@type": "ListItem", "position": 3, "name": pageName, "item": url }
        ]
    });
}

function injectBreadcrumb(data) {
    const oldScript = document.querySelector('script[data-breadcrumbs]');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumbs', 'true');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

// ===== ЗАПУСК =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMenu);
    document.addEventListener('DOMContentLoaded', addBreadcrumbs);
} else {
    loadMenu();
    addBreadcrumbs();
}
