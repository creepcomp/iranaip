"use client";

import { Airport } from "@/prisma/generated/client";
import { useEffect, useState, ChangeEvent, useCallback } from "react";
import { getAirports, upsertAirport, deleteAirport } from "./server";
import { Box, Button, Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TablePagination, TextField, TableRow, TableFooter, DialogActions } from "@mui/material";

export default function AirportsAdminPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [airport, setAirport] = useState<Partial<Airport> | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAirports = useCallback(async () => {
    const { data, total } = await getAirports(page, rowsPerPage, searchQuery);
    setAirports(data);
    setTotal(total);
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchAirports();
  }, [fetchAirports]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!airport) return;
    setAirport({ ...airport, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!airport) return;
    const result = await upsertAirport(airport as Airport);
    if (result.success) { fetchAirports(); setAirport(null); }
    else alert("Error saving airport");
  };

  const handleDelete = async (icao: string) => {
    if (!confirm("Delete this airport?")) return;
    const result = await deleteAirport(icao);
    if (result.success) fetchAirports();
    else alert("Error deleting airport");
  };

  return (
    <Box>
      <TextField 
        label="Search" 
        value={searchQuery} 
        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} 
        fullWidth size="small" sx={{ mb: 1 }} 
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ICAO</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {airports.map(a => (
            <TableRow key={a.icao}>
              <TableCell>{a.icao}</TableCell>
              <TableCell>{a.name}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => setAirport(a)}>Edit</Button>
                <Button size="small" onClick={() => handleDelete(a.icao)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              <Button variant="contained" onClick={() => setAirport({})} fullWidth>Create</Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <TablePagination
        count={total} page={page} rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
      />

      <Dialog open={Boolean(airport)} onClose={() => setAirport(null)} fullWidth maxWidth="sm">
        <DialogTitle>{airport?.icao ? "Edit Airport" : "Add Airport"}</DialogTitle>
        <DialogContent dividers>
          <TextField label="ICAO" name="icao" value={airport?.icao || ""} onChange={handleChange} fullWidth sx={{ mb: 1 }} />
          <TextField label="Name" name="name" value={airport?.name || ""} onChange={handleChange} fullWidth sx={{ mb: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleSave} fullWidth>{airport?.icao ? "Save" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
