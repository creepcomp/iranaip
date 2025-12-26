"use client";

import { Box } from '@mui/material';
import Home from './components/Home';

export default function Page() {
    return (
        <Box flex={1} className="flex h-screen">
            <Home />
        </Box>
    );
}
