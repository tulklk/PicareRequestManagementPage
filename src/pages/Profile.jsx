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
import { uploadToGoogleDrive } from '../utils/upload';

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

  const handleSignatureUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      try {
        setLoading(true);
        console.log('Step 1: Uploading signature to Google Drive...');
        
        // Step 1: Upload to Google Drive
        const fileUrl = await uploadToGoogleDrive(file);
        if (!fileUrl) {
          throw new Error('Failed to get file URL from Google Drive');
        }
        console.log('Step 1 completed: Signature uploaded to Drive successfully');
        
        // Step 2: Save signature info to database
        console.log('Step 2: Saving signature info to database...');
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const savedSignature = await axios.post('http://localhost:8080/attachment/upload-sign', 
          {
            url: fileUrl,
            fileName: file.name
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Server response:', savedSignature.data);
        
        if (!savedSignature.data || !savedSignature.data.url) {
          throw new Error('Invalid response from server');
        }

        // Update preview and state
        setSignature(file);
        setPreviewUrl(savedSignature.data.url);
        setUser(prev => ({
          ...prev,
          chuKy: savedSignature.data.url
        }));

        console.log('Step 2 completed: Signature info saved to database');
        toast.success('Chữ ký đã được tải lên thành công!');
      } catch (error) {
        console.error('Error uploading signature:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          toast.error(`Lỗi từ server: ${error.response.data.message || 'Không thể tải lên chữ ký'}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        } else {
          console.error('Error message:', error.message);
          toast.error(`Lỗi: ${error.message || 'Không thể tải lên chữ ký'}`);
        }
      } finally {
        setLoading(false);
        event.target.value = null;
      }
    } else {
      toast.error('Vui lòng chọn file PDF');
      event.target.value = null;
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
                    accept=".pdf"
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