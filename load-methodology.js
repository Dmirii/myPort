/**
 * Загрузка и рендеринг таблицы книг на странице методологии
 * Locale-aware: /en/methodology.html использует /books-en.json и английские подписи
 */

async function loadMethodologyBooks() {
    const container = document.getElementById('methodologyBooksContainer');
    if (!container) return;

    const IS_EN = window.location.pathname.startsWith('/en/');

    const T = IS_EN ? {
        dataUrl: '/books-en.json',
        headers: { num: '№', book: 'Book', rune: 'Rune', task: 'Task', status: 'Status', action: 'Action' },
        statusAvailable: '✅ Available',
        statusPlanned: '📝 Planned',
        litres: '📘 Litres (RU)',
        subscribe: '📬 Notify me',
        summary: 'Summary:',
        error: '⚠️ Failed to load the data. Please refresh the page.',
        blocks: {
            1: { title: '🧭 Block 1. Inception', summary: 'System → Vision → Choice → Dialogue' },
            2: { title: '🚀 Block 2. Movement', summary: 'Push → Result → Balance → Completion' },
            3: { title: '🌿 Block 3. Transformation', summary: 'Routine → Signal → Pause → Insight' },
            4: { title: '🔄 Block 4. Rebirth', summary: 'Chance → Experience → Protection → Victory' },
            5: { title: '⭐ Block 5. Completion', summary: 'Will → Growth → Synchronization → Integration' },
            6: { title: '🏛️ Block 6. Legacy', summary: 'Trust → Potential → Legacy → Transformation' }
        }
    } : {
        dataUrl: '/books.json',
        headers: { num: '№', book: 'Книга', rune: 'Руна', task: 'Задача', status: 'Статус', action: 'Действие' },
        statusAvailable: '✅ Доступна',
        statusPlanned: '📝 Планируется',
        litres: '📘 Литрес',
        subscribe: '📬 Подписаться',
        summary: 'Итог:',
        error: '⚠️ Не удалось загрузить данные. Попробуйте обновить страницу.',
        blocks: {
            1: { title: '🧭 Блок 1. Зарождение', summary: 'Система → Видение → Выбор → Диалог' },
            2: { title: '🚀 Блок 2. Движение', summary: 'Толчок → Результат → Баланс → Завершение' },
            3: { title: '🌿 Блок 3. Трансформация', summary: 'Рутина → Сигнал → Пауза → Озарение' },
            4: { title: '🔄 Блок 4. Перерождение', summary: 'Шанс → Опыт → Защита → Победа' },
            5: { title: '⭐ Блок 5. Завершение', summary: 'Воля → Рост → Синхронизация → Интеграция' },
            6: { title: '🏛️ Блок 6. Наследие', summary: 'Доверие → Потенциал → Наследие → Трансформация' }
        }
    };

    try {
        const response = await fetch(T.dataUrl);
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const books = data.books || [];

        const runeMap = {
            1: 'ᚠ', 2: 'ᚢ', 3: 'ᚦ', 4: 'ᚨ',
            5: 'ᚱ', 6: 'ᚲ', 7: 'ᚷ', 8: 'ᚹ',
            9: 'ᚺ', 10: 'ᚾ', 11: 'ᛁ', 12: 'ᛃ',
            13: 'ᛈ', 14: 'ᛇ', 15: 'ᛉ', 16: 'ᛋ',
            17: 'ᛏ', 18: 'ᛒ', 19: 'ᛖ', 20: 'ᛗ',
            21: 'ᛚ', 22: 'ᛜ', 23: 'ᛟ', 24: 'ᛞ'
        };

        function getBlockId(id) {
            if (id >= 1 && id <= 4) return 1;
            if (id >= 5 && id <= 8) return 2;
            if (id >= 9 && id <= 12) return 3;
            if (id >= 13 && id <= 16) return 4;
            if (id >= 17 && id <= 20) return 5;
            if (id >= 21 && id <= 24) return 6;
            return 0;
        }

        const blocks = {};
        for (let i = 1; i <= 6; i++) {
            blocks[i] = { title: T.blocks[i].title, summary: T.blocks[i].summary, books: [] };
        }

        books.forEach(book => {
            const blockId = getBlockId(book.id);
            if (blockId > 0 && blocks[blockId]) {
                blocks[blockId].books.push(book);
            }
        });

        Object.values(blocks).forEach(block => {
            block.books.sort((a, b) => a.id - b.id);
        });

        let html = `
            <div class="series-table-wrapper">
                <table class="series-table">
                    <thead>
                        <tr>
                            <th>${T.headers.num}</th>
                            <th>${T.headers.book}</th>
                            <th>${T.headers.rune}</th>
                            <th class="hide-mobile">${T.headers.task}</th>
                            <th>${T.headers.status}</th>
                            <th>${T.headers.action}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (let i = 1; i <= 6; i++) {
            const block = blocks[i];
            if (!block || block.books.length === 0) continue;

            html += `<tr><td colspan="6" class="block-header">${block.title}</td></tr>`;

            block.books.forEach(book => {
                const runeSymbol = runeMap[book.id] || '';
                const statusText = book.statusText || (book.status === 'available' ? T.statusAvailable : T.statusPlanned);
                
                let badgeClass = 'badge-planned';
                if (book.status === 'available') badgeClass = 'badge-available';
                if (book.status === 'training') badgeClass = 'badge-training';

                // ===== ЕДИНЫЙ СТИЛЬ ДЛЯ ВСЕХ КНОПОК =====
                let actionButton = '';
                const fallbackUrl = IS_EN ? '/en/feedback.html' : 'feedback.html';
                const linkUrl = book.url || fallbackUrl;
                
                if (book.status === 'available' && book.litresLink) {
                    actionButton = `<a href="${book.litresLink}" class="btn-action litres" target="_blank">${T.litres}</a>`;
                } else {
                    actionButton = `<a href="${linkUrl}" class="btn-action subscribe">${T.subscribe}</a>`;
                }

                const hasPage = !IS_EN && book.url && book.url !== 'feedback.html';
                let bookDisplay = '';
                if (hasPage) {
                    bookDisplay = `<a href="${book.url}" class="book-link">${book.title}</a>`;
                } else {
                    bookDisplay = `<span style="color: #2d3e3b; font-weight: 500;">${book.title}</span>`;
                }

                html += `
                    <tr>
                        <td>${book.id}</td>
                        <td>${bookDisplay}</td>
                        <td class="rune-sym">${runeSymbol}</td>
                        <td class="hide-mobile">${book.tag || ''}</td>
                        <td><span class="${badgeClass}">${statusText}</span></td>
                        <td>${actionButton}</td>
                    </tr>
                `;
            });

            html += `
                <tr>
                    <td colspan="6" class="block-summary"><strong>${T.summary}</strong> ${block.summary}</td>
                </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        console.warn('Не удалось загрузить книги для методологии:', error);
        container.innerHTML = `
            <p style="text-align:center; color:#8a7f6d; padding:2rem;">
                ${T.error}
            </p>
        `;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMethodologyBooks);
} else {
    loadMethodologyBooks();
}
