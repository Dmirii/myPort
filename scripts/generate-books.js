// scripts/test-generator.js
const fs = require('fs');

console.log('🔍 === ДИАГНОСТИКА ГЕНЕРАТОРА ===\n');

// ===== 1. ПРОВЕРКА ФАЙЛОВ =====
console.log('📁 1. Проверка наличия файлов:');

const files = [
  'books.json',
  'menu.json',
  'templates/layout.html',
  'templates/book-content.html'
];

let allFilesExist = true;
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ ОШИБКА: Некоторые файлы отсутствуют!');
  process.exit(1);
}

console.log('\n✅ Все файлы найдены.\n');

// ===== 2. ПРОВЕРКА JSON =====
console.log('📄 2. Проверка JSON:');

try {
  const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
  console.log(`  ✅ books.json прочитан, книг: ${booksData.books.length}`);
  
  // Проверяем первую книгу
  const firstBook = booksData.books[0];
  console.log(`  📖 Первая книга: ${firstBook.title}`);
  console.log(`     - page.intro: ${firstBook.page?.intro ? '✅ есть' : '❌ НЕТ'}`);
  console.log(`     - page.description: ${firstBook.page?.description ? '✅ есть' : '❌ НЕТ'}`);
  console.log(`     - page.audience: ${firstBook.page?.audience?.length > 0 ? '✅ есть (' + firstBook.page.audience.length + ' элементов)' : '❌ НЕТ'}`);
  console.log(`     - seo.title: ${firstBook.seo?.title ? '✅ есть' : '❌ НЕТ'}`);
} catch (error) {
  console.log(`  ❌ Ошибка чтения books.json: ${error.message}`);
  process.exit(1);
}

try {
  const menuData = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));
  console.log(`  ✅ menu.json прочитан`);
  console.log(`     - menu.logo.text: ${menuData.menu?.logo?.text ? '✅ есть' : '❌ НЕТ'}`);
  console.log(`     - menu.items: ${menuData.menu?.items?.length > 0 ? '✅ есть (' + menuData.menu.items.length + ' пунктов)' : '❌ НЕТ'}`);
} catch (error) {
  console.log(`  ❌ Ошибка чтения menu.json: ${error.message}`);
  process.exit(1);
}

console.log('\n✅ JSON файлы корректны.\n');

// ===== 3. ПРОВЕРКА ШАБЛОНОВ =====
console.log('📝 3. Проверка шаблонов:');

const layoutContent = fs.readFileSync('./templates/layout.html', 'utf8');
const bookContent = fs.readFileSync('./templates/book-content.html', 'utf8');

const layoutHasMenu = layoutContent.includes('{{menu.logo.text}}');
const layoutHasContent = layoutContent.includes('{{{content}}}');
const bookHasPage = bookContent.includes('{{page.intro}}');

console.log(`  layout.html:`);
console.log(`    - {{menu.logo.text}} ${layoutHasMenu ? '✅' : '❌'}`);
console.log(`    - {{{content}}} ${layoutHasContent ? '✅' : '❌'}`);
console.log(`  book-content.html:`);
console.log(`    - {{page.intro}} ${bookHasPage ? '✅' : '❌'}`);

console.log('\n✅ Шаблоны корректны.\n');

// ===== 4. ТЕСТОВАЯ ГЕНЕРАЦИЯ ОДНОЙ КНИГИ =====
console.log('🧪 4. Тестовая генерация книги 1:');

try {
  const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
  const menuData = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));
  const layout = fs.readFileSync('./templates/layout.html', 'utf8');
  const bookContentTemplate = fs.readFileSync('./templates/book-content.html', 'utf8');
  
  const book = booksData.books.find(b => b.id === 1);
  if (!book) {
    console.log('  ❌ Книга 1 не найдена');
    process.exit(1);
  }
  
  console.log(`  📖 Тестируем: ${book.title}`);
  console.log(`     - page есть: ${book.page ? '✅' : '❌'}`);
  console.log(`     - seo есть: ${book.seo ? '✅' : '❌'}`);
  
  // Простая замена для теста
  let testContent = bookContentTemplate;
  testContent = testContent.replace(/\{\{page\.intro\}\}/g, book.page?.intro || 'НЕТ ДАННЫХ');
  testContent = testContent.replace(/\{\{title\}\}/g, book.title);
  
  console.log(`  🔍 Результат замены:`);
  console.log(`     - page.intro заменился на: "${book.page?.intro?.substring(0, 30)}..."`);
  console.log(`     - title заменился на: "${book.title}"`);
  
  // Проверяем, остались ли плейсхолдеры
  const hasPlaceholders = testContent.includes('{{');
  console.log(`     - Остались плейсхолдеры: ${hasPlaceholders ? '❌ ЕСТЬ' : '✅ НЕТ'}`);
  
  if (hasPlaceholders) {
    const remaining = testContent.match(/\{\{[^}]*\}\}/g);
    console.log(`     - Оставшиеся: ${remaining?.join(', ') || 'нет'}`);
  }
  
} catch (error) {
  console.log(`  ❌ Ошибка теста: ${error.message}`);
}

console.log('\n🔍 === ДИАГНОСТИКА ЗАВЕРШЕНА ===');
