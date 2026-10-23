// scripts/generate-books.js
const fs = require('fs');
const path = require('path');

console.log('🚀 === ЗАПУСК ГЕНЕРАТОРА САЙТА ===\n');

// ===== ЗАГРУЖАЕМ ДАННЫЕ =====
const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
const booksEnData = JSON.parse(fs.readFileSync('./books-en.json', 'utf8'));
const menuData = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));

const layoutRu = fs.readFileSync('./templates/layout.html', 'utf8');
const layoutEn = fs.readFileSync('./templates/layout-en.html', 'utf8');
const bookContentRuTemplate = fs.readFileSync('./templates/book-content.html', 'utf8');
const bookContentEnTemplate = fs.readFileSync('./templates/book-content-en.html', 'utf8');

// Ensure en directory exists
if (!fs.existsSync('./en')) {
  fs.mkdirSync('./en', { recursive: true });
}

// ===== МАППИНГ ФАЙЛОВ =====
const filenameMap = {
  0: 'book0.html',
  1: 'book1.html',
  2: 'book2.html',
  3: 'book25.html',
  4: 'book3.html',
  5: 'book5.html',
  6: 'book6.html'
};

function getFilename(id) {
  return filenameMap[id] || `book${id}.html`;
}

// ===== ШАБЛОНИЗАТОР =====
function render(template, data) {
  let result = template;
  
  // 1. {{#each array}}...{{/each}}
  result = result.replace(/\{\{#each (.*?)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayPath, inner) => {
    const parts = arrayPath.trim().split('.');
    let current = data;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }
    
    if (!Array.isArray(current) || current.length === 0) {
      return '';
    }
    
    return current.map(item => {
      let itemHtml = inner;
      if (typeof item === 'string') {
        itemHtml = itemHtml.replace(/\{\{this\}\}/g, item);
      } else {
        Object.keys(item).forEach(key => {
          itemHtml = itemHtml.replace(new RegExp(`{{this\\.${key}}}`, 'g'), item[key]);
        });
      }
      return itemHtml;
    }).join('');
  });
  
  // 2. {{#if condition}}...{{/if}}
  result = result.replace(/\{\{#if (.*?)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, inner) => {
    const parts = condition.trim().split('.');
    let current = data;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }
    if (current !== null && current !== undefined && current !== false && current !== '') {
      return inner;
    }
    return '';
  });
  
  // 3. Замена простых и вложенных переменных
  function replaceDeep(obj, prefix = '') {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const p = prefix ? `${prefix}.${key}` : key;
      if (p === 'content') return;
      
      if (typeof value === 'string' || typeof value === 'number') {
        result = result.replace(new RegExp(`{{${p}}}`, 'g'), String(value));
      } else if (Array.isArray(value)) {
        // processed in each
      } else if (typeof value === 'object' && value !== null) {
        replaceDeep(value, p);
      }
    });
  }
  
  replaceDeep(data);
  
  // 4. Вставка контента {{{content}}}
  result = result.replace(/\{\{\{content\}\}\}/g, data.content || '');
  
  return result;
}

// ===== 1. ГЕНЕРАЦИЯ РУССКИХ СТРАНИЦ КНИГ =====
console.log('📚 Генерируем русские страницы книг...\n');

