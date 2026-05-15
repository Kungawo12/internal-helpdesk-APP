const fs = require('fs');
const path = require('path');

const adminFiles = [
  'src/app/dashboard/users/page.tsx',
  'src/app/dashboard/tickets/page.tsx',
  'src/app/dashboard/analytics/page.tsx',
  'src/app/dashboard/sla-policies/page.tsx',
  'src/app/dashboard/kb-manage/page.tsx',
  'src/app/dashboard/automation-rules/page.tsx',
  'src/app/dashboard/templates/page.tsx'
];

// In order of longest to shortest to avoid partial replacements
const replacements = [
  // Inputs
  [/bg-white\/5\s+border\s+border-white\/10\s+text-white\s+placeholder:text-white\/30/g, 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30'],
  
  // Backgrounds
  [/bg-slate-900(?!\s*dark:bg-)/g, 'bg-white dark:bg-slate-900'],
  [/bg-slate-800(?!\s*dark:bg-)/g, 'bg-slate-50 dark:bg-slate-800'],
  [/bg-white\/5(?!\s*dark:bg-)/g, 'bg-slate-100 dark:bg-white/5'],
  [/bg-white\/3(?!\s*dark:bg-)/g, 'bg-slate-50 dark:bg-white/3'],
  
  // Borders
  [/border-white\/10(?!\s*dark:border-)/g, 'border-slate-200 dark:border-white/10'],
  [/border-white\/8(?!\s*dark:border-)/g, 'border-slate-100 dark:border-white/8'],
  [/border-white\/5(?!\s*dark:border-)/g, 'border-slate-100 dark:border-white/5'],

  // Text
  [/text-white\/40(?!\s*dark:text-)/g, 'text-slate-400 dark:text-white/40'],
  [/text-white\/30(?!\s*dark:text-)/g, 'text-slate-400 dark:text-white/30'],
  [/text-white(?!\s*dark:text-|[\/\w])/g, 'text-slate-900 dark:text-white'], // Match text-white but not text-white/50 or text-white-something
];

adminFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
