const fs = require('fs');
const path = require('path');

const getDirectoryStructure = (dirPath, basePath) => {
    const items = fs.readdirSync(dirPath);
    const structure = [];

    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            structure.push({
                name: item,
                type: 'directory',
                children: getDirectoryStructure(fullPath, basePath)
            });
        } else {
            structure.push({
                name: item,
                type: 'file',
                url: path.join('/', path.relative(basePath, fullPath))
            });
        }
    });

    return structure;
};

const directoryPath = "./public/AIP";
const directoryStructure = getDirectoryStructure(directoryPath, directoryPath);

fs.writeFileSync('app/aip.json', JSON.stringify(directoryStructure, null, 2), 'utf-8');

console.log('saved to app/aip.json');
