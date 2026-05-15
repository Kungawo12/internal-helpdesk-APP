const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.css')) {
        callback(path.join(dir, f));
      }
    }
  });
}

walkDir(path.join(process.cwd(), 'src'), (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix Problem 3: Duplicate dark: classes (text-slate-500 dark:text-slate-500 -> dark:text-slate-400)
  content = content.replace(/dark:text-slate-500/g, 'dark:text-slate-400');

  // Fix Problem 5: Special case: pages with dark-only full backgrounds
  // Change bg-slate-900 rounded-3xl p-8 to bg-white dark:bg-slate-900 rounded-3xl p-8
  if (filePath.includes('admin') || filePath.includes('dashboard')) {
      content = content.replace(/"bg-slate-900 rounded-3xl/g, '"bg-white dark:bg-slate-900 rounded-3xl');
  }

  // Deduplicate again just in case there are multiple dark:text-slate-400 now
  content = content.replace(/dark:text-slate-400\s+dark:text-slate-400/g, 'dark:text-slate-400');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
