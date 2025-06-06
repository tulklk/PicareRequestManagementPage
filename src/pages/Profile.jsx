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
import { uploadSignatureToGoogleDrive } from '../utils/upload-sign';

function Profile() {
  const [signature, setSignature] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [user, setUser] = useState({
    id: null,
    name: '',
    mail: '',
    chuKy: null,
    role: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const loginUser = JSON.parse(localStorage.getItem('loginUser'));
        
        if (!token || !loginUser) {
          toast.error('Vui lòng đăng nhập lại');
          return;
        }

        // Fetch user details from API
        const response = await axios.get(`http://localhost:8080/user/view/${loginUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('User API response:', response.data);
        
        // Update user state with the response data
        setUser({
          id: response.data.id,
          name: response.data.name,
          mail: response.data.mail,
          chuKy: response.data.chuKy,
          role: response.data.role
        });

        // If user has a signature, fetch its URL
        if (response.data.chuKy) {
          try {
            const signatureResponse = await axios.get(`http://localhost:8080/attachment/view/${response.data.chuKy}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            setPreviewUrl(signatureResponse.data.url);
          } catch (error) {
            console.error('Error fetching signature URL:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleNameChange = (event) => {
    setUser(prev => ({
      ...prev,
      name: event.target.value
    }));
  };

  const handleSignatureUpload = async (event) => {
    const file = event.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg'
    ];

    if (file && allowedTypes.includes(file.type)) {
      try {
        setLoading(true);
        console.log('Step 1: Uploading signature to Google Drive...');
        
        // Step 1: Upload to Google Drive
        const fileUrl = await uploadSignatureToGoogleDrive(file);
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
        
        if (!savedSignature.data || !savedSignature.data.id) {
          throw new Error('Invalid response from server');
        }

        // Update preview and state
        setSignature(file);
        setPreviewUrl(savedSignature.data.url);
        
        // Update user's signature ID and URL in local storage
        const updatedUser = {
          ...user,
          chuKy: savedSignature.data.id
        };
        setUser(updatedUser);
        localStorage.setItem('loginUser', JSON.stringify(updatedUser));

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
      toast.error('Vui lòng chọn file PDF, PNG hoặc JPEG');
      event.target.value = null;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Prepare request body
      const requestBody = {
        name: user.name,
        mail: user.mail,
        chuKy: user.chuKy // This will be the signature ID
      };

      console.log('Update request body:', requestBody);

      const response = await axios.put(
        `http://localhost:8080/user/update/${user.id}`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);
      toast.success('Lưu thay đổi thành công!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Không thể lưu thay đổi');
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
                    accept=".pdf,.png,.jpg,.jpeg"
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