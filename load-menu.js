/**
 * Загрузка навигации для всех страниц + хлебные крошки (Breadcrumbs)
 */

async function loadMenu() {
    const placeholder = document.getElementById('menuPlaceholder');
    if (!placeholder) return;

    try {
        const response = await fetch('/menu.html');
        if (!response.ok) throw new Error('Network error');
        const html = await response.text();
        placeholder.innerHTML = html;
    } catch (error) {
        console.warn('Не удалось загрузить меню:', error);
    }
}

// ===== ХЛЕБНЫЕ КРОШКИ ДЛЯ SEO =====
function addBreadcrumbs() {
    const path = window.location.pathname;
    const url = window.location.href;
    const domain = 'https://dimaa.ru';
    
    // Название страницы
    let pageName = document.title.split('|')[0]?.trim() || 'Страница';
    pageName = pageName.replace(/\s*[—–-]\s*Дмитрий Антонов$/, '').trim();
    
    // Если это главная страница
    if (path === '/' || path === '/index.html') {
        injectBreadcrumb({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Главная", "item": domain + '/' }
            ]
        });
        return;
    }
    
    // Определяем раздел
    let section = 'Страница';
    let sectionUrl = domain + '/';
    
    if (path.includes('book') && !path.includes('methodology')) {
        section = 'Книги';
        sectionUrl = domain + '/#books';
        const h1 = document.querySelector('.book-info h1') || document.querySelector('h1');
        if (h1) pageName = h1.textContent.trim();
    } else if (path.includes('methodology')) {
        section = 'Методология';
        sectionUrl = domain + '/methodology.html';
    } else if (path.includes('rune-map')) {
        section = 'Карта рун';
        sectionUrl = domain + '/rune-map.html';
    } else if (path.includes('diagnostics')) {
        section = 'Диагностика';
        sectionUrl = domain + '/diagnostics.html';
    } else if (path.includes('port')) {
        section = 'Лаборатория';
        sectionUrl = domain + '/port.html';
    } else if (path.includes('feedback')) {
        section = 'Подписка';
        sectionUrl = domain + '/feedback.html';
    } else if (path.includes('privacy')) {
        section = 'Политика';
        sectionUrl = domain + '/privacy.html';
    } else if (path.includes('404')) {
        section = 'Ошибка';
        sectionUrl = domain + '/';
    }
    
    injectBreadcrumb({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": domain + '/' },
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
