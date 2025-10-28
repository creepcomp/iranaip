'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    TextField, List, ListItem, ListItemText, IconButton, Button, Drawer, Typography,
    AppBar, Toolbar, createTheme, ThemeProvider, CssBaseline, Box, ListItemButton,
    Checkbox, Avatar, Tabs, Tab
} from '@mui/material';
import {
    Star as StarIcon, StarBorder as StarBorderIcon, Menu as MenuIcon,
    WbSunny as SunIcon, Bedtime as MoonIcon, Description as FileIcon,
    Edit as EditIcon, Save as SaveIcon
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { getAirportCharts, updateChartName } from './server';

const drawerWidth = 450;

interface Chart {
    id: string;
    name: string;
    url: string;
    category: string | null;
    airportId: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`category-tabpanel-${index}`}
            aria-labelledby={`category-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={2}>{children}</Box>}
        </div>
    );
}

const Airport = ({ params }: { params: Promise<{ icao: string }> }) => {
    const [charts, setCharts] = useState<Chart[]>([]);
    const [favorites, setFavorites] = useState<Chart[]>([]);
    const [selected, setSelected] = useState<Chart | undefined>();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
    const [mainDrawer, setMainDrawer] = useState<boolean>(true);
    const [favoritesDrawer, setFavoritesDrawer] = useState<boolean>(false);
    const [editingChartId, setEditingChartId] = useState<string | null>(null);
    const [newChartName, setNewChartName] = useState<string>('');
    const [tabIndex, setTabIndex] = useState(0);

    const toggleTheme = () => {
        const newTheme = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newTheme);
        Cookies.set('theme', newTheme);
    };

    const toggleFavorite = (chart: Chart) => {
        setFavorites(prev => {
            const favorites = prev.some(fav => fav.id === chart.id)
                ? prev.filter(fav => fav.id !== chart.id)
                : [...prev, chart];
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

        const savedFavorites = Cookies.get('favorites');
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        
        const fetchCharts = async () => {
            const airport = (await params).icao;
            const chart = await getAirportCharts(airport);
            setCharts(chart);
        };
        fetchCharts();
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [handleKeydown]);

    const theme = createTheme({ palette: { mode: themeMode } });

    const groupChartsByCategory = (charts: Chart[]): Record<string, Chart[]> => {
        const categorizedItems = charts.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {} as Record<string, Chart[]>);

        const uncategorizedItems = categorizedItems['Uncategorized'] || [];
        delete categorizedItems['Uncategorized'];

        return { ...categorizedItems, Uncategorized: uncategorizedItems };
    };

    const groupedCharts = groupChartsByCategory(charts);
    const customOrder = ["GND", "DEP", "ARR", "APP", "Uncategorized"];
    const categoryNames = customOrder.filter(cat => groupedCharts[cat]);


    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display='flex' flexDirection='column' height='100vh'>
                <AppBar position='static'>
                    <Toolbar variant='dense'>
                        <IconButton edge='start' onClick={() => setMainDrawer(true)}><MenuIcon /></IconButton>
                        <Typography variant='h6' sx={{ flexGrow: 1 }} textAlign="center" fontSize="15px">
                            {selected?.name}
                        </Typography>
                        <IconButton color='inherit' edge='end' onClick={toggleTheme} sx={{ marginRight: '5px' }}>
                            {themeMode === 'dark' ? <SunIcon color='warning' /> : <MoonIcon />}
                        </IconButton>
                        <IconButton edge='end' onClick={() => setFavoritesDrawer(true)}><StarIcon /></IconButton>
                    </Toolbar>
                </AppBar>
                <Box flex={1} display='flex'>
                    {selected ? (
                        <iframe src={`/api/proxy?url=${encodeURIComponent(selected.url)}`} width="100%" height="100%" />
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

                <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    {categoryNames.map(category => (
                        <Tab key={category} label={category} />
                    ))}
                </Tabs>

                {categoryNames.map((category, idx) => (
                    <TabPanel key={category} value={tabIndex} index={idx}>
                        <List>
                            {groupedCharts[category]
                                .filter(chart => chart.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(chart => (
                                    <ListItem key={chart.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                        {editingChartId === chart.id ? (
                                            <>
                                                <TextField
                                                    value={newChartName}
                                                    onChange={(e) => setNewChartName(e.target.value)}
                                                    size="small"
                                                    sx={{ flexGrow: 1, marginRight: 1 }}
                                                />
                                                <IconButton
                                                    onClick={async () => {
                                                        if (newChartName.trim()) {
                                                            const updated = await updateChartName(chart.id, newChartName);
                                                            setCharts(prev => prev.map(c => c.id === chart.id ? updated : c));
                                                        }
                                                        setEditingChartId(null);
                                                    }}
                                                >
                                                    <SaveIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <ListItemButton onClick={() => setSelected(chart)} selected={chart === selected}>
                                                    <FileIcon sx={{ marginRight: 1 }} />
                                                    <ListItemText primary={chart.name} />
                                                </ListItemButton>
                                                {Cookies.get('is_admin') && (
                                                    <IconButton onClick={() => { setEditingChartId(chart.id); setNewChartName(chart.name); }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <Checkbox
                                                    checked={favorites.some(fav => fav.id === chart.id)}
                                                    onChange={() => toggleFavorite(chart)}
                                                    icon={<StarBorderIcon />}
                                                    checkedIcon={<StarIcon />}
                                                />
                                            </>
                                        )}
                                    </ListItem>
                                ))}
                        </List>
                    </TabPanel>
                ))}
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
                                <Checkbox
                                    checked={favorites.some(fav => fav.id === chart.id)}
                                    onChange={() => toggleFavorite(chart)}
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

export default Airport;
