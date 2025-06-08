
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Mock data - replace with actual API calls

function CancelledRequests() {
  const navigate = useNavigate();
  const [canceledRequests, setCanceledRequests] = useState([]);
  const [deniedRequests, setDeniedRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch canceled requests (from author)
        const canceledResponse = await axios.get(
          'http://localhost:8080/paper/author/view-by-status?status=CANCELED',
          { headers }
        );
        setCanceledRequests(canceledResponse.data);

        // Fetch denied requests (from approver)
        const deniedResponse = await axios.get(
          'http://localhost:8080/paper/approver/view-by-status?status=DENY',
          { headers }
        );
        setDeniedRequests(deniedResponse.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleViewRequest = (requestId) => {
    navigate(`/request/${requestId}`, { state: { from: 'cancelled' } });
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'tam_ung':
        return 'Đơn đề nghị tạm ứng';
      case 'thanh_toan':
        return 'Đơn thanh toán';
      case 'xin_nghi':
        return 'Đơn xin nghỉ';
      default:
        return type;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2CA068' }}>
        Đơn bị hủy
      </Typography>
      
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E6F4EF', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F6FAF8' }}>
              <TableCell>STT</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Loại đơn</TableCell>
              <TableCell>Người gửi</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {canceledRequests.map((request, index) => (
              <TableRow key={request.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>{request.paperType?.name}</TableCell>
                <TableCell>{request.author?.name}</TableCell>
                <TableCell>{new Date(request.created_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label="Đã hủy"
                    sx={{
                      backgroundColor: '#FFE8E8',
                      color: '#FF4D4F',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleViewRequest(request.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2CA068' }}>
        Đơn đã hủy
      </Typography>
      
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E6F4EF' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F6FAF8' }}>
              <TableCell>STT</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Loại đơn</TableCell>
              <TableCell>Người gửi</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deniedRequests.map((request, index) => (
              <TableRow key={request.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>{request.paperType?.name}</TableCell>
                <TableCell>{request.author?.name}</TableCell>
                <TableCell>{new Date(request.created_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label="Đã từ chối"
                    sx={{
                      backgroundColor: '#FFE8E8',
                      color: '#FF4D4F',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleViewRequest(request.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CancelledRequests; 