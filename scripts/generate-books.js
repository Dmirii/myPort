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
  1: 'book1.html',
  2: 'book2.html',
  3: 'book25.html',
  4: 'book3.html',
  5: 'book5.html',
  6: 'book6.html'
};

// ===== ФУНКЦИЯ ЗАМЕНЫ С ПОДДЕРЖКОЙ ВЛОЖЕННЫХ ОБЪЕКТОВ =====
function render(template, data) {
  let result = template;
  
  // 1. Рекурсивная замена для вложенных объектов
  function replaceDeep(obj, prefix = '') {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        // Заменяем {{path}}
        result = result.replace(new RegExp(`{{${path}}}`, 'g'), value);
      } else if (Array.isArray(value)) {
        // Обработка массивов {{#each path}}...{{/each}}
        result = result.replace(new RegExp(`\\{\\{#each ${path}\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}`, 'g'), (match, inner) => {
          return value.map(item => {
            let itemHtml = inner;
            if (typeof item === 'string') {
              itemHtml = itemHtml.replace(/\{\{this\}\}/g, item);
            } else {
              Object.keys(item).forEach(subKey => {
                itemHtml = itemHtml.replace(new RegExp(`{{this\\.${subKey}}}`, 'g'), item[subKey]);
              });
            }
            return itemHtml;
          }).join('');
        });
      } else if (typeof value === 'object' && value !== null) {
        // Рекурсивно обрабатываем вложенные объекты
        replaceDeep(value, path);
      }
    });
  }
  
  // 2. Заменяем все переменные
  replaceDeep(data);
  
  // 3. Вставка контента {{{content}}}
  result = result.replace(/\{\{\{content\}\}\}/g, data.content || '');
  
  return result;
}

// ===== ГЕНЕРИРУЕМ КАЖДУЮ КНИГУ =====
console.log('📚 Генерируем страницы книг...\n');

booksData.books.forEach(book => {
  if (book.id === 0) {
    console.log(`  ⏭️ Пропускаем: ${book.title}`);
    return;
  }
  
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
