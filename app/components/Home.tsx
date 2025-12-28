import { Avatar, Box, Button, Input, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { findAirport } from "./server";
import { Airport } from "@/prisma/generated/client";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setAirports([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const airports = await findAirport(searchQuery);
        setAirports(airports);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  return (
    <Box textAlign='center' margin='auto'>
      <Box p={6}>
        <Typography variant='h4' p={1}>Iran AIP Charts</Typography>
        <Typography>Access all updated AIP charts of Iran Airports</Typography>
      </Box>
      <Box>
        <Input
          inputProps={{ style: { textAlign: 'center' } }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          placeholder='Search ICAO'
          fullWidth
        />
        <List className="overflow-auto">
          {loading && <ListItem>Loading...</ListItem>}
          {airports.map((airport) => (
            <ListItem key={airport.icao}>
              <ListItemButton key={airport.name} href={`/${airport.icao}`}>
                <ListItemText primary={airport.name} secondary={airport.icao} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box p={6}>
        <Button href="https://www.vatir.ir"><Avatar src='/vatir.jpg' sx={{ margin: 1 }} /></Button>
        <Button href="https://www.iravirtual.com"><Avatar src='/iravirtual.jpg' sx={{ margin: 1 }} /></Button>
        <Typography>
          <small>Developed by <a href='https://github.com/creepcomp'>Creepcomp</a></small>
        </Typography>
      </Box>
    </Box>
  );
}