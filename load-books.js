/**
 * Загрузка и рендеринг блока "Другие книги серии"
 * Использует /books.json
 */

async function loadSeriesBooks() {
    const placeholder = document.getElementById('seriesBooksPlaceholder');
    if (!placeholder) return;

    try {
        const response = await fetch('/books.json');
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const books = data.books || [];

        // Исключаем текущую книгу
        const currentPage = window.location.pathname.split('/').pop();
        const filteredBooks = books.filter(b => b.url !== currentPage);

        if (filteredBooks.length === 0) {
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

        let html = `
            <div class="series-books">
                <h3>📚 Другие книги серии</h3>
                <div class="series-books-grid">
        `;

        filteredBooks.forEach(book => {
            const statusClass = book.status === 'planned' ? 'soon' : '';
            const opacityStyle = book.status === 'planned' ? 'opacity:0.6;' : '';
            
            html += `
                <a href="${book.url}" class="series-book-item" style="${opacityStyle}">
                    <div class="sb-number">${book.number}</div>
                    <div class="sb-title">${book.title}</div>
                    <div class="sb-status ${statusClass}">${book.statusText}</div>
                </a>
            `;
        });

        html += `
                </div>
            </div>
        `;

        placeholder.innerHTML = html;

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

// Запускаем загрузку, когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSeriesBooks);
} else {
    loadSeriesBooks();
}
