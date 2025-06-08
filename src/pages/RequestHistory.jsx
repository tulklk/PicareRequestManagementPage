
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RequestHistory() {
  const navigate = useNavigate();
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [successRequests, setSuccessRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch approved requests
        const approvedResponse = await axios.get(
          'http://localhost:8080/paper/approver/view-by-status?status=CHECKED',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setApprovedRequests(approvedResponse.data);

        // Fetch success requests
        const successResponse = await axios.get(
          'http://localhost:8080/paper/author/view-by-status?status=SUCCESS',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setSuccessRequests(successResponse.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setApprovedRequests([]);
        setSuccessRequests([]);
      }
    };

    fetchRequests();
  }, []);

  const handleViewRequest = (requestId) => {
    navigate(`/request/${requestId}`, { state: { from: 'history' } });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2CA068' }}>
        Đơn được duyệt
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
            {approvedRequests.map((request, index) => (
              <TableRow key={request.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>{request.paperType?.name}</TableCell>
                <TableCell>{request.author?.name}</TableCell>
                <TableCell>{new Date(request.created_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label="Đã duyệt"
                    sx={{
                      backgroundColor: '#E6F4EF',
                      color: '#2CA068',
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
        Đơn đã duyệt
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
            {successRequests.map((request, index) => (
              <TableRow key={request.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>{request.paperType?.name}</TableCell>
                <TableCell>{request.author?.name}</TableCell>
                <TableCell>{new Date(request.created_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label="Đã duyệt"
                    sx={{
                      backgroundColor: '#E6F4EF',
                      color: '#2CA068',
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

export default RequestHistory; 
