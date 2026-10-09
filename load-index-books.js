/**
 * Загрузка и рендеринг всех книг на главной странице
 * Использует /books.json (RU) или /books-en.json (EN, страницы в /en/)
 * Книга 0 — отдельный презентационный блок с обложкой
 * Вышедшие книги — развернуто с обложками
 * Планируемые книги — компактно со статусом
 */

async function loadIndexBooks() {
    const container = document.getElementById('booksContainer');
    if (!container) return;

    const IS_EN = window.location.pathname.startsWith('/en/');

    // ===== ЛОКАЛИЗОВАННЫЕ СТРОКИ =====
    const T = IS_EN ? {
        blocks: {
            1: { title: '🧭 Block 1. Inception', desc: 'Give the system, teach to see, make the choice, enter the dialogue' },
            2: { title: '🚀 Block 2. Movement', desc: 'Take the system into the outer world: the push, manifestation, harmony, completion' },
            3: { title: '🌿 Block 3. Transformation', desc: 'Living with the result and transformation: routine, crisis, pause, insight' },
            4: { title: '🔄 Block 4. Rebirth', desc: 'Experience and a new cycle: chance, experience, protection, victory' },
            5: { title: '⭐ Block 5. Completion', desc: 'Acceptance and completion: will, growth, synchronization, integration' },
            6: { title: '🏛️ Block 6. Legacy', desc: 'Flow and transformation: trust, potential, legacy, transformation' }
        },
        statusAvailable: '✅ Available',
        statusPlanned: '📝 Planned',
        readLitres: '📘 Read on Litres (in Russian)',
        litres: 'Litres (RU)',
        notify: '📬 Notify me',
        details: 'Details →',
        book0Label: 'Book 0 · Introductory',
        floatingText: '🧭 Diagnostics · 2 min',
        floatingLink: '/en/diagnostics.html',
        footer: '🧠 <strong>The engineering approach:</strong> runes don\'t do the work for you — they show you the stage.',
        error: '⚠️ Failed to load the books. Please refresh the page.',
        dataUrl: '/books-en.json'
    } : {
        blocks: {
            1: { title: '🧭 Блок 1. Зарождение', desc: 'Дать систему, научить видеть, сделать выбор, войти в диалог' },
            2: { title: '🚀 Блок 2. Движение', desc: 'Вынести систему во внешний мир: толчок, проявление, гармония, завершение' },
            3: { title: '🌿 Блок 3. Трансформация', desc: 'Жизнь с результатом и трансформация: рутина, кризис, пауза, озарение' },
            4: { title: '🔄 Блок 4. Перерождение', desc: 'Опыт и новый цикл: шанс, опыт, защита, победа' },
            5: { title: '⭐ Блок 5. Завершение', desc: 'Принятие и завершение: воля, рост, синхронизация, интеграция' },
            6: { title: '🏛️ Блок 6. Наследие', desc: 'Поток и трансформация: доверие, потенциал, наследие, трансформация' }
        },
        statusAvailable: '✅ Доступна',
        statusPlanned: '📝 Планируется',
        readLitres: '📘 Читать на Литрес',
        litres: 'Литрес',
        notify: '📬 Сообщить о выходе',
        details: 'Подробнее →',
        book0Label: 'Книга 0 · Вводная',
        floatingText: '🧭 Диагностика · 2 мин',
        floatingLink: '/diagnostics.html',
        footer: '🧠 <strong>Инженерный подход:</strong> руны не делают за вас — они показывают этап.',
        error: '⚠️ Не удалось загрузить книги. Попробуйте обновить страницу.',
        dataUrl: '/books.json'
    };

    try {
        const response = await fetch(T.dataUrl);
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const books = data.books || [];

        // Находим Книгу 0
        const book0 = books.find(b => b.id === 0);

        // Остальные книги (без Книги 0)
        const otherBooks = books.filter(b => b.id !== 0);

        // Блоки для книг 1–24
        const blocks = {};
        for (let i = 1; i <= 6; i++) {
            blocks[i] = { title: T.blocks[i].title, desc: T.blocks[i].desc, books: [] };
        }

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
            const statusText = book0.statusText || T.statusAvailable;
            const litresButton = book0.litresLink ? 
                `<a href="${book0.litresLink}" class="btn btn-small btn-litres" target="_blank">${T.readLitres}</a>` : 
                '';
            const coverImg = book0.cover || '/img/cover_book_0.jpg';

            html += `
                <div class="book-zero-card">
                    <div class="book-zero-cover">
                        <img src="${coverImg}" alt="${book0.title}" loading="lazy">
                    </div>
                    <div class="book-zero-info">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.4rem; flex-wrap: wrap;">
                            <span style="font-size: 1.4rem;">🌀</span>
                            <span style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1.5px; color: #b87c4f; font-weight: 700;">${T.book0Label}</span>
                            <span style="font-size: 0.75rem; background: #eef4ed; color: #2c6e49; padding: 0.15rem 0.65rem; border-radius: 20px; font-weight: 600;">${statusText}</span>
                        </div>
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e3a2f; margin: 0.2rem 0 0.15rem;">${book0.title}</h3>
                        <div style="font-size: 0.95rem; color: #2c6e49; font-weight: 500; margin-bottom: 0.8rem;">${book0.subtitle || ''}</div>
                        <div style="font-size: 0.92rem; color: #2d3e3b; line-height: 1.6; margin-bottom: 1.2rem;">
                            <p>${book0.annotation || ''}</p>
                        </div>
                        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 0.5rem;">
                            ${litresButton}
                        </div>
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
                <h2 style="margin-top: 2.2rem; border-left-color: ${borderColor};">${block.title}</h2>
                <p style="color: #5f6c66; margin-bottom: 1.5rem; font-size: 0.92rem;">${block.desc}</p>
                <div class="books-grid">
            `;

            block.books.forEach(book => {
                const isAvailable = book.status === 'available';
                const statusText = book.statusText || (isAvailable ? T.statusAvailable : T.statusPlanned);
                const litresButton = book.litresLink ? 
                    `<a href="${book.litresLink}" class="btn btn-small btn-litres" target="_blank">${T.litres}</a>` : 
                    '';

                let detailButton = '';
                if (book.url) {
                    if (!isAvailable) {
                        detailButton = `<a href="${book.url}" class="btn btn-small btn-outline" style="background: #fdf6ec; border-color: #c97e2a; color: #8a581e;">${T.notify}</a>`;
                    } else {
                        detailButton = `<a href="${book.url}" class="btn btn-small btn-outline">${T.details}</a>`;
                    }
                }

                if (isAvailable) {
                    // Вышедшие книги: развернуто, с обложкой и акцентом на покупку
                    const coverHtml = book.cover ? 
                        `<div class="book-cover-wrap"><img src="${book.cover}" alt="${book.title}" class="book-cover-img" loading="lazy"></div>` : '';

                    html += `
                        <div class="book-card book-available">
                            ${coverHtml}
                            <div class="book-number">${book.numberFull || book.number}</div>
                            <div class="book-status">${statusText}</div>
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
                } else {
                    // Планируемые книги: компактный аккуратный вид
                    html += `
                        <div class="book-card book-planned">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                                <div class="book-number">${book.numberFull || book.number}</div>
                                <div class="book-status idea">${statusText}</div>
                            </div>
                            <div class="book-title" style="font-size: 1.15rem;">${book.title}</div>
                            <div class="book-subtitle">${book.subtitle || ''}</div>
                            <div class="book-annotation book-annotation-compact">
                                <p>${book.annotation || ''}</p>
                            </div>
                            <div class="book-meta">
                                <span>${book.tag || '📝'}</span>
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    ${detailButton}
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            html += `</div>`;
        }

        html += `
            <p style="margin-top: 2rem; background: #ece5da30; padding: 0.8rem 1.2rem; border-radius: 2rem; font-size: 0.85rem; text-align: center; color: #5f6c66;">
                ${T.footer}
            </p>
        `;

        container.innerHTML = html;

        // Sticky CTA кнопка для быстрого перехода к диагностике
        initFloatingCta(T.floatingText, T.floatingLink);

    } catch (error) {
        console.warn('Не удалось загрузить книги:', error);
        container.innerHTML = `
            <p style="text-align:center; color:#8a7f6d; padding:2rem;">
                ${T.error}
            </p>
        `;
    }
}

function initFloatingCta(text, link) {
    if (document.getElementById('floatingCta')) return;
    const btn = document.createElement('a');
    btn.id = 'floatingCta';
    btn.className = 'floating-cta';
    btn.href = link;
    btn.innerHTML = text;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 450) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIndexBooks);
} else {
    loadIndexBooks();
}
