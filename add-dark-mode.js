const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/staff/page.tsx',
  'src/app/dashboard/manager/page.tsx',
  'src/app/dashboard/kb/page.tsx',
  'src/app/dashboard/ticket/[id]/page.tsx',
  'src/app/dashboard/create/page.tsx'
];

const replacements = [
  [/text-slate-900(?!\sdark:)/g, 'text-slate-900 dark:text-white'],
  [/text-slate-800(?!\sdark:)/g, 'text-slate-800 dark:text-slate-200'],
  [/text-slate-700(?!\sdark:)/g, 'text-slate-700 dark:text-slate-300'],
  [/text-slate-600(?!\sdark:)/g, 'text-slate-600 dark:text-slate-400'],
  [/text-slate-500(?!\sdark:)/g, 'text-slate-500 dark:text-slate-400'],
  [/text-slate-400(?!\sdark:)/g, 'text-slate-400 dark:text-slate-500'],
  [/bg-slate-50(?!\sdark:)/g, 'bg-slate-50 dark:bg-slate-800/50'],
  [/bg-slate-100(?!\sdark:)/g, 'bg-slate-100 dark:bg-slate-800'],
  [/border-slate-100(?!\sdark:)/g, 'border-slate-100 dark:border-slate-800'],
  [/border-slate-200(?!\sdark:)/g, 'border-slate-200 dark:border-slate-700'],
  [/hover:bg-\[\#fafafa\](?!\sdark:)/g, 'hover:bg-[#fafafa] dark:hover:bg-slate-800/50'],
  [/bg-white(?!\s*dark:bg-)/g, 'bg-white dark:bg-slate-900']
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  // Fix up some common double-dark classes from multiple runs
  content = content.replace(/dark:text-white dark:text-white/g, 'dark:text-white');
  content = content.replace(/dark:bg-slate-900\/60/g, 'dark:bg-slate-900/60');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
