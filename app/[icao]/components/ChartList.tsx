'use client';

import React from 'react';
import { Box, Checkbox, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon, Description as FileIcon } from '@mui/icons-material';
import { Chart } from '@/prisma/generated/client';

export default function ChartList({ charts, favorites, onToggleFavorite, onOpenChart }: {
  charts: Chart[];
  favorites: Chart[];
  onToggleFavorite: (chart: Chart) => void;
  onOpenChart: (chart: Chart) => void;
}) {

  return (
    <List>
      {charts.map(chart => (
        <ListItem key={chart.id}>
          <ListItemButton onClick={() => onOpenChart(chart)}>
            <FileIcon sx={{ mr: 1 }} />
            <ListItemText primary={chart.name} />
          </ListItemButton>
          <Box>
            <Checkbox
              checked={favorites.some(f => f.id === chart.id)}
              onChange={() => onToggleFavorite(chart)}
              icon={<StarBorderIcon />}
              checkedIcon={<StarIcon />}
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
}
