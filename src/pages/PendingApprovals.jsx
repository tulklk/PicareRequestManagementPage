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
  IconButton,
  Chip,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PendingApprovals() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:8080/paper/approver/view-by-status?status=WAITING',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setRequests([]);
      }
    };

    fetchRequests();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Đơn chờ ký
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
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
                {requests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.paperType?.name}</TableCell>
                    <TableCell>{request.author?.name}</TableCell>
                    <TableCell>{new Date(request.created_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        sx={{ 
                          backgroundColor: request.status === 'PENDING' ? '#FFD700' : 'inherit',
                          color: request.status === 'PENDING' ? '#000000' : 'inherit',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/request/${request.id}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PendingApprovals; 