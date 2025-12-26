"use client";

import { Chart } from "@/prisma/generated/client";
import { useEffect, useState, ChangeEvent, useCallback } from "react";
import { getCharts, upsertChart, deleteChart } from "./server";
import { Box, Button, Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TablePagination, TextField, Select, MenuItem, FormControl, InputLabel, TableRow, SelectChangeEvent, TableFooter, DialogActions } from "@mui/material";
import { ChartCategory } from "@/app/enums";

export default function ChartsAdminPage() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [chart, setChart] = useState<Partial<Chart> | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCharts = useCallback(async () => {
    const { data, total } = await getCharts(page, rowsPerPage, searchQuery);
    setCharts(data);
    setTotal(total);
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    if (!chart) return;
    setChart({ ...chart, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!chart) return;
    const result = await upsertChart({ ...chart, lastUpdated: chart.lastUpdated ? new Date(chart.lastUpdated) : new Date() } as Chart);
    if (result.success) { fetchCharts(); setChart(null); }
    else alert("Error saving chart");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this chart?")) return;
    const result = await deleteChart(id);
    if (result.success) fetchCharts();
    else alert("Error deleting chart");
  };

  return (
    <Box>
      <TextField label="Search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} fullWidth size="small" sx={{ mb: 1 }} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ICAO</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>URL</TableCell>
            <TableCell>Last Updated</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {charts.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.icao}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.category}</TableCell>
              <TableCell><a href={c.url} target="_blank" rel="noopener noreferrer">Link</a></TableCell>
              <TableCell>{new Date(c.lastUpdated).toUTCString()}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => setChart(c)}>Edit</Button>
                <Button size="small" onClick={() => handleDelete(c.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
              <Button variant="contained" onClick={() => setChart({ category: "GND", lastUpdated: new Date() })} fullWidth>Create</Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <TablePagination
        count={total} page={page} rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
      />

      <Dialog open={Boolean(chart)} onClose={() => setChart(null)} fullWidth maxWidth="sm">
        <DialogTitle>{chart?.id ? "Edit Chart" : "Add Chart"}</DialogTitle>
        <DialogContent dividers>
          <TextField label="ICAO" name="icao" value={chart?.icao || ""} onChange={handleChange} fullWidth sx={{ mb: 1 }} />
          <TextField label="Name" name="name" value={chart?.name || ""} onChange={handleChange} fullWidth sx={{ mb: 1 }} />
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Category</InputLabel>
            <Select name="category" value={chart?.category || ""} onChange={handleChange}>
              {Object.values(ChartCategory).map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="URL" name="url" value={chart?.url || ""} onChange={handleChange} fullWidth sx={{ mb: 1 }} />
          <TextField
            label="Last Updated" name="lastUpdated" type="datetime-local"
            value={chart?.lastUpdated ? new Date(chart.lastUpdated).toISOString().slice(0, 16) : ""}
            onChange={handleChange} fullWidth sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleSave} fullWidth>{chart?.id ? "Save" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
