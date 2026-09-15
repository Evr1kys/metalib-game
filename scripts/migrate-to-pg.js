#!/usr/bin/env node

/**
 * Скрипт для замены Prisma на pg во всех API файлах
 */

const fs = require('fs');
const path = require('path');

const filesToMigrate = [
  'src/app/api/products/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/orders/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/admin/stats/route.ts',
  'src/app/api/auth/send-verification/route.ts',
  'src/app/api/tickets/route.ts',
  'src/app/api/tickets/[id]/route.ts',
  'src/app/api/balance/route.ts',
  'src/app/api/referrals/route.ts',
  'src/app/api/payments/create/route.ts',
  'src/app/api/payments/webhook/route.ts',
  'src/app/api/payments/callback/route.ts',
  'src/app/api/admin/sync-nsgifts/route.ts',
  'src/app/api/admin/settings/route.ts',
  'src/app/api/admin/categories/route.ts',
  'src/app/api/admin/categories/[id]/route.ts',
  'src/app/api/auth/2fa/setup/route.ts',
  'src/app/api/auth/2fa/enable/route.ts',
  'src/app/api/auth/2fa/disable/route.ts',
  'src/app/api/auth/2fa/status/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/users/[id]/route.ts',
  'src/app/api/admin/settings-manage/route.ts',
  'src/app/api/admin/transactions/route.ts',
  'src/app/api/categories/route.ts',
  'src/app/api/admin/tickets/route.ts',
  'src/app/api/favorites/route.ts',
  'src/app/api/orders/steam-topup/route.ts',
  'src/app/api/orders/[id]/pay-balance/route.ts',
  'src/app/api/admin/products/route.ts',
  'src/app/api/admin/products/[id]/route.ts',
  'src/app/api/admin/tickets/[id]/route.ts',
  'src/app/api/admin/newsletter/stats/route.ts',
  'src/app/api/admin/newsletter/send/route.ts',
  'src/app/api/admin/steam-settings/route.ts',
];

const projectRoot = path.join(__dirname, '..');

filesToMigrate.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Файл не найден: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  
  // Заменяем импорт prisma на query
  if (content.includes("import { prisma } from '@/lib/prisma'")) {
    content = content.replace(
      "import { prisma } from '@/lib/prisma'",
      "import { query } from '@/lib/db'"
    );
    
    // Бэкап
    fs.writeFileSync(fullPath + '.backup', fs.readFileSync(fullPath));
    
    // Сохраняем
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Обновлён: ${filePath}`);
  } else {
    console.log(`⏭️  Пропущен (нет импорта prisma): ${filePath}`);
  }
});

console.log('\n✨ Импорты обновлены! Теперь нужно вручную переписать каждый prisma запрос на SQL.');
console.log('🔍 Используйте grep для поиска: grep -r "prisma\\." src/app/api/');
