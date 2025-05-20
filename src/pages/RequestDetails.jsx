import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'react-toastify';

// Mock data - replace with actual API calls
const mockRequest = {
  id: '1',
  title: 'Đơn xin nghỉ phép',
  description: 'Xin nghỉ phép từ ngày 01/05/2024 đến 03/05/2024',
  createdAt: '2024-04-25',
  status: 'pending',
  file: 'don-xin-nghi-phep.xlsx',
  approvalSteps: [
    {
      id: 1,
      role: 'Người tạo đơn',
      approver: 'Nguyễn Văn A',
      status: 'approved',
      approvedAt: '2024-04-25 09:00',
      comment: 'Đã ký',
    },
    {
      id: 2,
      role: 'Trưởng phòng',
      approver: 'Trần Văn B',
      status: 'pending',
      approvedAt: null,
      comment: null,
    },
    {
      id: 3,
      role: 'Giám đốc',
      approver: 'Lê Văn C',
      status: 'pending',
      approvedAt: null,
      comment: null,
    },
  ],
};

function RequestDetails() {
  const { id } = useParams();
  const [signatureRef] = useState(React.createRef());
  const [currentUser] = useState({ role: 'Trưởng phòng', name: 'Trần Văn B' });

  const handleApprove = async () => {
    if (signatureRef.current?.isEmpty()) {
      toast.error('Vui lòng ký đơn');
      return;
    }
    try {
      // Implement approve logic here
      toast.success('Đã duyệt đơn thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt đơn');
    }
  };

  const handleReject = async () => {
    try {
      // Implement reject logic here
      toast.success('Đã từ chối đơn!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi từ chối đơn');
    }
  };

  const handleDownload = () => {
    // Implement download logic here
    toast.success('Đang tải file...');
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <PendingIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

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
                  secondary={mockRequest.title}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Mô tả"
                  secondary={mockRequest.description}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Ngày tạo"
                  secondary={mockRequest.createdAt}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="File đính kèm"
                  secondary={mockRequest.file}
                />
                <Button
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
              label={mockRequest.status === 'pending' ? 'Đang chờ duyệt' : 'Đã duyệt'}
              color={mockRequest.status === 'pending' ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Quy trình ký duyệt
            </Typography>
            <Stepper orientation="vertical">
              {mockRequest.approvalSteps.map((step) => (
                <Step key={step.id} active={step.status !== 'pending'} completed={step.status === 'approved'}>
                  <StepLabel
                    icon={getStepIcon(step.status)}
                    optional={
                      step.approvedAt && (
                        <Typography variant="caption">
                          {step.approvedAt}
                        </Typography>
                      )
                    }
                  >
                    <Typography variant="subtitle1">
                      {step.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.approver}
                    </Typography>
                    {step.comment && (
                      <Typography variant="body2" color="text.secondary">
                        {step.comment}
                      </Typography>
                    )}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Grid>

          {mockRequest.status === 'pending' && currentUser.role === 'Trưởng phòng' && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Ký duyệt
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mt: 2,
                  border: '1px solid #ccc',
                  borderRadius: 1,
                }}
              >
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas',
                  }}
                />
              </Paper>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApprove}
                >
                  Duyệt
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleReject}
                >
                  Từ chối
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}

export default RequestDetails; 