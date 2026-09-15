#!/usr/bin/env node
/**
 * Скрипт для автоматической замены PostgreSQL placeholders ($1, $2, etc) на MySQL (?)
 */

const fs = require('fs');
const path = require('path');

const files = [
  'src/lib/auth.ts',
  'src/lib/db-helpers.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/verify-email/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/categories/route.ts',
];

function convertPlaceholders(content) {
  // Заменяем $1, $2, $3 и т.д. на ?
  // Важно: делаем это в правильном порядке (от большего к меньшему)
  const matches = content.match(/\$\d+/g);
  if (!matches) return content;
  
  // Получаем уникальные номера и сортируем по убыванию
  const uniqueNumbers = [...new Set(matches.map(m => parseInt(m.substring(1))))]
    .sort((a, b) => b - a);
  
  let result = content;
  uniqueNumbers.forEach(num => {
    result = result.replace(new RegExp(`\\$${num}(?!\\d)`, 'g'), '?');
  });
  
  return result;
}

console.log('🔄 Converting PostgreSQL placeholders to MySQL...\n');

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const converted = convertPlaceholders(content);
    
    if (content !== converted) {
      fs.writeFileSync(filePath, converted, 'utf8');
      console.log(`✅ Converted: ${file}`);
    } else {
      console.log(`⏭️  No changes: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✨ Conversion complete!');
