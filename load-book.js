/**
 * Загрузка данных книги из books.json
 * Универсальный скрипт для всех страниц книг
 * Определяет книгу по URL и подгружает данные
 */

async function loadBookData() {
    // Получаем имя текущего файла
    const currentPage = window.location.pathname.split('/').pop();
    
    // Извлекаем номер книги из URL (book1.html → 1, book25.html → 25)
    let bookId = null;
    const match = currentPage.match(/book(\d+)\.html/);
    if (match) {
        bookId = parseInt(match[1]);
    }
    
    if (!bookId) return;

    try {
        const response = await fetch('/books.json');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        const book = data.books.find(b => b.id === bookId);
        if (!book) return;

        // 1. Обновляем обложку
        const coverImg = document.querySelector('.book-cover-small img');
        if (coverImg && book.cover) {
            coverImg.src = book.cover;
            coverImg.alt = book.title;
        }

        // 2. Обновляем все ссылки на Литрес
        document.querySelectorAll('.btn-litres').forEach(link => {
            if (book.litresLink) {
                link.href = book.litresLink;
            }
        });

        // 3. Обновляем цитату в футере
        const footerQuote = document.getElementById('footerQuote');
        if (footerQuote && book.footerQuote) {
            footerQuote.textContent = book.footerQuote;
        }

        // 4. Обновляем заголовок страницы
        if (book.title) {
            const numberWords = ['', 'первая', 'вторая', 'третья', 'четвёртая', 'пятая', 'шестая', 'седьмая', 'восьмая', 'девятая', 'десятая'];
            const word = numberWords[bookId] || `книга ${bookId}`;
            document.title = `${book.title} — ${word} | Дмитрий Антонов`;
        }

        // 5. Обновляем мета-описание
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && book.annotation) {
            const shortDesc = book.annotation.length > 160 ? book.annotation.substring(0, 157) + '...' : book.annotation;
            metaDesc.content = shortDesc;
        }

        // 6. Обновляем OG-изображение
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && book.cover) {
            ogImage.content = `https://dimaa.ru${book.cover}`;
        }

        // 7. Обновляем JSON-LD
        const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
        if (jsonLdScript && book.title) {
            try {
                const jsonLd = JSON.parse(jsonLdScript.textContent);
                if (jsonLd && jsonLd.name) {
                    jsonLd.name = book.title;
                    jsonLd.description = book.annotation || '';
                    jsonLd.image = `https://dimaa.ru${book.cover}`;
                    jsonLdScript.textContent = JSON.stringify(jsonLd);
                }
            } catch (e) {
                // Если не удалось распарсить JSON-LD — пропускаем
            }
        }

    } catch (error) {
        console.warn('Не удалось загрузить данные книги:', error);
    }
}

// Запускаем загрузку, когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBookData);
} else {
    loadBookData();
}
