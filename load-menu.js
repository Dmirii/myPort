/**
 * Загрузка навигации для всех страниц
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

// Запускаем загрузку, когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMenu);
} else {
    loadMenu();
}
