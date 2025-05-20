import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo.png';

function Login() {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Implement login/register logic
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#F6FAF8',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <img src={logo} alt="Picare Logo" style={{ height: 60, marginBottom: 24 }} />
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#2CA068' }}>
            {tabValue === 0 ? 'Đăng nhập' : 'Đăng ký'}
          </Typography>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ mb: 3, width: '100%' }}
            TabIndicatorProps={{
              style: {
                backgroundColor: '#2CA068',
              },
            }}
          >
            <Tab label="Đăng nhập" sx={{ flex: 1, color: '#2CA068' }} />
            <Tab label="Đăng ký" sx={{ flex: 1, color: '#2CA068' }} />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {tabValue === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Họ và tên"
                name="fullName"
                autoComplete="name"
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              autoComplete="email"
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              autoComplete={tabValue === 0 ? 'current-password' : 'new-password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {tabValue === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#2CA068',
                '&:hover': {
                  backgroundColor: '#248a56',
                },
              }}
            >
              {tabValue === 0 ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 