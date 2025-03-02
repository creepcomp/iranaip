'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TextField, List, ListItem, ListItemText, IconButton, Button, Drawer, Typography, AppBar, Toolbar, createTheme, ThemeProvider, CssBaseline, Box, ListItemButton, Checkbox, Avatar } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon, Menu as MenuIcon, WbSunny as SunIcon, Bedtime as MoonIcon, Description as FileIcon } from '@mui/icons-material';
import Cookies from 'js-cookie';
import Link from 'next/link';
import getAirportCharts from './server';

const drawerWidth = 400;

interface Chart {
    id: string;
    name: string;
    url: string;
    category: string | null;
    airportId: string;
}

const Airport = ({ params }: { params: Promise<{ icao: string }> }) => {
    const [charts, setCharts] = useState<Chart[]>([]);
    const [favorites, setFavorites] = useState<Chart[]>([]);
    const [selected, setSelected] = useState<Chart | undefined>();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
    const [mainDrawer, setMainDrawer] = useState<boolean>(true);
    const [favoritesDrawer, setFavoritesDrawer] = useState<boolean>(false);

    const toggleTheme = () => {
        const newTheme = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newTheme);
        Cookies.set('theme', newTheme);
    };

    const toggleFavorite = (chart: Chart) => {
        setFavorites(prev => {
            const favorites = prev.some(fav => fav === chart) ? prev.filter(fav => fav !== chart) : [...prev, chart];
            Cookies.set('favorites', JSON.stringify(favorites));
            return favorites;
        });
    };

    const handleKeydown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
            setSelected(prev => {
                if (!prev) return charts[0];
                const currentIndex = charts.findIndex(chart => chart.name === prev.name);
                const nextIndex = (currentIndex + 1) % charts.length;
                return charts[nextIndex];
            });
        } else if (event.key === 'ArrowLeft') {
            setSelected(prev => {
                if (!prev) return charts[0];
                const currentIndex = charts.findIndex(chart => chart.name === prev.name);
                const prevIndex = (currentIndex - 1 + charts.length) % charts.length;
                return charts[prevIndex];
            });
        }
    }, [charts]);

    useEffect(() => {
        const theme = Cookies.get('theme');
        if (theme === 'light' || theme === 'dark') setThemeMode(theme);

        const fetchCharts = async () => {
            const airport = (await params).icao;
            const chart = await getAirportCharts(airport);
            setCharts(chart);
        };
        fetchCharts();

        const savedFavorites = Cookies.get('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }

        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [handleKeydown, params]);

    const theme = createTheme({
        palette: {
            mode: themeMode,
        },
    });

    const groupChartsByCategory = (charts: Chart[]): Record<string, Chart[]> => {
        const categorizedItems = charts.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, Chart[]>);

        const uncategorizedItems = categorizedItems['Uncategorized'] || [];
        delete categorizedItems['Uncategorized'];

        return { ...categorizedItems, Uncategorized: uncategorizedItems };
    };

    const groupedCharts = groupChartsByCategory(charts);

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
                <List className='overflow-auto'>
                    {charts.length > 0 ? Object.keys(groupedCharts).sort().map((category) => (
                        <Box key={category}>
                            <Typography textAlign="center" className='border-b' p={1}>{category}</Typography>
                            {groupedCharts[category]
                                .filter(chart => chart.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(chart => (
                                    <ListItem key={chart.id}>
                                        <ListItemButton onClick={() => setSelected(chart)} selected={chart === selected}>
                                            <FileIcon sx={{ marginRight: 1 }} />
                                            <ListItemText primary={chart.name} />
                                        </ListItemButton>
                                        <Checkbox checked={favorites.some(fav => fav.id === chart.id)} onChange={() => toggleFavorite(chart)} icon={<StarBorderIcon />} checkedIcon={<StarIcon />} />
                                    </ListItem>
                                ))}
                        </Box>
                    )) : <ListItem>Loading ..</ListItem>}
                </List>
            </Drawer>
            <Drawer anchor='right' open={favoritesDrawer} onClose={() => setFavoritesDrawer(false)} sx={{ display: 'flex', '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
                <Box p={2} borderBottom={1}>
                    <Typography variant='h6' textAlign='center'>Favorites</Typography>
                </Box>
                {favorites.length ? (
                    <List>
                        {favorites.map((chart) => (
                            <ListItem key={chart.name}>
                                <ListItemButton onClick={() => setSelected(chart)}>
                                    <ListItemText primary={chart.name} />
                                </ListItemButton>
                                <Checkbox checked={favorites.some(fav => fav === chart)} onChange={() => toggleFavorite(chart)} icon={<StarBorderIcon />} checkedIcon={<StarIcon />} />
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

export default Airport;