booksData.books.forEach(book => {
  const filename = getFilename(book.id);
  
  const content = render(bookContentRuTemplate, {
    ...book,
    year: book.year || '2025',
    litresLink: book.litresLink || '',
    noLitres: book.litresLink ? '' : 'yes',
    status: book.status || 'planned',
    statusText: book.statusText || '📝 Планируется'
  });
  
  const html = render(layoutRu, {
    ...book,
    filename: filename,
    content: content,
    menu: menuData.menu,
    seo: book.seo || {
      title: `${book.title} | Дмитрий Антонов`,
      description: book.annotation ? book.annotation.slice(0, 160).replace(/"/g, '&quot;') : '',
      ogImage: `https://dimaa.ru${book.cover || '/img/og-image.jpg'}`
    },
    footerQuote: book.footerQuote || '«Мир устроен системно. Руны — это способ увидеть и настроить его процессы»'
  });
  
  fs.writeFileSync(filename, html);
  console.log(`  ✅ ${filename} сохранён`);
});

// ===== 2. ОБНОВЛЯЕМ URL И ОБЛОЖКИ В BOOKS-EN.JSON =====
console.log('\n🇬🇧 Обновляем метаданные и генерируем английские страницы книг...\n');

booksEnData.books.forEach(bookEn => {
  const matchingRu = booksData.books.find(b => b.id === bookEn.id);
  const filename = getFilename(bookEn.id);
  
  // Привязываем правильный URL английской страницы
  bookEn.url = `/en/${filename}`;
  if (matchingRu && matchingRu.cover && !bookEn.cover) {
    bookEn.cover = matchingRu.cover;
  }
  if (!bookEn.cover) {
    bookEn.cover = '/img/cover_placeholder.jpg';
  }
  
  // Генерируем контент страницы книги на английском
  const contentEn = render(bookContentEnTemplate, {
    ...bookEn,
    year: bookEn.year || (matchingRu && matchingRu.year) || '2025',
    litresLink: bookEn.litresLink || (matchingRu && matchingRu.litresLink) || '',
    status: bookEn.status || 'planned',
    statusText: bookEn.statusText || (bookEn.status === 'available' ? '✅ Available (RU Edition)' : '📝 Planned')
  });
  
  const htmlEn = render(layoutEn, {
    ...bookEn,
    filename: filename,
    content: contentEn,
    seo: {
      title: `${bookEn.title} | Dmitry Antonov`,
      description: bookEn.annotation ? bookEn.annotation.slice(0, 160).replace(/"/g, '&quot;') : '',
      ogImage: `https://dimaa.ru${bookEn.cover || '/img/og-image.jpg'}`
    },
    footerQuote: '«The world is systemic. Runes are an architectural language to decode and guide its processes.»'
  });
  
  const destPath = path.join('./en', filename);
  fs.writeFileSync(destPath, htmlEn);
  console.log(`  ✅ ${destPath} сохранён`);
});

// Сохраняем обновленный books-en.json
fs.writeFileSync('./books-en.json', JSON.stringify(booksEnData, null, 2), 'utf8');
console.log('  ✅ books-en.json обновлён с корректными ссылками на /en/book*.html\n');

// ===== 3. ГЕНЕРАЦИЯ EN/BOOK4.HTML (Easter Egg / Explanation) =====
const book4HtmlEn = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>The Secret of Book 4 — Dmitry Antonov</title>
  <meta name="description" content="Why is there no Book 4 in the series 'Engineering Model of Reality'? The story behind the 7-day transition training.">
  <meta name="robots" content="noindex, follow">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/img/logo.png">
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
  <link rel="stylesheet" href="/style.css?v=202610">
  <link rel="canonical" href="https://dimaa.ru/en/book4.html">
  <link rel="alternate" hreflang="ru" href="https://dimaa.ru/book4.html">
  <link rel="alternate" hreflang="en" href="https://dimaa.ru/en/book4.html">
  <style>
    .container { max-width: 760px; margin: 0 auto; padding: 2rem 1.5rem; }
    .story-card { background: white; border-radius: 28px; padding: 2.5rem; border: 1px solid #e2ddd4; box-shadow: 0 4px 16px rgba(0,0,0,0.04); margin: 2rem 0; }
    h1 { font-size: 2rem; color: #1e3a2f; margin-bottom: 0.3rem; }
    .subtitle { color: #8a7f6d; font-size: 1rem; margin-bottom: 2rem; }
    p { line-height: 1.7; color: #2d3e3b; margin-bottom: 1.2rem; font-size: 1.02rem; }
    .highlight { background: #f7f4ef; border-left: 4px solid #b87c4f; padding: 1.2rem 1.5rem; border-radius: 12px; margin: 1.8rem 0; font-size: 1.05rem; color: #1e3a2f; }
    .btn-group { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 2rem; }
    .btn { display: inline-block; background: #1e3a2f; color: white; padding: 0.75rem 1.6rem; border-radius: 40px; text-decoration: none; font-weight: 500; font-size: 0.95rem; }
    .btn-outline { background: transparent; color: #1e3a2f; border: 1px solid #1e3a2f; }
  </style>
</head>
<body>
  <div class="container">
    <div class="story-card">
      <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🗝️</div>
      <h1>Why is there no "Book 4"?</h1>
      <div class="subtitle">Or rather, why it became Book 2.5: The Key to Mantic Practice</div>
      <p>Between Book 2 (Navigation) and Book 3 of mantics, I realized a direct jump was too steep. Readers understood the theoretical concepts, but needed a 7-day hands-on bridge before beginning direct question work.</p>
      <div class="highlight">
        "Knowledge without practice is fragile. The transition required an intensive intermediate Key."
      </div>
      <p>That intermediate bridge was published as <strong>Book 2.5: The Key to Mantic Practice</strong> (cataloged as Book 3 in the published sequence).</p>
      <div class="btn-group">
        <a href="/en/book25.html" class="btn">Explore Book 2.5 (The Key)</a>
        <a href="/en/#books" class="btn btn-outline">← Back to Books</a>
      </div>
    </div>
  </div>
</body>
</html>`;
fs.writeFileSync('./en/book4.html', book4HtmlEn);
console.log('  ✅ en/book4.html сохранён');

console.log('\n🎉 === ГЕНЕРАЦИЯ ВСЕХ СТРАНИЦ УСПЕШНО ЗАВЕРШЕНА ===\n');
