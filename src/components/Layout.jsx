import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  AccountCircle,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import logo from '../img/logo.png';
// import "@fontsource/montserrat/400.css";
// import "@fontsource/montserrat/700.css";

const drawerWidth = 240;

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Tạo đơn mới', icon: <AddIcon />, path: '/create-request' },
    { text: 'Đơn chờ ký', icon: <DescriptionIcon />, path: '/my-requests' },
    { text: 'Đơn đang ký', icon: <AssignmentIcon />, path: '/pending-approvals' },
    { text: 'Đơn đã ký', icon: <CheckCircleIcon />, path: '/request-history' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <img src={logo} alt="Picare Logo" style={{ height: 40, margin: '0 auto' }} />
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              color: '#000000',
              fontWeight: 600,
              '&:hover': {
                background: '#E6F4EF',
                color: '#2CA068',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: '#fff',
          color: '#2CA068',
          height: 70,
          justifyContent: 'center',
          boxShadow: '0 2px 8px 0 #e6f4ef',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {/* <img src={logo} alt="Picare Logo" style={{ height: 38, marginRight: 16 }} /> */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, color: '#2CA068', letterSpacing: 2 }}>
            PICARE
          </Typography>
          <Button
            variant="outlined"
            sx={{
              borderRadius: '50%',
              minWidth: 44,
              minHeight: 44,
              p: 0,
              borderColor: '#2CA068',
              color: '#2CA068',
              ml: 2,
              '&:hover': {
                background: '#E6F4EF',
                borderColor: '#2CA068',
              },
            }}
            onClick={handleProfileMenuOpen}
          >
            <AccountCircle sx={{ fontSize: 32 }} />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>Hồ sơ</MenuItem>
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: '#F6FAF8', color: '#2CA068' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: '#F6FAF8', color: '#2CA068' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          background: '#F6FAF8',
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }} />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout; 