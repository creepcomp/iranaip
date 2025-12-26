'use client';

import React, { useState } from 'react';
import { Box, Drawer, Tab, TextField, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ChartList from './ChartList';
import { Chart } from '@/prisma/generated/client';
import { ChartCategory } from '@/app/enums';

const drawerWidth = 450;

export default function MainDrawer({ charts, favorites, open, onClose, onToggleFavorite, onOpenChart }: {
  charts: Chart[];
  favorites: Chart[];
  open: boolean;
  onClose: () => void;
  onToggleFavorite: (chart: Chart) => void;
  onOpenChart: (chart: Chart) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState('GEN');

  const groupedCharts = charts.reduce<Record<string, Chart[]>>((acc, c) => {
    const k = c.category || 'Uncategorized';
    acc[k] ??= [];
    acc[k].push(c);
    return acc;
  }, {});

  const categories = Object.values(ChartCategory).filter(c => groupedCharts[c]);

  return (
    <Drawer open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}>
      <Box p={3} textAlign="center" borderBottom={1}>
        <Typography variant="h4">Iran AIP Charts</Typography>
        <Typography variant="caption">Access all updated AIP charts of Iran Airports</Typography>
      </Box>

      <Box p={1}>
        <TextField size='small' fullWidth placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </Box>

      <TabContext value={tabIndex}>
        <TabList onChange={(_, v) => setTabIndex(v)}>{categories.map(c => <Tab key={c} label={c} value={c} />)}</TabList>

        {categories.map(cat => (
          <TabPanel key={cat} value={cat} sx={{ p: 0 }}>
            <ChartList
              charts={groupedCharts[cat].filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              onOpenChart={onOpenChart}
            />
          </TabPanel>
        ))}
      </TabContext>
    </Drawer>
  );
}
