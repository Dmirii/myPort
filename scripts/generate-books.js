// scripts/generate-books.js
const fs = require('fs');

// ===== ЗАГРУЖАЕМ ДАННЫЕ =====
console.log('📖 Загружаем данные...');

const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
const menuData = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));

const layout = fs.readFileSync('./templates/layout.html', 'utf8');
const bookContent = fs.readFileSync('./templates/book-content.html', 'utf8');

// ===== МАППИНГ ФАЙЛОВ =====
const filenameMap = {
  1: 'book1.html',
  2: 'book2.html',
  3: 'book25.html',
  4: 'book3.html',
  5: 'book5.html',
  6: 'book6.html'
};

// ===== ФУНКЦИЯ ПРОСТОЙ ЗАМЕНЫ =====
function replaceAll(text, data) {
  let result = text;
  
  // Простые замены
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string') {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  });
  
  // Обработка массивов
  result = result.replace(/\{\{#each (.*?)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, inner) => {
    const items = data[key] || [];
    return items.map(item => {
      let html = inner;
      if (typeof item === 'string') {
        html = html.replace(/\{\{this\}\}/g, item);
      } else {
        Object.keys(item).forEach(subKey => {
          html = html.replace(new RegExp(`{{this\\.${subKey}}}`, 'g'), item[subKey]);
        });
      }
      return html;
    }).join('');
  });
  
  // Вставка контента
  result = result.replace(/\{\{\{content\}\}\}/g, data.content || '');
  
  return result;
}

// ===== ГЕНЕРИРУЕМ КАЖДУЮ КНИГУ =====
console.log('📚 Генерируем страницы книг...');

booksData.books.forEach(book => {
  if (book.id === 0) return;
  
  const filename = filenameMap[book.id] || `book${book.id}.html`;
  
  // 1. Готовим контент книги
  const contentHtml = replaceAll(bookContent, {
    ...book,
    year: book.year || '2025',
    litresLink: book.litresLink || '#',
    status: book.status || 'planned',
    statusText: book.statusText || '📝 Планируется'
  });
  
  // 2. Готовим полную страницу
  const fullHtml = replaceAll(layout, {
    ...book,
    filename: filename,
    content: contentHtml,
    menu: menuData.menu,
    seo: book.seo || {
      title: `${book.title} | Дмитрий Антонов`,
      description: book.annotation?.slice(0, 160) || '',
      ogImage: `https://dimaa.ru${book.cover || '/img/logo.jpeg'}`
    },
    footerQuote: book.footerQuote || '«Мир устроен системно. Руны — это способ увидеть и настроить его процессы»'
  });
  
  // 3. Сохраняем
  fs.writeFileSync(filename, fullHtml);
  console.log(`  ✅ ${filename} (${book.title})`);
});

console.log('🎉 Все страницы книг сгенерированы!');
