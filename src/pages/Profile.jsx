import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../config/axios';
import axios from 'axios';

function Profile() {
  const [signature, setSignature] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [user, setUser] = useState({
    name: '',
    mail: '',
    chuKy: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const loginUser = JSON.parse(localStorage.getItem('loginUser'));
        
        console.log('Token:', token);
        console.log('Login User:', loginUser);
        
        if (!token || !loginUser) {
          toast.error('Vui lòng đăng nhập lại');
          return;
        }

        
        // Update user state with the response data
        setUser({
          name: loginUser.name,
          mail: loginUser.mail,
          chuKy: loginUser.chuKy
        });

        if (loginUser.chuKy) {
          setPreviewUrl(loginUser.chuKy);
        }
      } catch (error) {
        console.error('Full error:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Add a console log to see when user state changes
  useEffect(() => {
    console.log('Current user state:', user);
  }, [user]);

  const handleNameChange = (event) => {
    setUser(prev => ({
      ...prev,
      name: event.target.value
    }));
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSignature(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', user.name);
      if (signature) {
        formData.append('chuKy', signature);
      }

      await axios.put(`http://localhost:8080/user/update/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Lưu thay đổi thành công!');
    } catch (error) {
      toast.error('Không thể lưu thay đổi');
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Đang tải thông tin...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#2CA068', fontWeight: 600 }}>
          Thông tin cá nhân
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Họ và tên"
              value={user.name || ''}
              onChange={handleNameChange}
              sx={{ mb: 3 }}
            />
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Chữ ký
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {previewUrl && (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Chữ ký"
                    sx={{
                      width: 200,
                      height: 100,
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                    }}
                  />
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{ color: '#2CA068', borderColor: '#2CA068' }}
                >
                  Tải lên
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleSignatureUpload}
                  />
                </Button>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#2CA068',
                  fontSize: '3rem',
                }}
              >
                {user.name}
              </Avatar>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{
              bgcolor: '#2CA068',
              '&:hover': {
                bgcolor: '#248a56',
              },
            }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Profile; 