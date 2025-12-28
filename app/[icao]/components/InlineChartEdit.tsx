'use client';

import { useState } from 'react';
import { TextField, Typography } from '@mui/material';
import { Chart } from '@/prisma/generated/client';
import { renameChart } from './server';

export default function InlineChartEdit({ chart }: { chart: Chart }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(chart.name);

  const reset = () => {
    setValue(chart.name);
    setEditing(false);
  };

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === chart.name) {
      reset();
      return;
    }

    try {
      const result = await renameChart(chart.id, trimmed);
      if (!result.success) alert(result.message);
      setValue(result.data.name);
    } catch (error) {
      console.error('Error:', error);
      reset();
      return;
    }

    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') reset();
  };

  if (editing) {
    return (
      <TextField fullWidth size="small" value={value} autoFocus onChange={e => setValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} />
    );
  }

  return (
    <Typography onDoubleClick={() => setEditing(true)}>{value}</Typography>
  );
}
