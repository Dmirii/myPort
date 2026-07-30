// scripts/generate-books.js
const fs = require('fs');

console.log('🚀 === ЗАПУСК ГЕНЕРАТОРА С ОТЛАДКОЙ ===\n');

// ===== 1. ЗАГРУЖАЕМ ДАННЫЕ =====
console.log('📖 1. Загружаем JSON...');

const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
console.log(`  ✅ books.json загружен, книг: ${booksData.books.length}`);

const menuData = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));
console.log(`  ✅ menu.json загружен\n`);

// ===== 2. ЗАГРУЖАЕМ ШАБЛОНЫ =====
console.log('📝 2. Загружаем шаблоны...');

const layout = fs.readFileSync('./templates/layout.html', 'utf8');
console.log(`  ✅ layout.html загружен (${layout.length} символов)`);

const bookContentTemplate = fs.readFileSync('./templates/book-content.html', 'utf8');
console.log(`  ✅ book-content.html загружен (${bookContentTemplate.length} символов)\n`);

// ===== 3. МАППИНГ ФАЙЛОВ =====
const filenameMap = {
  1: 'book1.html',
  2: 'book2.html',
  3: 'book25.html',
  4: 'book3.html',
  5: 'book5.html',
  6: 'book6.html'
};

// ===== 4. ПРОСТАЯ ФУНКЦИЯ ЗАМЕНЫ =====
function replaceAll(template, data) {
  let result = template;
  
  // Простые замены
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string') {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  });
  
  // Массивы
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

// ===== 5. ГЕНЕРИРУЕМ КНИГИ =====
console.log('📚 3. Генерируем страницы книг...\n');

booksData.books.forEach(book => {
  // Пропускаем книгу 0
  if (book.id === 0) {
    console.log(`  ⏭️ Пропускаем: ${book.title}`);
    return;
  }
  
  const filename = filenameMap[book.id] || `book${book.id}.html`;
  
  console.log(`  📖 Обработка: ${book.title} (id: ${book.id})`);
  console.log(`     → файл: ${filename}`);
  console.log(`     → page.intro: ${book.page?.intro ? '✅ есть' : '❌ НЕТ'}`);
  console.log(`     → page.description: ${book.page?.description ? '✅ есть' : '❌ НЕТ'}`);
  console.log(`     → page.audience: ${book.page?.audience?.length > 0 ? '✅ есть (' + book.page.audience.length + ' элементов)' : '❌ НЕТ'}`);
  
  // Генерируем контент книги
  const content = replaceAll(bookContentTemplate, {
    ...book,
    year: book.year || '2025',
    litresLink: book.litresLink || '#',
    status: book.status || 'planned',
    statusText: book.statusText || '📝 Планируется'
  });
  
  // Проверяем, остались ли плейсхолдеры в контенте
  const hasPlaceholders = content.includes('{{');
  console.log(`     → плейсхолдеры в контенте: ${hasPlaceholders ? '❌ ЕСТЬ' : '✅ НЕТ'}`);
  
  // Собираем полную страницу
  const html = replaceAll(layout, {
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
  
  // Проверяем, остались ли плейсхолдеры в финальном HTML
  const finalHasPlaceholders = html.includes('{{');
  console.log(`     → плейсхолдеры в финальном HTML: ${finalHasPlaceholders ? '❌ ЕСТЬ' : '✅ НЕТ'}`);
  
  if (finalHasPlaceholders) {
    const remaining = html.match(/\{\{[^}]*\}\}/g);
    console.log(`     → оставшиеся: ${remaining?.join(', ') || 'нет'}`);
  }
  
  // Сохраняем файл
  fs.writeFileSync(filename, html);
  console.log(`  ✅ ${filename} сохранён\n`);
});

console.log('🎉 === ГЕНЕРАЦИЯ ЗАВЕРШЕНА ===');
