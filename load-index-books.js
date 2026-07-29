/**
 * Загрузка и рендеринг всех книг на главной странице
 * Использует /books.json
 * Книга 0 — отдельный блок в самом начале
 * Статусы: available, in_progress, planned
 */

async function loadIndexBooks() {
    const container = document.getElementById('booksContainer');
    if (!container) return;

    try {
        const response = await fetch('/books.json');
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const books = data.books || [];

        // Находим Книгу 0
        const book0 = books.find(b => b.id === 0);

        // Остальные книги (без Книги 0)
        const otherBooks = books.filter(b => b.id !== 0);

        // Блоки для книг 1–24
        const blocks = {
            1: { title: '🧭 Блок 1. Зарождение', desc: 'Дать систему, научить видеть, сделать выбор, войти в диалог', books: [] },
            2: { title: '🚀 Блок 2. Движение', desc: 'Вынести систему во внешний мир: толчок, проявление, гармония, завершение', books: [] },
            3: { title: '🌿 Блок 3. Трансформация', desc: 'Жизнь с результатом и трансформация: рутина, кризис, пауза, озарение', books: [] },
            4: { title: '🔄 Блок 4. Перерождение', desc: 'Опыт и новый цикл: шанс, опыт, защита, победа', books: [] },
            5: { title: '⭐ Блок 5. Завершение', desc: 'Принятие и завершение: воля, рост, синхронизация, интеграция', books: [] },
            6: { title: '🏛️ Блок 6. Наследие', desc: 'Поток и трансформация: доверие, потенциал, наследие, трансформация', books: [] }
        };

        otherBooks.forEach(book => {
            let blockId = 0;
            if (book.id >= 1 && book.id <= 4) blockId = 1;
            else if (book.id >= 5 && book.id <= 8) blockId = 2;
            else if (book.id >= 9 && book.id <= 12) blockId = 3;
            else if (book.id >= 13 && book.id <= 16) blockId = 4;
            else if (book.id >= 17 && book.id <= 20) blockId = 5;
            else if (book.id >= 21 && book.id <= 24) blockId = 6;

            if (blocks[blockId]) {
                blocks[blockId].books.push(book);
            }
        });

        Object.keys(blocks).forEach(key => {
            blocks[key].books.sort((a, b) => a.id - b.id);
        });

        let html = '';

        // ============================================
        // БЛОК КНИГА 0 (в самом начале)
        // ============================================
        if (book0) {
            const statusText = book0.statusText || '✅ Доступна';
            const litresButton = book0.litresLink ? 
                `<a href="${book0.litresLink}" class="btn btn-small btn-litres" target="_blank">📘 Читать на Литрес</a>` : 
                '';

            html += `
                <div style="margin: 1.5rem 0 2.5rem; background: #fcf9f5; border-radius: 28px; padding: 1.8rem 2rem; border-left: 6px solid #b87c4f; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.3rem;">
                        <span style="font-size: 1.8rem;">🌀</span>
                        <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; color: #b87c4f; font-weight: 600;">Книга 0</span>
                        <span style="font-size: 0.6rem; background: #eef4ed; color: #2c6e49; padding: 0.1rem 0.6rem; border-radius: 20px; font-weight: 600;">${statusText}</span>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e3a2f; margin: 0.2rem 0 0.1rem;">${book0.title}</h3>
                    <div style="font-size: 0.9rem; color: #2c6e49; font-weight: 500; margin-bottom: 0.8rem;">${book0.subtitle || ''}</div>
                    <div style="font-size: 0.92rem; color: #2d3e3b; line-height: 1.6; margin-bottom: 1rem;">
                        <p>${book0.annotation || ''}</p>
                    </div>
                    <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 0.5rem;">
                        ${litresButton}
                    </div>
                </div>
            `;
        }

        // ============================================
        // БЛОКИ 1–6
        // ============================================
        for (let i = 1; i <= 6; i++) {
            const block = blocks[i];
            if (!block || block.books.length === 0) continue;

            const borderColors = ['#1e3a2f', '#c97e2a', '#8a7f6d', '#c97e2a', '#1e3a2f', '#b87c4f'];
            const borderColor = borderColors[i - 1] || '#1e3a2f';

            html += `
                <h2 style="margin-top: 2rem; border-left-color: ${borderColor};">${block.title}</h2>
                <p style="color: #5f6c66; margin-bottom: 1.5rem; font-size: 0.9rem;">${block.desc}</p>
                <div class="books-grid">
            `;

            block.books.forEach(book => {
                const statusText = book.statusText || (book.status === 'available' ? '✅ Доступна' : '📝 Планируется');
                const litresButton = book.litresLink ? 
                    `<a href="${book.litresLink}" class="btn btn-small btn-litres" target="_blank">Литрес</a>` : 
                    '';

                let statusClass = '';
                if (book.status === 'planned' || book.status === 'in_progress') {
                    statusClass = 'idea';
                }

                let detailButton = '';
                if (book.status === 'planned' && book.action === 'notify') {
                    detailButton = `<a href="${book.url}" class="btn btn-small" style="background: #c97e2a; border-color: #c97e2a;">📬 Сообщить о выходе</a>`;
                } else {
                    detailButton = `<a href="${book.url}" class="btn btn-small">Подробнее →</a>`;
                }

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
                                ${detailButton}
                                ${litresButton}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIndexBooks);
} else {
    loadIndexBooks();
}
