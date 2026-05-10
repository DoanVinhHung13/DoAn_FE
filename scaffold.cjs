const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const pagesToCreate = {
  'ADMIN': ['Dashboard', 'JournalManagement', 'Inventory', 'UserManagement', 'FormTemplate', 'Supplies'],
  'USER': ['Dashboard', 'Journal', 'ProductionProcess', 'Warehouse'],
  'ANONYMOUS': [], // Using the generic ones we already created
};

for (const [module, pages] of Object.entries(pagesToCreate)) {
  for (const page of pages) {
    const dir = path.join(srcDir, 'pages', module, page);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, 'index.jsx');
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `import React from 'react';\n\nconst ${page} = () => {\n  return <div>${page} Page</div>;\n};\n\nexport default ${page};\n`);
    }
  }
}

console.log("Scaffold complete");
