/**
 * Загрузка и рендеринг всех книг на главной странице
 * Использует /books.json
 * Версия для index.html
 */

async function loadIndexBooks() {
    const container = document.getElementById('booksContainer');
    if (!container) {
        // Если контейнера нет — выходим
        return;
    }

    try {
        const response = await fetch('/books.json');
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const books = data.books || [];

        // Группируем книги по блокам (1-4, 5-8, 9-12, 13-16, 17-20, 21-24, 0)
        const blocks = {
            1: { title: '🧭 Блок 1. Зарождение', desc: 'Дать систему, научить видеть, сделать выбор, войти в диалог', books: [] },
            2: { title: '🚀 Блок 2. Движение', desc: 'Вынести систему во внешний мир: толчок, проявление, гармония, завершение', books: [] },
            3: { title: '🌿 Блок 3. Трансформация', desc: 'Жизнь с результатом и трансформация: рутина, кризис, пауза, озарение', books: [] },
            4: { title: '🔄 Блок 4. Перерождение', desc: 'Опыт и новый цикл: шанс, опыт, защита, победа', books: [] },
            5: { title: '⭐ Блок 5. Завершение', desc: 'Принятие и завершение: воля, рост, синхронизация, интеграция', books: [] },
            6: { title: '🏛️ Блок 6. Наследие', desc: 'Поток и трансформация: доверие, потенциал, наследие, трансформация', books: [] },
            0: { title: '🌀 Точка бифуркации', desc: 'Между циклами. Тишина, пауза, переход. Не пустота — а пространство для нового.', books: [] }
        };

        // Распределяем книги по блокам
        books.forEach(book => {
            // Определяем блок по id
            let blockId = 0;
            if (book.id >= 1 && book.id <= 4) blockId = 1;
            else if (book.id >= 5 && book.id <= 8) blockId = 2;
            else if (book.id >= 9 && book.id <= 12) blockId = 3;
            else if (book.id >= 13 && book.id <= 16) blockId = 4;
            else if (book.id >= 17 && book.id <= 20) blockId = 5;
            else if (book.id >= 21 && book.id <= 24) blockId = 6;
            else blockId = 0;

            if (blocks[blockId]) {
                blocks[blockId].books.push(book);
            }
        });

        // Сортируем книги внутри каждого блока по id
        Object.keys(blocks).forEach(key => {
            blocks[key].books.sort((a, b) => a.id - b.id);
        });

        // Строим HTML
        let html = '';

        // Блоки 1-6 (основные)
        for (let i = 1; i <= 6; i++) {
            const block = blocks[i];
            if (!block || block.books.length === 0) continue;

            html += `
                <h2 style="margin-top: 2rem; border-left-color: ${i === 1 ? '#1e3a2f' : i === 2 ? '#c97e2a' : i === 3 ? '#8a7f6d' : i === 4 ? '#c97e2a' : i === 5 ? '#1e3a2f' : '#b87c4f'};">${block.title}</h2>
                <p style="color: #5f6c66; margin-bottom: 1.5rem; font-size: 0.9rem;">${block.desc}</p>
                <div class="books-grid">
            `;

            block.books.forEach(book => {
                const statusClass = book.status === 'planned' ? 'idea' : '';
                const statusText = book.statusText || (book.status === 'available' ? '✅ Доступна' : '📝 Планируется');
                const litresButton = book.litresLink ? 
                    `<a href="${book.litresLink}" class="btn btn-small btn-litres" target="_blank">Литрес</a>` : 
                    '';

                html += `
                    <div class="book-card">
                        <div class="book-number">${book.numberFull || book.number}</div>
                        <div class="book-status ${statusClass}">${statusText}</div>
                        <div class="book-title">${book.title}</div>
                        <div class="book-subtitle">${book.subtitle || ''}</div>
                        <div class="book-annotation">
                            <p>${book.annotation || ''}</p>
                        </div>
                        <div class="book-meta">
                            <span>${book.tag || '📖'}</span>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <a href="${book.url}" class="btn btn-small">Подробнее →</a>
                                ${litresButton}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
            `;
        }

        // Блок 0 (Пустая руна)
        const block0 = blocks[0];
        if (block0 && block0.books.length > 0) {
            html += `
                <div style="margin: 3rem 0 1rem;">
                    <h2 style="border-left-color: #b87c4f; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <span style="font-size: 1.8rem;">🌀</span> 
                        <span>Точка бифуркации</span>
                        <span style="font-size: 0.8rem; font-weight: 400; color: #8a7f6d; margin-left: 4px;">— книга 0</span>
                    </h2>
                    <p style="color: #5f6c66; margin-bottom: 1.5rem; font-size: 0.9rem;">
                        Между циклами. Тишина, пауза, переход. Не пустота — а пространство для нового.
                    </p>
                </div>
                <div class="books-grid" style="margin-top: 0;">
            `;

            block0.books.forEach(book => {
                html += `
                    <div class="book-card" style="border-left: 4px solid #b87c4f; background: #fcf9f5;">
                        <div class="book-number">${book.numberFull || book.number}</div>
                        <div class="book-status idea">🌱 Идея</div>
                        <div class="book-title">${book.title}</div>
                        <div class="book-subtitle">${book.subtitle || ''}</div>
                        <div class="book-annotation">
                            <p>${book.annotation || ''}</p>
                        </div>
                        <div class="book-meta">
                            <span>${book.tag || '🌀 Переход'}</span>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <a href="${book.url}" class="btn btn-small" style="background: #b87c4f; border-color: #b87c4f;">📬 Сообщить о выходе</a>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
            `;
        }

        // Футер
        html += `
            <p style="margin-top: 1.5rem; background: #ece5da30; padding: 0.6rem 1rem; border-radius: 2rem; font-size: 0.8rem; text-align: center;">
                🧠 <strong>Инженерный подход:</strong> руны не делают за вас — они показывают этап.
            </p>
        `;

        container.innerHTML = html;

    } catch (error) {
        console.warn('Не удалось загрузить книги:', error);
        container.innerHTML = `
            <p style="text-align:center; color:#8a7f6d; padding:2rem;">
                ⚠️ Не удалось загрузить книги. Попробуйте обновить страницу.
            </p>
        `;
    }
}

// Запускаем загрузку, когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIndexBooks);
} else {
    loadIndexBooks();
}
