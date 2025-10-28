"use client";

import { Avatar, Box, Button, createTheme, CssBaseline, Input, ThemeProvider, Typography, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { findAirport } from './server';

interface airport {
    id: string;
    name: string;
    icao: string;
}

const Home = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [airports, setAirports] = useState<airport[]>([]);
    const [loading, setLoading] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    const theme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    useEffect(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const timeout = setTimeout(() => {
            const fetchAirports = async () => {
                if (!searchQuery) {
                    setAirports([]);
                    return;
                }

                setLoading(true);
                try {
                    const airports = await findAirport(searchQuery);
                    setAirports(airports);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAirports();
        }, 300);

        setDebounceTimeout(timeout);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchQuery, debounceTimeout]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box flex={1} className="flex h-screen">
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
                                <ListItem key={airport.id}>
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
            </Box>
        </ThemeProvider>
    );
}

export default Home;