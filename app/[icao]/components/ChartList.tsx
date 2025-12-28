'use client';

import { Box, Checkbox, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon, Description as FileIcon } from '@mui/icons-material';
import { Chart } from '@/prisma/generated/client';
import InlineChartName from './InlineChartEdit';
import { useAdmin } from '@/app/providers/AdminProvider';

export default function ChartList({ charts, favorites, onToggleFavorite, onOpenChart }: {
  charts: Chart[];
  favorites: Chart[];
  onToggleFavorite: (chart: Chart) => void;
  onOpenChart: (chart: Chart) => void;
}) {
  const sortedCharts = [...charts].sort((a, b) => a.name.localeCompare(b.name));
  const isAdmin = useAdmin();

  return (
    <List>
      {sortedCharts.map(chart => (
        <ListItem key={chart.id} sx={{ p: 0, '&:hover .favorite-box': { display: 'block' } }}>
          <ListItemButton onClick={() => onOpenChart(chart)}>
            <FileIcon sx={{ mr: 1 }} />
            <ListItemText primary={isAdmin ? <InlineChartName chart={chart} /> : chart.name} />
          </ListItemButton>
          <Box className="favorite-box" display="none" position="absolute" right={0} p={1}>
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
