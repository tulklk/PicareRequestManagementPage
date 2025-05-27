import React, { useState } from 'react';
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const steps = ['Upload File PDF', 'Chọn người ký', 'Xác nhận'];

// Danh sách tất cả người ký tiềm năng
const allSigners = [
  { id: 1, name: 'Nguyễn Văn A (Trưởng phòng)', signature: '/signatures/signature1.png' },
  { id: 2, name: 'Trần Văn B (Trưởng phòng)', signature: '/signatures/signature2.png' },
  { id: 3, name: 'Lê Văn C (Giám đốc)', signature: '/signatures/signature3.png' },
  { id: 4, name: 'Phạm Văn D (Giám đốc)', signature: '/signatures/signature4.png' },
  { id: 5, name: 'Hoàng Văn E (Kế toán)', signature: '/signatures/signature5.png' },
  { id: 6, name: 'Đỗ Văn F (Kế toán)', signature: '/signatures/signature6.png' },
];

function CreateRequest() {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSignatures, setSelectedSignatures] = useState({});
  const [requestType, setRequestType] = useState('');
  const [signatureStepsCount, setSignatureStepsCount] = useState(1); // State for dynamic number of signature steps

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      toast.success('File PDF đã được chọn thành công!');
    } else {
      toast.error('Vui lòng chọn file PDF');
      event.target.value = null; // Reset input
    }
  };

  const handleAttachmentChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newAttachments = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    toast.success('File đính kèm đã được thêm!');
    event.target.value = null; // Reset input
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
    toast.success('File đính kèm đã được xóa!');
  };

  const handleAddSignatureStep = () => {
    setSignatureStepsCount(prevCount => prevCount + 1);
  };

  const handleSignatureSelect = (stepIndex, signerId) => {
    const signer = allSigners.find(s => s.id === signerId);
    setSelectedSignatures(prev => ({
      ...prev,
      [stepIndex]: signer
    }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!requestType) {
        toast.error('Vui lòng chọn loại đơn');
        return;
      }
      if (!file) {
        toast.error('Vui lòng chọn file PDF');
        return;
      }
    }

    // Validation for signature steps
    if (activeStep === 1) {
      for (let i = 0; i < signatureStepsCount; i++) {
        if (!selectedSignatures[i]) {
           toast.error(`Vui lòng chọn người ký cho Bước ${i + 1}`);
           return;
        }
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    // Final validation before submit (optional, but good practice)
    if (Object.keys(selectedSignatures).length < signatureStepsCount) {
       toast.error('Vui lòng chọn người ký cho tất cả các bước');
       return;
    }
    // You might want to check if there are any gaps in selected steps (e.g., step 0 and step 2 selected, but not step 1)
    for (let i = 0; i < signatureStepsCount; i++) {
        if (!selectedSignatures[i]) {
             toast.error('Vui lòng chọn người ký cho tất cả các bước theo thứ tự');
             return;
        }
    }


    try {
      // Implement submit logic here using file, attachments, title, description, selectedSignatures, requestType
      console.log('Submitting Request:', {
        file: file?.name,
        attachments: attachments.map(att => att.name),
        title,
        description,
        selectedSignatures: Object.values(selectedSignatures), // Send selected signers as an array
        requestType,
      });
      toast.success('Đơn đã được tạo thành công!');
      // Reset form (optional)
      setActiveStep(0);
      setFile(null);
      setAttachments([]);
      setTitle('');
      setDescription('');
      setSelectedSignatures({});
      setRequestType('');
      setSignatureStepsCount(1); // Reset signature steps count

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
              Chọn loại đơn
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Loại đơn</FormLabel>
              <RadioGroup
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                <FormControlLabel 
                  value="tam_ung" 
                  control={<Radio />} 
                  label="Đơn đề nghị tạm ứng" 
                />
                <FormControlLabel 
                  value="thanh_toan" 
                  control={<Radio />} 
                  label="Đơn thanh toán" 
                />
                <FormControlLabel 
                  value="xin_nghi" 
                  control={<Radio />} 
                  label="Đơn xin nghỉ" 
                />
              </RadioGroup>
            </FormControl>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Upload File Trình Ký
            </Typography>
            <input
              accept=".pdf"
              style={{ display: 'none' }}
              id="pdf-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="pdf-file">
              <Button 
                variant="contained" 
                component="span"
                disabled={!requestType}
              >
                Chọn File
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đã chọn: {file.name}
              </Typography>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              File Đính Kèm
            </Typography>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="attachment-files"
              type="file"
              multiple
              onChange={handleAttachmentChange}
            />
            <label htmlFor="attachment-files">
              <Button 
                variant="outlined" 
                component="span"
                disabled={!requestType}
              >
                Thêm File Đính Kèm
              </Button>
            </label>
            {attachments.length > 0 && (
              <List sx={{ mt: 2 }}>
                {attachments.map((attachment) => (
                  <ListItem
                    key={attachment.id}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={attachment.name} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Chọn người ký theo các bước
            </Typography>
            <Grid container spacing={3}>
              {[...Array(signatureStepsCount)].map((_, index) => (
                <Grid item xs={12} key={index}>
                  <FormControl fullWidth disabled={index > 0 && !selectedSignatures[index - 1]}>
                    <InputLabel>Bước {index + 1}</InputLabel>
                    <Select
                      value={selectedSignatures[index]?.id || ''}
                      label={`Bước ${index + 1}`}
                      onChange={(e) => handleSignatureSelect(index, e.target.value)}
                    >
                      <MenuItem value=""><em>Chọn người ký</em></MenuItem>
                      {allSigners.map((signer) => (
                        <MenuItem key={signer.id} value={signer.id}>
                          {signer.name}
                        </MenuItem>
                      ))
                      }
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddSignatureStep}
              sx={{ mt: 2 }}
            >
              Thêm bước ký
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
                  File trình ký: {file?.name}
                </Typography>
              </Grid>
              {attachments.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    File đính kèm:
                  </Typography>
                  <List>
                    {attachments.map((attachment) => (
                      <ListItem key={attachment.id}>
                        <ListItemText primary={attachment.name} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Quy trình ký:
                </Typography>
                {[...Array(signatureStepsCount)].map((_, index) => (
                   selectedSignatures[index] && (
                      <Box key={index} sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Bước {index + 1}:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img
                            src={selectedSignatures[index].signature}
                            alt={selectedSignatures[index].name}
                            style={{ maxWidth: '100px', height: 'auto' }}
                          />
                          <Typography variant="body2">
                            {selectedSignatures[index].name}
                          </Typography>
                        </Box>
                      </Box>
                   )
                ))}
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
          ))
          }
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
            )
          }
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateRequest; 