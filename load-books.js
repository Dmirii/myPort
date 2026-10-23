/**
 * Загрузка и рендеринг блока "Другие книги серии"
 * Использует /books.json (RU) или /books-en.json (EN)
 * С пагинацией: по 4 книги на страницу
 */

let allBooks = [];
let currentPage = 0;
const BOOKS_PER_PAGE = 4;

async function loadSeriesBooks() {
    const placeholder = document.getElementById('seriesBooksPlaceholder');
    if (!placeholder) return;

    const IS_EN = window.location.pathname.startsWith('/en/');
    const dataUrl = IS_EN ? '/books-en.json' : '/books.json';

    const T = IS_EN ? {
        title: '📚 Other books in the series',
        allHere: 'All books are already loaded! 🎉',
        viewAll: 'View all books in the catalog →',
        avail: '✅ Available',
        planned: '📝 Planned',
        buy: '📘 Litres (RU)',
        prev: '← Prev',
        next: 'Next →'
    } : {
        title: '📚 Другие книги серии',
        allHere: 'Все книги уже на месте! 🎉',
        viewAll: 'Посмотреть все книги →',
        avail: '✅ Доступна',
        planned: '📝 Планируется',
        buy: '📘 Купить',
        prev: '← Назад',
        next: 'Вперед →'
    };

    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const books = data.books || [];

        const currentPageFile = window.location.pathname.split('/').pop();
        allBooks = books.filter(b => {
            const bFile = (b.url || '').split('/').pop();
            return bFile !== currentPageFile;
        });

        if (allBooks.length === 0) {
            placeholder.innerHTML = `
                <div class="series-books">
                    <h3>${T.title}</h3>
                    <p style="text-align:center; color:#8a7f6d; padding:1rem;">
                        ${T.allHere}
                    </p>
                </div>
            `;
            return;
        }

        currentPage = 0;
        renderBooksPage(placeholder, T);

    } catch (error) {
        console.warn('Не удалось загрузить список книг:', error);
        placeholder.innerHTML = `
            <div class="series-books">
                <h3>${T.title}</h3>
                <p style="text-align:center; color:#8a7f6d; padding:1rem;">
                    <a href="${IS_EN ? '/en/#books' : '/#books'}" style="color:#1e3a2f;">${T.viewAll}</a>
                </p>
            </div>
        `;
    }
}

function renderBooksPage(placeholder, T) {
    const totalPages = Math.ceil(allBooks.length / BOOKS_PER_PAGE);
    const start = currentPage * BOOKS_PER_PAGE;
    const end = Math.min(start + BOOKS_PER_PAGE, allBooks.length);
    const pageBooks = allBooks.slice(start, end);

    let html = `
        <div class="series-books">
            <h3>${T.title}</h3>
            <div class="series-books-grid">
    `;

    pageBooks.forEach(book => {
        const statusClass = book.status === 'planned' ? 'soon' : '';
        const statusText = book.statusText || (book.status === 'available' ? T.avail : T.planned);
        const isAvailable = book.status === 'available';
        
        const buyButton = (isAvailable && book.litresLink)
            ? `<a href="${book.litresLink}" class="sb-buy" target="_blank" rel="noopener">${T.buy}</a>`
            : '';

        html += `
            <div class="series-book-item">
                <a href="${book.url}" class="sb-link">
                    <div class="sb-cover">
                    <img src="${book.cover || '/img/cover_placeholder.jpg'}" alt="${book.title}" loading="lazy">
                    </div>
                    <div class="sb-info">
                        <div class="sb-number">${book.number}</div>
                        <div class="sb-title">${book.title}</div>
                        <div class="sb-status ${statusClass}">${statusText}</div>
                    </div>
                </a>
                ${buyButton}
            </div>
        `;
    });

    html += `
            </div>
    `;

    if (totalPages > 1) {
        html += `
            <div class="series-pagination">
                <button class="page-btn" id="prevPage" ${currentPage === 0 ? 'disabled' : ''}>
                    ${T.prev}
                </button>
                <span class="page-info">${currentPage + 1} / ${totalPages}</span>
                <button class="page-btn" id="nextPage" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>
                    ${T.next}
                </button>
            </div>
        `;
    }

    html += `
        </div>
    `;

    placeholder.innerHTML = html;

    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                renderBooksPage(placeholder, T);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                renderBooksPage(placeholder, T);
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSeriesBooks);
} else {
    loadSeriesBooks();
}
