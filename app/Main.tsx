'use client';

import React, { useState, useEffect } from 'react';
import {
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    Drawer,
    Typography,
    AppBar,
    Toolbar,
    createTheme,
    ThemeProvider,
    CssBaseline,
    Box,
    ListItemButton,
    Checkbox,
    Avatar
} from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Menu as MenuIcon,
    WbSunny as SunIcon,
    Bedtime as MoonIcon,
    Folder as FolderIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { getFilesAndDirectories } from './server';
import Cookies from 'js-cookie';

const drawerWidth = 400;

interface DirectoryItem {
    name: string;
    type: string;
    url?: string;
    children?: DirectoryItem[];
}

const Main: React.FC<{ path: string }> = ({ path }) => {
    const [selectedItem, setSelectedItem] = useState<DirectoryItem | undefined>();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [favorites, setFavorites] = useState<DirectoryItem[]>([]);
    const [directories, setDirectories] = useState<DirectoryItem[]>([]);
    const [mainDrawer, setMainDrawer] = useState<boolean>(true);
    const [favoritesDrawer, setFavoritesDrawer] = useState<boolean>(false);
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const theme = Cookies.get('theme');
        if (theme === 'light' || theme === 'dark') setThemeMode(theme);

        const fetchDirectories = async () => {
            const data = await getFilesAndDirectories(path);
            setDirectories(data);
        };
        fetchDirectories();

        const savedFavorites = Cookies.get('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, [path]);

    const toggleTheme = () => {
        const newTheme = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newTheme);
        Cookies.set('theme', newTheme);
    };

    const toggleFavorite = (item: DirectoryItem) => {
        setFavorites(prev => {
            const isFavorite = prev.some(fav => fav.url === item.url);
            const updatedFavorites = isFavorite
                ? prev.filter(fav => fav.url !== item.url)
                : [...prev, item];
            Cookies.set('favorites', JSON.stringify(updatedFavorites));
            return updatedFavorites;
        });
    };

    const theme = createTheme({
        palette: {
            mode: themeMode,
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display='flex' flexDirection='column' height='100vh'>
                <AppBar position='static'>
                    <Toolbar variant='dense'>
                        <IconButton edge='start' onClick={() => setMainDrawer(true)}><MenuIcon /></IconButton>
                        <Typography variant='h6' sx={{ flexGrow: 1 }} textAlign="center" fontSize="15px">{selectedItem?.name}</Typography>
                        <IconButton color='inherit' edge='end' onClick={toggleTheme} sx={{ marginRight: '5px' }}>
                            {themeMode === 'dark' ? <SunIcon color='warning' /> : <MoonIcon />}
                        </IconButton>
                        <IconButton edge='end' onClick={() => setFavoritesDrawer(true)}><StarIcon /></IconButton>
                    </Toolbar>
                </AppBar>
                <Box flex={1} display='flex'>
                    {selectedItem ? (
                        <iframe src={"/AIP/" + selectedItem.url} width='100%' height='100%' />
                    ) : (
                        <Box textAlign='center' margin='auto'>
                            <Box p={6}>
                                <Typography variant='h4'>Iran AIP Charts</Typography>
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
            <Drawer
                open={mainDrawer}
                onClose={() => setMainDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                <Box textAlign='center' p={4} borderBottom={1}>
                    <Typography variant='h4'>Iran AIP Charts</Typography>
                    <small>Access all updated AIP charts of Iran Airports</small>
                </Box>
                <Box p={1}>
                    <TextField
                        fullWidth
                        variant='outlined'
                        placeholder='Search...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Box>
                <Box p={1} display="flex">
                    {path && <Button variant='outlined' sx={{ marginRight: '5px' }} href='./'>← Back</Button>}
                    <Button variant='contained' color='secondary' href='/AD/AD 2' sx={{ "flexGrow": 1 }}>Go to Airport Charts</Button>
                </Box>
                <List className='overflow-auto'>
                    {directories.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                        <ListItem key={item.name}>
                            {item.type === 'directory' ? (
                                <ListItemButton href={path ? `/${path}/${item.name}` : item.name}>
                                    <FolderIcon sx={{ marginRight: 1 }} />
                                    <ListItemText primary={item.name} />
                                </ListItemButton>
                            ) : (
                                <>
                                    <ListItemButton onClick={() => setSelectedItem(item)}>
                                        <DescriptionIcon sx={{ marginRight: 1 }} />
                                        <ListItemText primary={item.name} />
                                    </ListItemButton>
                                    <Checkbox
                                        checked={favorites.some(fav => fav.url === item.url)}
                                        onChange={() => toggleFavorite(item)}
                                        icon={<StarBorderIcon />}
                                        checkedIcon={<StarIcon />}
                                    />
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Drawer
                anchor='right'
                open={favoritesDrawer}
                onClose={() => setFavoritesDrawer(false)}
                sx={{
                    display: 'flex',
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                <Box p={2} borderBottom={1}>
                    <Typography variant='h6' textAlign='center'>Favorites</Typography>
                </Box>
                {favorites.length ? (
                    <List>
                        {favorites.map((item) => (
                            <ListItem key={item.name}>
                                <ListItemButton onClick={() => setSelectedItem(item)}>
                                    <ListItemText primary={item.name} />
                                </ListItemButton>
                                <Checkbox
                                    checked={favorites.some(fav => fav.url === item.url)}
                                    onChange={() => toggleFavorite(item)}
                                    icon={<StarBorderIcon />}
                                    checkedIcon={<StarIcon />}
                                />
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

export default Main;