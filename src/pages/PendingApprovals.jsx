import React, { useState } from 'react';
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
  Chip,
  IconButton,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with actual API calls
const mockRequests = [
  {
    id: '1',
    
    title: 'Đơn xin nghỉ phép',
    createdAt: '2024-04-25',
    status: 'pending',
    requester: 'Nguyễn Văn A',
    department: 'Phòng Kỹ thuật',
  },
  {
    id: '2',
    title: 'Đơn xin tăng lương',
    createdAt: '2024-04-24',
    status: 'pending',
    requester: 'Trần Văn B',
    department: 'Phòng Nhân sự',
  },
  {
    id: '3',
    title: 'Đơn xin chuyển phòng ban',
    createdAt: '2024-04-23',
    status: 'pending',
    requester: 'Lê Văn C',
    department: 'Phòng Kinh doanh',
  },
];

function PendingApprovals() {
  const navigate = useNavigate();
  const [requests] = useState(mockRequests);

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
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Người gửi</TableCell>
                  <TableCell>Phòng ban</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.requester}</TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>{request.createdAt}</TableCell>
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