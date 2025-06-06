import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';


function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');

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
      }
    };

    fetchRequest();
  }, [id]);

  const handleAccept = async () => {
    try {
      console.log('Request data:', request);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/approve-step/approve',
        {
          step: request.waiting_step,
          approverId: null,
          donKiemDuyetId: request.id,
          denyReason: null
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Approve response:', response.data);
      toast.success('Đã duyệt đơn thành công!', {
        onClose: () => {
          navigate('/pending-approvals');
        }
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Có lỗi xảy ra khi duyệt đơn');
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

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/attachment/view/${request.paper_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Error fetching attachment:', error);
    }
  };

  if (!request) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Chi tiết đơn
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Thông tin đơn
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Tiêu đề"
                  secondary={request.title}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Mô tả"
                  secondary={request.description}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Ngày tạo"
                  secondary={new Date(request.created_date).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Tải xuống
                </Button>
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Trạng thái
            </Typography>
            <Chip
              label={request.status === 'PENDING' ? 'Đang chờ ký' : 'Đã ký'}
              color={request.status === 'PENDING' ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleAccept}
              >
                Duyệt
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setDenyDialogOpen(true)}
              >
                Từ chối
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Deny Dialog */}
      <Dialog
        open={denyDialogOpen}
        onClose={() => {
          setDenyDialogOpen(false);
          setDenyReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận từ chối đơn</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            placeholder="Nhập lý do từ chối"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDenyDialogOpen(false);
              setDenyReason('');
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeny}
            color="error"
            variant="contained"
          >
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RequestDetails; 