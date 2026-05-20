const fs = require('fs');
const path = require('path');

const dashboardFiles = [
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/create/page.tsx',
  'src/app/dashboard/staff/page.tsx',
  'src/app/dashboard/kb/page.tsx',
  'src/app/dashboard/ticket/[id]/page.tsx',
  'src/app/dashboard/manager/page.tsx'
];

dashboardFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Regex to match "dark:something dark:something_else" and keep the second one
  // Note: we want to match exact prefixes like dark:text-, dark:bg-, dark:border-, dark:hover:bg-

  const prefixes = [
    'dark:text-',
    'dark:bg-',
    'dark:border-',
    'dark:hover:bg-',
    'dark:placeholder:text-'
  ];

  prefixes.forEach(prefix => {
    // Regex: match the prefix, followed by non-space chars, space(s), the same prefix, followed by non-space chars
    // Keep only the second one.
    // e.g. dark:text-slate-400 dark:text-white -> dark:text-white
    const regex = new RegExp(`(${prefix}[A-Za-z0-9-\\/]+)\\s+(${prefix}[A-Za-z0-9-\\/]+)`, 'g');
    
    // We might have multiple in a row, so run it a few times until stable
    let prev = '';
    while (content !== prev) {
      prev = content;
      content = content.replace(regex, '$2');
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
