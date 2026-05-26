import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, 
  Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, ListItemButton 
} from '@mui/material';
import { 
  Menu as MenuIcon, Dashboard as DashboardIcon, 
  Folder as ProjectIcon, Assignment as TaskIcon, Logout as LogoutIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Projects', icon: <ProjectIcon />, path: '/projects' },
    { text: 'My Tasks', icon: <TaskIcon />, path: '/tasks' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" color="primary" fontWeight="bold">
          Job Tracker
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem disablePadding key={item.text}>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                 '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'primary.contrastText' } },
                 '&.Mui-selected:hover': { bgcolor: 'primary.main' }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(m => m.path === location.pathname)?.text || 'Job Tracker'}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            {user?.name} ({user?.role})
          </Typography>
          <Button color="inherit" onClick={() => { logout(); navigate('/login'); }} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: '64px' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
