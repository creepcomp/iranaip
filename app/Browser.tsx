'use client';

import React, { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemText, IconButton, Button, Drawer, Typography, AppBar, Toolbar, createTheme, ThemeProvider, CssBaseline, Box, ListItemButton, Checkbox, Avatar } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon, Menu as MenuIcon, WbSunny as SunIcon, Bedtime as MoonIcon, Folder as FolderIcon, Description as FileIcon } from '@mui/icons-material';
import { getFilesAndDirectories } from './server';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface Item {
    name: string;
    type: string;
    url?: string;
    children?: Item[];
    category?: string;
}

const drawerWidth = 400;

export default function Browser({ path }: { path: string }) {
    const [items, setItems] = useState<Item[]>([]);
    const [favorites, setFavorites] = useState<Item[]>([]);
    const [selected, setSelected] = useState<Item | undefined>();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
    const [mainDrawer, setMainDrawer] = useState<boolean>(true);
    const [favoritesDrawer, setFavoritesDrawer] = useState<boolean>(false);

    useEffect(() => {
        const theme = Cookies.get('theme');
        if (theme === 'light' || theme === 'dark') setThemeMode(theme);

        const fetchDirectories = async () => {
            const data = await getFilesAndDirectories(path);
            setItems(data);
        };
        fetchDirectories();

        const savedFavorites = Cookies.get('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, [path]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [items]);

    const toggleTheme = () => {
        const newTheme = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newTheme);
        Cookies.set('theme', newTheme);
    };

    const toggleFavorite = (item: Item) => {
        setFavorites(prev => {
            const favorites = prev.some(fav => fav === item) ? prev.filter(fav => fav !== item) : [...prev, item];
            Cookies.set('favorites', JSON.stringify(favorites));
            return favorites;
        });
    };

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
            setSelected(prev => {
                if (!prev) return items[0];
                const currentIndex = items.findIndex(item => item.name === prev.name);
                const nextIndex = (currentIndex + 1) % items.length;
                return items[nextIndex];
            });
        } else if (event.key === 'ArrowLeft') {
            setSelected(prev => {
                if (!prev) return items[0];
                const currentIndex = items.findIndex(item => item.name === prev.name);
                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                return items[prevIndex];
            });
        }
    };

    const theme = createTheme({
        palette: {
            mode: themeMode,
        },
    });

    const groupItemsByCategory = (items: Item[]): Record<string, Item[]> => {
        const categorizedItems = items.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, Item[]>);

        const uncategorizedItems = categorizedItems['Uncategorized'] || [];
        delete categorizedItems['Uncategorized'];

        return { ...categorizedItems, Uncategorized: uncategorizedItems };
    };

    const groupedItems = groupItemsByCategory(items);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display='flex' flexDirection='column' height='100vh'>
                <AppBar position='static'>
                    <Toolbar variant='dense'>
                        <IconButton edge='start' onClick={() => setMainDrawer(true)}><MenuIcon /></IconButton>
                        <Typography variant='h6' sx={{ flexGrow: 1 }} textAlign="center" fontSize="15px">{selected?.name}</Typography>
                        <IconButton color='inherit' edge='end' onClick={toggleTheme} sx={{ marginRight: '5px' }}>
                            {themeMode === 'dark' ? <SunIcon color='warning' /> : <MoonIcon />}
                        </IconButton>
                        <IconButton edge='end' onClick={() => setFavoritesDrawer(true)}><StarIcon /></IconButton>
                    </Toolbar>
                </AppBar>
                <Box flex={1} display='flex'>
                    {selected ? (
                        <iframe src={selected.url} width='100%' height='100%' />
                    ) : (
                        <Box textAlign='center' margin='auto'>
                            <Box p={6}>
                                <Typography variant='h4' p={1}>Iran AIP Charts</Typography>
                                <Typography>Access all updated AIP charts of Iran Airports</Typography>
                            </Box>
                            <Button href="https://www.vatir.ir"><Avatar src='/vatir.jpg' sx={{ margin: 1 }} /></Button>
                            <Button href="https://www.iravirtual.com"><Avatar src='/iravirtual.jpg' sx={{ margin: 1 }} /></Button>
                            <Typography>
                                <small>Developed by <a href='https://github.com/creepcomp'>Creepcomp</a></small>
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
            <Drawer open={mainDrawer} onClose={() => setMainDrawer(false)} sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
                <Box textAlign='center' p={4} borderBottom={1}>
                    <Typography variant='h4'>
                        <Link href='/'>Iran AIP Charts</Link>
                    </Typography>
                    <small>Access all updated AIP charts of Iran Airports</small>
                </Box>
                <Box p={1}>
                    <TextField fullWidth variant='outlined' placeholder='Search...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </Box>
                <Box p={1} display="flex">
                    {path && <Button variant='outlined' sx={{ marginRight: '5px' }} href='./'>← Back</Button>}
                    <Button variant='contained' color='secondary' href='/AD/AD 2' sx={{ "flexGrow": 1 }}>Go to Airport Charts</Button>
                </Box>
                <List className='overflow-auto'>
                    {Object.keys(groupedItems)
                        .sort()
                        .map((category) => (
                            <Box key={category}>
                                <Typography textAlign="center" className='border-b' p={1}>{category}</Typography>
                                {groupedItems[category]
                                    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map(item => (
                                        <ListItem key={item.name}>
                                            {item.type === 'directory' ? (
                                                <ListItemButton href={path ? `/${path}/${item.name}` : item.name}>
                                                    <FolderIcon sx={{ marginRight: 1 }} />
                                                    <ListItemText primary={item.name} />
                                                </ListItemButton>
                                            ) : (
                                                <>
                                                    <ListItemButton onClick={() => setSelected(item)} selected={item === selected}>
                                                        <FileIcon sx={{ marginRight: 1 }} />
                                                        <ListItemText primary={item.name} />
                                                    </ListItemButton>
                                                    <Checkbox checked={favorites.some(fav => fav.name === item.name)} onChange={() => toggleFavorite(item)} icon={<StarBorderIcon />} checkedIcon={<StarIcon />} />
                                                </>
                                            )}
                                        </ListItem>
                                    ))}
                            </Box>
                        ))}
                </List>
            </Drawer>
            <Drawer anchor='right' open={favoritesDrawer} onClose={() => setFavoritesDrawer(false)} sx={{ display: 'flex', '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
                <Box p={2} borderBottom={1}>
                    <Typography variant='h6' textAlign='center'>Favorites</Typography>
                </Box>
                {favorites.length ? (
                    <List>
                        {favorites.map((item) => (
                            <ListItem key={item.name}>
                                <ListItemButton onClick={() => setSelected(item)}>
                                    <ListItemText primary={item.name} />
                                </ListItemButton>
                                <Checkbox checked={favorites.some(fav => fav === item)} onChange={() => toggleFavorite(item)} icon={<StarBorderIcon />} checkedIcon={<StarIcon />} />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">Empty</Box>
                )}
            </Drawer>
        </ThemeProvider>
    );
};
