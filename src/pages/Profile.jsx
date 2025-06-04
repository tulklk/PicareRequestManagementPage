import React, { useState } from 'react';
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

function Profile() {
  const [name, setName] = useState('Nguyễn Văn A'); // Giá trị mặc định, sau này sẽ lấy từ API
  const [signature, setSignature] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleNameChange = (event) => {
    setName(event.target.value);
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

  const handleSave = () => {
    // TODO: Implement API call to save profile changes
    console.log('Saving profile:', { name, signature });
    toast.success('Lưu thay đổi thành công!');
  };

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
              value={name}
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
                {name.charAt(0)}
              </Avatar>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
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