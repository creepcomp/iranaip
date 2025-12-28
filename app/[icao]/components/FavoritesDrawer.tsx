'use client';

import { Box, Drawer, Typography } from '@mui/material';
import ChartList from './ChartList';
import { Chart } from '@/prisma/generated/client';

const drawerWidth = 450;

export default function FavoritesDrawer({ favorites, open, onClose, onOpenChart, onToggleFavorite }: {
  favorites: Chart[];
  open: boolean;
  onClose: () => void;
  onOpenChart: (chart: Chart) => void;
  onToggleFavorite: (chart: Chart) => void;
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}>
      <Box p={2} borderBottom={1}>
        <Typography align="center" variant="h6">Favorites</Typography>
      </Box>
      {favorites.length ? (
        <ChartList charts={favorites} favorites={favorites} onToggleFavorite={onToggleFavorite} onOpenChart={onOpenChart} />
      ) : (
        <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">Empty</Box>
      )}
    </Drawer>
  );
}
