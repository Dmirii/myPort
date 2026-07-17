/**
 * Загрузка и рендеринг портфолио проектов из JSON
 */

async function loadProjects() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;

    try {
        const response = await fetch('/projects.json');
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const projects = data.projects || [];

        let html = '';
        projects.forEach(p => {
            const borderStyle = p.highlight ? 'border-left: 4px solid #1e3a2f;' : '';
            
            html += `
                <div class="lab-card" style="${borderStyle}">
                    <div class="lab-card-title">${p.title}</div>
                    <div class="lab-card-tech">${p.tech}</div>
                    <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22169%22%3E%3Crect width=%22300%22 height=%22169%22 fill=%22%23eef4ed%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%234a6a5c%22 font-size=%2216%22 font-family=%22system-ui%22%3E${p.title.replace(/[^a-zA-Zа-яА-Я0-9 ]/g, '').trim() || 'Проект'}%3C/text%3E%3C/svg%3E'">
                    ${p.desc ? `<div class="project-desc"><p>${p.desc}</p></div>` : ''}
                    <div class="lab-card-links">
                        ${p.links.map(l => `
                            <a href="${l.url}" target="_blank" class="${l.class || ''}" style="${l.style || ''}">${l.label}</a>
                        `).join('')}
                    </div>
                    <div class="lab-card-num">${p.note}</div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.warn('Не удалось загрузить проекты:', error);
        container.innerHTML = `
            <p style="text-align:center; color:#8a7f6d; padding:2rem;">
                ⚠️ Не удалось загрузить проекты. Попробуйте обновить страницу.
            </p>
        `;
    }
}

// Запускаем загрузку, когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjects);
} else {
    loadProjects();
}
