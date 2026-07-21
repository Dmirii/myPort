/**
 * Загрузка и рендеринг блока "Другие книги серии"
 * Использует /books.json
 * С пагинацией: по 4 книги на страницу
 */

let allBooks = [];
let currentPage = 0;
const BOOKS_PER_PAGE = 4;

async function loadSeriesBooks() {
    const placeholder = document.getElementById('seriesBooksPlaceholder');
    if (!placeholder) return;

    try {
        const response = await fetch('/books.json');
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const books = data.books || [];

        // Исключаем текущую книгу
        const currentPageFile = window.location.pathname.split('/').pop();
        allBooks = books.filter(b => b.url !== currentPageFile);

        if (allBooks.length === 0) {
            placeholder.innerHTML = `
                <div class="series-books">
                    <h3>📚 Другие книги серии</h3>
                    <p style="text-align:center; color:#8a7f6d; padding:1rem;">
                        Все книги уже на месте! 🎉
                    </p>
                </div>
            `;
            return;
        }

        currentPage = 0;
        renderBooksPage(placeholder);

    } catch (error) {
        console.warn('Не удалось загрузить список книг:', error);
        placeholder.innerHTML = `
            <div class="series-books">
                <h3>📚 Другие книги серии</h3>
                <p style="text-align:center; color:#8a7f6d; padding:1rem;">
                    <a href="index.html#books" style="color:#1e3a2f;">Посмотреть все книги →</a>
                </p>
            </div>
        `;
    }
}

function renderBooksPage(placeholder) {
    const totalPages = Math.ceil(allBooks.length / BOOKS_PER_PAGE);
    const start = currentPage * BOOKS_PER_PAGE;
    const end = Math.min(start + BOOKS_PER_PAGE, allBooks.length);
    const pageBooks = allBooks.slice(start, end);

    let html = `
        <div class="series-books">
            <h3>📚 Другие книги серии</h3>
            <div class="series-books-grid">
    `;

    pageBooks.forEach(book => {
        const statusClass = book.status === 'planned' ? 'soon' : '';
        const statusText = book.statusText || (book.status === 'available' ? '✅ Доступна' : '📝 Планируется');
        const isAvailable = book.status === 'available';
        
        html += `
            <a href="${book.url}" class="series-book-item">
                <div class="sb-cover">
                    <img src="${book.cover || '/img/cover_placeholder.jpg'}" alt="${book.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22140%22%3E%3Crect width=%22100%22 height=%22140%22 fill=%22%23eef4ed%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%234a6a5c%22 font-size=%2212%22 font-family=%22system-ui%22%3E${book.title.substring(0, 20)}%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="sb-info">
                    <div class="sb-number">${book.number}</div>
                    <div class="sb-title">${book.title}</div>
                    <div class="sb-status ${statusClass}">${statusText}</div>
                    ${isAvailable ? `<div class="sb-buy">📘 Купить</div>` : ''}
                </div>
            </a>
        `;
    });

    html += `
            </div>
    `;

    // ===== ПАГИНАЦИЯ =====
    if (totalPages > 1) {
        html += `
            <div class="series-pagination">
                <button class="page-btn" id="prevPage" ${currentPage === 0 ? 'disabled' : ''}>
                    ← Назад
                </button>
                <span class="page-info">${currentPage + 1} / ${totalPages}</span>
                <button class="page-btn" id="nextPage" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>
                    Вперед →
                </button>
            </div>
        `;
    }

    html += `
        </div>
    `;

    placeholder.innerHTML = html;

    // ===== ОБРАБОТЧИКИ КНОПОК =====
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                renderBooksPage(placeholder);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                renderBooksPage(placeholder);
            }
        });
    }
}

// Запускаем загрузку, когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSeriesBooks);
} else {
    loadSeriesBooks();
}
