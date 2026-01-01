'use client';

import { useEffect, useState } from 'react';
import { AppBar, Box, Button, IconButton, Toolbar, Typography, Avatar, Tabs, Tab } from '@mui/material';
import { Bedtime as MoonIcon, WbSunny as SunIcon, Menu as MenuIcon, Star as StarIcon, Close as CloseIcon } from '@mui/icons-material';
import Cookies from 'js-cookie';

import { useTheme } from '../providers/ThemeProvider';
import { Chart } from '@/prisma/generated/client';

import MainDrawer from './components/MainDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import PDFViewer from './components/PDFViewer';

export default function AirportPage({ charts }: { charts: Chart[] }) {
  const { theme, toggleTheme } = useTheme();
  const [favorites, setFavorites] = useState<Chart[]>([]);
  const [openCharts, setOpenCharts] = useState<Chart[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [mainDrawerOpen, setMainDrawerOpen] = useState(true);
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState(false);

  useEffect(() => {
    const saved = Cookies.get('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (chart: Chart) => {
    setFavorites(prev => {
      const next = prev.some(c => c.id === chart.id) ? prev.filter(c => c.id !== chart.id) : [...prev, chart];
      Cookies.set('favorites', JSON.stringify(next));
      return next;
    });
  };

  const openChart = (chart: Chart) => {
    setOpenCharts(prev => {
      const exists = prev.find(c => c.id === chart.id);
      const next = exists ? prev : [...prev, chart];
      setActiveTab(next.findIndex(c => c.id === chart.id));
      return next;
    });
  };

  const closeChart = (id: string) => {
    setOpenCharts(prev => {
      const next = prev.filter(c => c.id !== id);
      setActiveTab(Math.max(0, Math.min(activeTab, next.length - 1)));
      return next;
    });
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton onClick={() => setMainDrawerOpen(true)}><MenuIcon /></IconButton>

          <Box flexGrow={1}>
            <Tabs value={activeTab} onChange={(_, newIndex) => setActiveTab(newIndex)} variant="scrollable" scrollButtons="auto">
              {openCharts.map((chart) => (
                <Tab key={chart.id} label={
                  <Box display="flex" alignItems="center">
                    <Typography width={250} variant='caption' noWrap color={theme === 'light' && 'black'}>{chart.name}</Typography>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); closeChart(chart.id); }}><CloseIcon fontSize="small" /></IconButton>
                  </Box>
                } />
              ))}
            </Tabs>
          </Box>

          <IconButton onClick={toggleTheme}>
            {theme === 'dark' ? <SunIcon color="warning" /> : <MoonIcon />}
          </IconButton>

          <IconButton onClick={() => setFavoritesDrawerOpen(true)}>
            <StarIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box flex={1} display="flex" overflow="hidden">
        {openCharts.length ? (
          openCharts.map((chart, i) => (
            <Box key={chart.id} flex={1} display={activeTab === i ? 'flex' : 'none'} overflow="hidden">
              <PDFViewer chart={chart} theme={theme} />
            </Box>
          ))
        ) : (
          <Box m="auto" textAlign="center">
            <Typography variant="h4">Iran AIP Charts</Typography>
            <Typography>Access all updated AIP charts of Iran Airports</Typography>
            <Box mt={2}>
              <Button href="https://www.vatir.ir"><Avatar src="/vatir.jpg" /></Button>
              <Button href="https://www.iravirtual.com"><Avatar src="/iravirtual.jpg" /></Button>
            </Box>
            <Typography variant="caption">Developed by <a href="https://github.com/creepcomp">Creepcomp</a></Typography>
          </Box>
        )}
      </Box>

      <MainDrawer charts={charts} favorites={favorites} open={mainDrawerOpen} onClose={() => setMainDrawerOpen(false)} onToggleFavorite={toggleFavorite} onOpenChart={openChart} />

      <FavoritesDrawer favorites={favorites} open={favoritesDrawerOpen} onClose={() => setFavoritesDrawerOpen(false)} onOpenChart={openChart} onToggleFavorite={toggleFavorite} />
    </Box>
  );
}
