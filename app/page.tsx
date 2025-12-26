"use client";

import { Box, IconButton } from '@mui/material';
import Home from './components/Home';
import { Bedtime as MoonIcon, WbSunny as SunIcon } from '@mui/icons-material';
import { useTheme } from './providers/ThemeProvider';

export default function Page() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Box flex={1} className="flex h-screen">
            <Box position="absolute" top={0} right={0} p={1}>
                <IconButton onClick={toggleTheme}>{theme === 'dark' ? <SunIcon color="warning" /> : <MoonIcon />}</IconButton>
            </Box>
            <Home />
        </Box>
    );
}
