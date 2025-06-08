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

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState(null);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFromHistory = location.state?.from === 'history';
  const isFromCancelled = location.state?.from === 'cancelled';

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching paper with ID:', id);
        const response = await axios.get(
          `http://localhost:8080/paper/view/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log('Full paper response:', response);
        console.log('Paper data:', response.data);
        console.log('Paper waiting_step:', response.data.waiting_step);
        console.log('Paper id:', response.data.id);
        setRequest(response.data);
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
        console.log(`Attempt ${attempt} of ${maxRetries} to call approve API`);
        console.log('Calling API with data:', approveData);
        
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

        console.log('API Response:', response.data);
        return response;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
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

      // Call approve API
      console.log('Calling approve API...');
      const approveData = {
        step: request.waiting_step,
        approverId: currentUser.id,
        donKiemDuyetId: request.id, 
        denyReason: null
      };
      console.log('Approval request data:', approveData);

      try {
        const approveResponse = await callApproveAPI(approveData, token);
        console.log('Approval response:', approveResponse.data);

        if (!approveResponse.data) {
          throw new Error('Không nhận được phản hồi từ server sau khi duyệt');
        }

        console.log('Approval successful');
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
          console.error('Error response headers:', approveError.response.headers);
          throw new Error(`Lỗi từ server khi duyệt: ${approveError.response.data.message || 'Không thể cập nhật trạng thái duyệt'}`);
        } else if (approveError.request) {
          console.error('No response received from approval API:', approveError.request);
          throw new Error('Không thể kết nối đến server để duyệt. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } else {
          console.error('Error message in approval API call:', approveError.message);
          throw new Error(`Lỗi khi gọi API duyệt: ${approveError.message}`);
        }
      }
    } catch (error) {
      console.error('Error in overall approval process:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error URL:', error.config?.url);
        console.error('Error method:', error.config?.method);
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
      console.log('Request data:', request);
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
      console.log('Deny response:', response.data);
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

  if (!request) {
    return <Typography>Loading...</Typography>;
  }

  console.log(`deny reason is ${request.denyReason}`)

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
