const fs = require('fs');
const path = require('path');

const replacements = [
  // 1. Landing Page — Hero Section — Add class: dark:bg-[#0a0f1e]
  {
    file: 'src/app/page.tsx',
    regex: /bg-\[\#0a0f1e\](?!\s+dark:bg-\[\#0a0f1e\])/g,
    replace: 'bg-[#0a0f1e] dark:bg-[#0a0f1e]'
  },
  // 2. Login Page — Ambient Glows — Add class: dark:bg-orange-600/8
  {
    file: 'src/app/login/page.tsx',
    regex: /bg-orange-600\/8(?!\s+dark:bg-orange-600\/8)/g,
    replace: 'bg-orange-600/8 dark:bg-orange-600/8'
  },
  {
    file: 'src/app/login/page.tsx',
    regex: /bg-blue-600\/8(?!\s+dark:bg-blue-600\/8)/g,
    replace: 'bg-blue-600/8 dark:bg-blue-600/8'
  },
  // 3. Register Page — Form Container — Add class: dark:bg-white/10
  {
    file: 'src/app/register/page.tsx',
    regex: /bg-white\/10(?!\s+dark:bg-white\/10)/g,
    replace: 'bg-white/10 dark:bg-white/10'
  },
  {
    file: 'src/app/register/page.tsx',
    regex: /border-white\/20(?!\s+dark:border-white\/20)/g,
    replace: 'border-white/20 dark:border-white/20'
  },
  // 4. Dashboard Layout — Notification Bell Badge — Add class: dark:bg-red-500
  {
    file: 'src/app/dashboard/layout.tsx',
    regex: /bg-red-500(?!\s+dark:bg-red-500)/g,
    replace: 'bg-red-500 dark:bg-red-500'
  },
  // 7. Ticket Detail — Card Border — Add class: dark:border-slate-800
  {
    file: 'src/app/dashboard/ticket/[id]/page.tsx',
    regex: /border-slate-200(?!\s+dark:border-slate-800)/g,
    replace: 'border-slate-200 dark:border-slate-800'
  },
  // 8. Staff Queue — Close All Button — Add class: dark:bg-slate-900/20 (on hover)
  {
    file: 'src/app/dashboard/staff/page.tsx',
    regex: /hover:bg-white(?!\s+dark:hover:bg-slate-900\/20)/g,
    replace: 'hover:bg-white dark:hover:bg-slate-900/20'
  },
  // 9. Knowledge Base — Badge Colours — Add class: dark:bg-blue-800
  {
    file: 'src/app/dashboard/kb/page.tsx',
    regex: /bg-blue-100(?!\s+dark:bg-blue-800)/g,
    replace: 'bg-blue-100 dark:bg-blue-800'
  },
  {
    file: 'src/app/dashboard/kb/page.tsx',
    regex: /text-blue-700(?!\s+dark:text-blue-100)/g,
    replace: 'text-blue-700 dark:text-blue-100'
  },
  // 11. Admin Analytics — Card Components — Add class: dark:text-white
  {
    file: 'src/app/dashboard/analytics/page.tsx',
    regex: /text-slate-900(?!\s+dark:text-white)/g,
    replace: 'text-slate-900 dark:text-white'
  }
];

replacements.forEach(({ file, regex, replace }) => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(regex, replace);

  // Deduplicate
  newContent = newContent.replace(/dark:border-slate-700\s+dark:border-slate-800/g, 'dark:border-slate-800');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${file}`);
  }
});

// 12. Global CSS — Navbar — Add class: dark:bg-slate-800
const cssPath = path.join(process.cwd(), 'src/app/globals.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('.dark .navbar-clay')) {
  cssContent = cssContent.replace(
    /\/\* Navbar \*\/\n\.navbar-clay \{/,
    "/* Navbar */\n.navbar-clay {\n"
  ).replace(
    /\.navbar-clay \{\n  background: transparent;\n  padding: 32px 48px;\n  color: white;\n\}/,
    `.navbar-clay {
  background: transparent;
  padding: 32px 48px;
  color: white;
}

.dark .navbar-clay {
  background: #1e293b;
}`
  );
  fs.writeFileSync(cssPath, cssContent);
  console.log('Updated src/app/globals.css');
}
