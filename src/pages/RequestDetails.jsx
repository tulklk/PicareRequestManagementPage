import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import ArrowBack from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState(null);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const isFromHistory = location.state?.from === 'history';
  const isFromCancelled = location.state?.from === 'cancelled';

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8080/paper/view/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setRequest(response.data);
        
        // Fetch attachment after getting paper data
        try {
          const attachmentResponse = await axios.get(
            `http://localhost:8080/attachment/view/${response.data.paper_id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          setAttachment(attachmentResponse.data);
        } catch (attachmentError) {
          console.error('Error fetching attachment:', attachmentError);
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        console.error('Error details:', error.response?.data);
        setError('Có lỗi xảy ra khi tải đơn');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const callApproveAPI = async (approveData, token, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          'http://localhost:8080/approve-step/approve',
          approveData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        );

        return response;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('loginUser'));

      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const approveData = {
        step: request.waiting_step,
        approverId: currentUser.id,
        donKiemDuyetId: request.id, 
        denyReason: null
      };

      try {
        const approveResponse = await callApproveAPI(approveData, token);

        if (!approveResponse.data) {
          throw new Error('Không nhận được phản hồi từ server sau khi duyệt');
        }

        toast.success('Đã duyệt đơn thành công!', {
          onClose: () => {
            navigate('/pending-approvals');
          }
        });
      } catch (approveError) {
        console.error('Error in approval API call:', approveError);
        if (approveError.response) {
          console.error('Error response data:', approveError.response.data);
          console.error('Error response status:', approveError.response.status);
          throw new Error(`Lỗi từ server khi duyệt: ${approveError.response.data.message || 'Không thể cập nhật trạng thái duyệt'}`);
        } else if (approveError.request) {
          throw new Error('Không thể kết nối đến server để duyệt. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } else {
          throw new Error(`Lỗi khi gọi API duyệt: ${approveError.message}`);
        }
      }
    } catch (error) {
      console.error('Error in overall approval process:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        toast.error(`Lỗi trong quá trình duyệt đơn: ${error.response.data.message || 'Có lỗi xảy ra khi duyệt đơn'}`);
      } else {
        toast.error(error.message || 'Có lỗi xảy ra khi duyệt đơn');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!denyReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/approve-step/deny',
        {
          step: request.waiting_step,
          approverId: null,
          donKiemDuyetId: request.id,
          denyReason: denyReason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Đã từ chối đơn!', {
        onClose: () => {
          navigate('/pending-approvals');
        }
      });
      setDenyDialogOpen(false);
      setDenyReason('');
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Có lỗi xảy ra khi từ chối đơn');
    }
  };

  const handleViewAttachment = () => {
    if (attachment?.url) {
      window.open(`https://drive.usercontent.google.com/download?id=${attachment.url}&export=download&authuser=0`);
    }
  };

  if (!request) {
    return <Typography>Loading...</Typography>;
  }

  

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2CA068' }}>
          Chi tiết đơn
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            borderColor: '#2CA068',
            color: '#2CA068',
            '&:hover': {
              borderColor: '#2CA068',
              backgroundColor: 'rgba(44, 160, 104, 0.04)',
            },
          }}
        >
          Quay lại
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : request ? (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tiêu đề
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {request.title}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Loại đơn
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {request.paperType?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Người gửi
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {request.author?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ngày tạo
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(request.created_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Mô tả
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {request.description}
                </Typography>
              </Grid>
              {attachment && (
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    onClick={handleViewAttachment}
                    sx={{
                      borderColor: '#2CA068',
                      color: '#2CA068',
                      '&:hover': {
                        borderColor: '#2CA068',
                        backgroundColor: 'rgba(44, 160, 104, 0.04)',
                      },
                    }}
                  >
                    {attachment.fileName}
                  </Button>
                </Grid>
              )}
              {isFromCancelled && request.denyReason && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Lý do từ chối
                  </Typography>
                  <Typography 
                    variant="body1" 
                    gutterBottom
                    sx={{ 
                      color: '#FF4D4F',
                      backgroundColor: '#FFE8E8',
                      p: 2,
                      borderRadius: 1
                    }}
                  >
                    {request.denyReason}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {!isFromHistory && !isFromCancelled && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeny}
                sx={{
                  borderColor: '#FF4D4F',
                  color: '#FF4D4F',
                  '&:hover': {
                    borderColor: '#FF4D4F',
                    backgroundColor: 'rgba(255, 77, 79, 0.04)',
                  },
                }}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                onClick={handleAccept}
                sx={{
                  backgroundColor: '#2CA068',
                  '&:hover': {
                    backgroundColor: '#228055',
                  },
                }}
              >
                Duyệt
              </Button>
            </Box>
          )}
        </Box>
      ) : null}
    </Box>
  );
}

export default RequestDetails; 
