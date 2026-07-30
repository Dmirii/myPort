// scripts/generate-books.js
const fs = require('fs');

console.log('🚀 === ЗАПУСК ГЕНЕРАТОРА ===\n');

// ===== ЗАГРУЖАЕМ ДАННЫЕ =====
const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
const menuData = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));

const layout = fs.readFileSync('./templates/layout.html', 'utf8');
const bookContentTemplate = fs.readFileSync('./templates/book-content.html', 'utf8');

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

// ===== ФУНКЦИЯ ЗАМЕНЫ (ПОДДЕРЖИВАЕТ {{#each}} И {{#if}}) =====
function render(template, data) {
  let result = template;
  
  // 1. Обработка {{#each array}}...{{/each}}
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
  
  // 2. Обработка {{#if condition}}...{{/if}}
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
    // Если значение существует, не пустое, не false — показываем inner
    if (current !== null && current !== undefined && current !== false && current !== '') {
      return inner;
    }
    return '';
  });
  
  // 3. Простые замены {{key}}
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string') {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  });
  
  // 4. Вставка контента {{{content}}}
  result = result.replace(/\{\{\{content\}\}\}/g, data.content || '');
  
  return result;
}

// ===== ГЕНЕРИРУЕМ КАЖДУЮ КНИГУ =====
console.log('📚 Генерируем страницы книг...\n');

booksData.books.forEach(book => {
  if (book.id === 0) return;
  
  const filename = filenameMap[book.id] || `book${book.id}.html`;
  
  console.log(`  📖 ${book.title} → ${filename}`);
  
  // 1. Генерируем контент книги
  const content = render(bookContentTemplate, {
    ...book,
    year: book.year || '2025',
    litresLink: book.litresLink || '#',
    status: book.status || 'planned',
    statusText: book.statusText || '📝 Планируется'
  });
  
  // 2. Собираем полную страницу
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
  
  // 3. Сохраняем файл
  fs.writeFileSync(filename, html);
  console.log(`  ✅ ${filename} сохранён\n`);
});

console.log('🎉 === ГЕНЕРАЦИЯ ЗАВЕРШЕНА ===');
