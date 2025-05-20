import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'react-toastify';

const steps = ['Upload File', 'Ký đơn', 'Xác nhận'];

function CreateRequest() {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const signatureRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
    } else {
      toast.error('Vui lòng chọn file Excel (.xlsx)');
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !file) {
      toast.error('Vui lòng chọn file Excel');
      return;
    }
    if (activeStep === 1 && !signatureRef.current?.isEmpty()) {
      toast.error('Vui lòng ký đơn');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Implement submit logic here
      toast.success('Đơn đã được tạo thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo đơn');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload File Excel
            </Typography>
            <input
              accept=".xlsx"
              style={{ display: 'none' }}
              id="excel-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="excel-file">
              <Button variant="contained" component="span">
                Chọn File
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đã chọn: {file.name}
              </Typography>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ký đơn
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
            <Button
              variant="outlined"
              onClick={() => signatureRef.current?.clear()}
              sx={{ mt: 2 }}
            >
              Xóa chữ ký
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Xác nhận thông tin
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề đơn"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  File đã chọn: {file?.name}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Tạo đơn mới
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Quay lại
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit}>
              Gửi đơn
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Tiếp tục
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateRequest; 