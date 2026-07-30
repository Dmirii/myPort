// scripts/generate-books.js
const fs = require('fs');
const path = require('path');

// ===== ФУНКЦИЯ ДЛЯ ЗАМЕНЫ ПЛЕЙСХОЛДЕРОВ =====
function render(template, data) {
  let result = template;
  
  // 1. Простые замены {{key}}
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string') {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  });
  
  // 2. Массивы {{#each key}}...{{/each}}
  result = result.replace(/\{\{#each (.*?)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, inner) => {
    const items = data[key] || [];
    return items.map(item => {
      let itemHtml = inner;
      // Заменяем {{this.url}} и {{this.label}} внутри цикла
      Object.keys(item).forEach(subKey => {
        itemHtml = itemHtml.replace(new RegExp(`{{this\\.${subKey}}}`, 'g'), item[subKey]);
      });
      // Заменяем просто {{this}} для простых массивов (строки)
      if (typeof item === 'string') {
        itemHtml = itemHtml.replace(/\{\{this\}\}/g, item);
      }
      return itemHtml;
    }).join('');
  });
  
  // 3. Вставка контента {{{content}}}
  result = result.replace(/\{\{\{content\}\}\}/g, data.content || '');
  
  return result;
}

// ===== ЗАГРУЖАЕМ ДАННЫЕ =====
console.log('📖 Загружаем данные...');

const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
const menuData = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));

const layout = fs.readFileSync('./templates/layout.html', 'utf8');
const bookContentTemplate = fs.readFileSync('./templates/book-content.html', 'utf8');

// ===== МАППИНГ ДЛЯ ВСЕХ КНИГ (ИСПРАВЛЕННЫЙ) =====
const filenameMap = {
  0: 'book0.html',   // книга 0 → book0.html (если понадобится)
  1: 'book1.html',   // книга 1 → book1.html
  2: 'book2.html',   // книга 2 → book2.html
  3: 'book25.html',  // книга 3 → book25.html
  4: 'book3.html',   // книга 4 → book3.html
  5: 'book5.html',   // книга 5 → book5.html
  6: 'book6.html'    // книга 6 → book6.html
};

// ===== ГЕНЕРИРУЕМ КАЖДУЮ КНИГУ =====
console.log('📚 Генерируем страницы книг...');

booksData.books.forEach(book => {
  // Пропускаем книгу 0, если она есть (можно убрать эту проверку, если хотите генерировать book0.html)
  if (book.id === 0) return;
  
  // 1. Генерируем уникальный контент для этой книги
  const content = render(bookContentTemplate, {
    ...book,
    year: book.year || '2025',
    litresLink: book.litresLink || '#',
    status: book.status || 'planned',
    statusText: book.statusText || '📝 Планируется'
  });
  
  // 2. Определяем имя файла из маппинга
  const filename = filenameMap[book.id] || `book${book.id}.html`;
  
  // 3. Собираем полную страницу
  const html = render(layout, {
    ...book,
    filename: filename,
    content: content,
    menu: menuData.menu,
    seo: book.seo || {
      title: `${book.title} | Дмитрий Антонов`,
      description: book.annotation?.slice(0, 160) || '',
      ogImage: `https://dimaa.ru${book.cover || '/img/logo.jpeg'}`
    },
    footerQuote: book.footerQuote || '«Мир устроен системно. Руны — это способ увидеть и настроить его процессы»'
  });
  
  // 4. Сохраняем файл
  fs.writeFileSync(filename, html);
  console.log(`  ✅ ${filename} (${book.title})`);
});

console.log('🎉 Все страницы книг сгенерированы!');
console.log('📁 Всего книг:', booksData.books.filter(b => b.id !== 0).length);
