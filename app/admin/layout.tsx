"use client";

import { useState } from "react";
import { Drawer, Box, Typography, List, ListItem, ListItemButton, useMediaQuery, AppBar, Toolbar, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 240;

export default function AdminDrawer({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:960px)");

  const links = [
    { name: "Dashboard", href: "/admin" },
    { name: "Airports", href: "/admin/airports" },
    { name: "Charts", href: "/admin/charts" },
  ];

  const drawerContent = (
    <Box>
      <Typography variant="h4" p={3} align="center" borderBottom={1}>Iran AIP</Typography>
      <List>
        {links.map((x, i) => (
          <ListItem key={i} disablePadding>
            <ListItemButton href={x.href}>{x.name}</ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box display="flex">
      {!isDesktop && (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>Iran AIP</Typography>
          </Toolbar>
        </AppBar>
      )}

      {isDesktop && (
        <Drawer variant="permanent" open sx={{
          width: drawerWidth, flexShrink: 0, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
        }}>
          {drawerContent}
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box component="main" flexGrow={1} p={1}>
        {!isDesktop && <Toolbar />}
        {children}
      </Box>
    </Box>
  );
}
