import React from 'react';
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
} from '@mui/material';

function RequestHistory() {
  // Mock data - replace with actual data from your API
  const requests = [
    {
      id: 1,
      requestNumber: 'REQ-001',
      title: 'Yêu cầu nghỉ phép',
      status: 'Đã ký',
      createdAt: '2024-03-20',
      signedAt: '2024-03-21',
    },
    // Add more mock data as needed
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2CA068' }}>
        Đơn đã ký
      </Typography>
      
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E6F4EF' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F6FAF8' }}>
              <TableCell>Mã đơn</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ngày ký</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.requestNumber}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    sx={{
                      backgroundColor: '#E6F4EF',
                      color: '#2CA068',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>{request.createdAt}</TableCell>
                <TableCell>{request.signedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default RequestHistory; 