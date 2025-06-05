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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo.png';
import { toast } from 'react-toastify';
import axios from 'axios';

function Login() {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mail: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset form data when switching tabs
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (tabValue === 0) {
        // Login
        const response = await axios.post('http://localhost:8080/authen/login', {
          mail: formData.mail,
          password: formData.password
        });
        
        // Store the token in localStorage or your preferred storage
        localStorage.setItem('token', response.data.token);
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp!');
          return;
        }

        const response = await axios.post('http://localhost:8080/authen/register', {
          name: formData.name,
          mail: formData.mail,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });

        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setTabValue(0); // Switch to login tab
      }
    } catch (error) {
      const errorMessage = error.response.data || 'Có lỗi xảy ra!';
      console.log(error.response.data);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#F6FAF8',
        py: isMobile ? 2 : 0,
        px: isMobile ? 2 : 0,
      }}
    >
      <Container maxWidth="sm" sx={{ px: isMobile ? 1 : 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: isMobile ? 2 : 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            width: '100%',
          }}
        >
          <img 
            src={logo} 
            alt="Picare Logo" 
            style={{ 
              height: isMobile ? 40 : 60, 
              marginBottom: isMobile ? 16 : 24 
            }} 
          />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: '#2CA068',
              textAlign: 'center',
              width: '100%'
            }}
          >
            {tabValue === 0 ? 'Đăng nhập' : 'Đăng ký'}
          </Typography>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ 
              mb: 3, 
              width: '100%',
              '& .MuiTab-root': {
                fontSize: isMobile ? '0.875rem' : '1rem',
                minHeight: isMobile ? 48 : 56,
              }
            }}
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="name"
                size={isMobile ? "small" : "medium"}
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="mail"
              value={formData.mail}
              onChange={handleInputChange}
              autoComplete="email"
              size={isMobile ? "small" : "medium"}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              autoComplete={tabValue === 0 ? 'current-password' : 'new-password'}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size={isMobile ? "small" : "medium"}
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
                value={formData.confirmPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size={isMobile ? "small" : "medium"}
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
              size={isMobile ? "medium" : "large"}
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: isMobile ? 1 : 1.5,
                backgroundColor: '#2CA068',
                '&:hover': {
                  backgroundColor: '#248a56',
                },
                fontSize: isMobile ? '0.875rem' : '1rem',
              }}
            >
              {loading ? 'Đang xử lý...' : (tabValue === 0 ? 'Đăng nhập' : 'Đăng ký')}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 