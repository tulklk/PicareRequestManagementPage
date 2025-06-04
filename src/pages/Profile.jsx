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
import uploadFile from '../utils/upload.js';
import axios from 'axios';

function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [signature, setSignature] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [userId, setUserId] = useState('1'); // Temporarily hardcoded for testing
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:8080/user/${userId}`);
        setName(response.data.name || '');
        setEmail(response.data.mail || '');
        if (response.data.chuKy) {
          setSignature(response.data.chuKy);
          setPreviewUrl(response.data.chuKy.url);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Có lỗi xảy ra khi tải thông tin người dùng');
        toast.error('Có lỗi xảy ra khi tải thông tin người dùng');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSignatureUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Vui lòng tải lên file PDF');
        return;
      }
      
      try {
        // Upload to Firebase
        const firebaseUrl = await uploadFile(file);
        
        // Upload signature info to API
        const response = await axios.post('http://localhost:8080/user/attachment/upload-sign', {
          url: firebaseUrl,
          fileName: file.name
        });

        if (response.data) {
          setSignature(response.data);
          setPreviewUrl(firebaseUrl);
          toast.success('Tải lên chữ ký thành công!');
        }
      } catch (error) {
        console.error('Error uploading signature:', error);
        toast.error('Có lỗi xảy ra khi tải lên chữ ký');
      }
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/user/update/${userId}`, {
        name,
        mail: email,
        chuKy: signature?.id || null
      });

      if (response.data) {
        toast.success('Lưu thay đổi thành công!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi xảy ra khi lưu thay đổi');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#2CA068', fontWeight: 600 }}>
          Thông tin cá nhân
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Đang tải thông tin...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={name}
                onChange={handleNameChange}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={handleEmailChange}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Chữ ký (PDF)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {previewUrl && (
                    <Box
                      component="a"
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'block',
                        padding: 2,
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        textDecoration: 'none',
                        color: '#2CA068',
                      }}
                    >
                      Xem chữ ký
                    </Box>
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
                      accept="application/pdf"
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
                  {name.charAt(0)}
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              bgcolor: '#2CA068',
              '&:hover': {
                bgcolor: '#248a56',
              },
            }}
          >
            Lưu thay đổi
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Profile; 