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
  Tooltip,
} from '@mui/material';

// Mock data - replace with actual API calls
const mockRequests = [
  {
    id: '1',
    title: 'Đơn xin chuyển phòng ban',
    createdAt: '2024-04-23',
    status: 'cancelled',
    currentApprover: 'Trưởng phòng',
    type: 'thanh_toan',
    cancelReason: 'Đơn không đúng quy định',
    cancelledBy: 'Nguyễn Văn A',
    cancelledAt: '2024-04-24',
  },
  {
    id: '2',
    title: 'Đơn đề nghị tạm ứng',
    createdAt: '2024-04-22',
    status: 'cancelled',
    currentApprover: 'Kế toán',
    type: 'tam_ung',
    cancelReason: 'Thiếu chữ ký xác nhận',
    cancelledBy: 'Trần Thị B',
    cancelledAt: '2024-04-23',
  },
  {
    id: '3',
    title: 'Đơn xin nghỉ phép',
    createdAt: '2024-04-21',
    status: 'cancelled',
    currentApprover: 'Quản lý',
    type: 'xin_nghi',
    cancelReason: 'Không đủ ngày nghỉ phép',
    cancelledBy: 'Lê Văn C',
    cancelledAt: '2024-04-22',
  },
];

function CancelledRequests() {
  const [requests] = useState(mockRequests);

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
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Danh sách đơn đã hủy
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Loại đơn</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Người hủy</TableCell>
                  <TableCell>Ngày hủy</TableCell>
                  <TableCell>Lý do hủy</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{getRequestTypeLabel(request.type)}</TableCell>
                    <TableCell>{request.createdAt}</TableCell>
                    <TableCell>{request.cancelledBy}</TableCell>
                    <TableCell>{request.cancelledAt}</TableCell>
                    <TableCell>
                      <Tooltip title={request.cancelReason}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'error.main',
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {request.cancelReason}
                        </Typography>
                      </Tooltip>
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

export default CancelledRequests; 