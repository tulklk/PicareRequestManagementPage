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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
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

// Mock signature images - replace with actual signature images
const signatureImages = [
  {
    id: 1,
    name: 'Chữ ký 1',
    url: '/signatures/signature1.png',
  },
  {
    id: 2,
    name: 'Chữ ký 2',
    url: '/signatures/signature2.png',
  },
  {
    id: 3,
    name: 'Chữ ký 3',
    url: '/signatures/signature3.png',
  },
];

// Predefined rejection reasons
const rejectionReasons = [
  'Thiếu thông tin cần thiết',
  'Không đúng quy định',
  'Không đủ điều kiện',
  'Không phù hợp với chính sách công ty',
  'Khác',
];

function RequestDetails() {
  const { id } = useParams();
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [currentUser] = useState({ role: 'Trưởng phòng', name: 'Trần Văn B' });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleApprove = async () => {
    if (!selectedSignature) {
      toast.error('Vui lòng chọn chữ ký');
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
    if (!selectedReason) {
      toast.error('Vui lòng chọn lý do từ chối');
      return;
    }

    if (selectedReason === 'Khác' && !customReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const rejectionReason = selectedReason === 'Khác' ? customReason : selectedReason;
      // Implement reject logic here with rejectionReason
      toast.success('Đã từ chối đơn!');
      setRejectDialogOpen(false);
      setSelectedReason('');
      setCustomReason('');
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
              label={mockRequest.status === 'pending' ? 'Đang chờ ký' : 'Đã ký'}
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
                Chọn chữ ký
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {signatureImages.map((signature) => (
                  <Grid item xs={12} sm={4} key={signature.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selectedSignature?.id === signature.id ? '2px solid #2CA068' : '1px solid #ccc',
                        '&:hover': {
                          borderColor: '#2CA068',
                        },
                      }}
                      onClick={() => setSelectedSignature(signature)}
                    >
                      <img
                        src={signature.url}
                        alt={signature.name}
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '150px',
                          objectFit: 'contain',
                        }}
                      />
                      <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                        {signature.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
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
                  onClick={() => setRejectDialogOpen(true)}
                >
                  Từ chối
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setSelectedReason('');
          setCustomReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận từ chối đơn</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
            <FormLabel component="legend">Lý do từ chối</FormLabel>
            <RadioGroup
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              {rejectionReasons.map((reason) => (
                <FormControlLabel
                  key={reason}
                  value={reason}
                  control={<Radio />}
                  label={reason}
                />
              ))}
            </RadioGroup>
            {selectedReason === 'Khác' && (
              <TextField
                fullWidth
                multiline
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập lý do từ chối"
                sx={{ mt: 2 }}
              />
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setSelectedReason('');
              setCustomReason('');
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleReject}
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