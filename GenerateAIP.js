const fs = require('fs');
const path = require('path');

const getCategory = (fileName) => {
    if (fileName.includes('ADC') || fileName.includes('APDC')) {
        return 'Ground';
    } else if (fileName.includes('IAC')) {
        return 'Approach';
    } else if (fileName.includes('SID')) {
        return 'SID';
    } else if (fileName.includes('STAR')) {
        return 'STAR';
    }
    return null;
};

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
        } else if (path.extname(item).toLowerCase() === '.pdf') {
            const category = getCategory(item);
            structure.push({
                name: item,
                type: 'file',
                url: path.join('/', path.relative(basePath, fullPath)),
                category: category
            });
        }
    });

    return structure;
};

const directoryPath = "./public/AIP";
const directoryStructure = getDirectoryStructure(directoryPath, directoryPath);

fs.writeFileSync('app/aip.json', JSON.stringify(directoryStructure, null, 2), 'utf-8');

console.log('saved to app/aip.json');
