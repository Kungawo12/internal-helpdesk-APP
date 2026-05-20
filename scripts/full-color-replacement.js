const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/layout.tsx',
  'src/app/dashboard/create/page.tsx',
  'src/app/dashboard/staff/page.tsx',
  'src/app/dashboard/manager/page.tsx',
  'src/app/dashboard/kb/page.tsx',
  'src/app/dashboard/ticket/[id]/page.tsx',
  'src/app/dashboard/users/page.tsx',
  'src/app/dashboard/tickets/page.tsx',
  'src/app/dashboard/analytics/page.tsx',
  'src/app/dashboard/sla-policies/page.tsx',
  'src/app/dashboard/kb-manage/page.tsx',
  'src/app/dashboard/automation-rules/page.tsx',
  'src/app/dashboard/templates/page.tsx',
  'src/app/dashboard/profile/page.tsx',
  'src/app/page.tsx'
];

const replacements = [
  // Hardcoded hex colors
  [/text-\[\#6e6e73\](?!\s+dark:)/g, 'text-slate-500 dark:text-slate-400'],
  [/text-\[\#0f172a\](?!\s+dark:)/g, 'text-slate-900 dark:text-white'],
  [/text-\[\#475569\](?!\s+dark:)/g, 'text-slate-600 dark:text-slate-300'],
  [/text-\[\#374151\](?!\s+dark:)/g, 'text-slate-700 dark:text-slate-200'],
  [/border-black\/5(?!\s+dark:)/g, 'border-slate-100 dark:border-slate-700'],
  [/border-black\/10(?!\s+dark:)/g, 'border-slate-200 dark:border-slate-700'],
  [/hover:bg-\[\#fafafa\](?!\s+dark:)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800'],
  [/hover:bg-\[\#f5f5f7\](?!\s+dark:)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800'],
  [/bg-\[\#f5f5f7\](?!\s+dark:)/g, 'bg-slate-50 dark:bg-slate-800'],
  [/bg-\[\#f8fafc\](?!\s+dark:)/g, 'bg-[#f8fafc] dark:bg-slate-900'],

  // Standard Tailwind Classes
  [/text-slate-900(?!\s+dark:text-)/g, 'text-slate-900 dark:text-white'],
  [/text-slate-600(?!\s+dark:text-)/g, 'text-slate-600 dark:text-slate-300'],
  [/text-slate-500(?!\s+dark:text-)/g, 'text-slate-500 dark:text-slate-400'], // Fallback if missed earlier
  [/text-slate-400(?!\s+dark:text-)/g, 'text-slate-400 dark:text-slate-500'],
  
  [/bg-white(?!\s+dark:bg-)/g, 'bg-white dark:bg-slate-800'], // Card bg default
  [/border-slate-200(?!\s+dark:border-)/g, 'border-slate-200 dark:border-slate-700'],
  [/hover:bg-slate-50(?!\s+dark:hover:bg-)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800'],
  [/border-slate-100(?!\s+dark:border-)/g, 'border-slate-100 dark:border-slate-800']
];

targetFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // First pass: replace hardcoded classes
  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  
  // Specific fix for Dashboard Layout bg-white to dark:bg-slate-900 (it's the main container, not a card)
  if (file === 'src/app/dashboard/layout.tsx') {
    content = content.replace(/bg-\[\#f8fafc\] dark:bg-slate-800/g, 'bg-[#f8fafc] dark:bg-slate-900');
  }

  // Specific fix for landing page bg-white to dark:bg-slate-900
  if (file === 'src/app/page.tsx') {
    content = content.replace(/bg-white dark:bg-slate-800/g, 'bg-white dark:bg-slate-900');
  }

  // Deduplicate
  const prefixes = [
    'dark:text-', 'dark:bg-', 'dark:border-', 'dark:hover:bg-', 'dark:placeholder:text-'
  ];

  prefixes.forEach(prefix => {
    const regex = new RegExp(`(${prefix}[A-Za-z0-9-\\/]+)\\s+(${prefix}[A-Za-z0-9-\\/]+)`, 'g');
    let prev = '';
    while (content !== prev) {
      prev = content;
      content = content.replace(regex, '$2');
    }
  });

  // Second deduplicate pass just in case
  prefixes.forEach(prefix => {
    const regex = new RegExp(`(${prefix}[A-Za-z0-9-\\/]+)\\s+(${prefix}[A-Za-z0-9-\\/]+)`, 'g');
    content = content.replace(regex, '$2');
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
