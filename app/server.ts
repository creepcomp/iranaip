"use server";

import data from "./aip.json";

interface DirectoryItem {
    name: string;
    type: string;
    url?: string;
    children?: DirectoryItem[];
}

export async function getFilesAndDirectories(dirPath: string): Promise<DirectoryItem[]> {
    dirPath = decodeURIComponent(dirPath);
    
    if (!dirPath) {
        return (data as DirectoryItem[]).filter(item => item.type === 'directory');
    }

    const pathParts = dirPath.split('/').filter(Boolean);
    let currentLevel = data as DirectoryItem[];

    for (const part of pathParts) {
        const foundDirectory = currentLevel.find(item => item.type === 'directory' && item.name === part);
        if (!foundDirectory || !foundDirectory.children) {
            return [];
        }
        currentLevel = foundDirectory.children;
    }

    return currentLevel;
}