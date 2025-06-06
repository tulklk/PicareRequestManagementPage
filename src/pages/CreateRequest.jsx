import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { uploadToGoogleDrive } from '../utils/upload';
import axios from 'axios';

const paperTypes = [
  { id: 1, name: 'Đơn xin công tác' },
  { id: 2, name: 'Đơn xin thanh toán' }
];

const steps = ['Chọn loại đơn', 'Upload File PDF', 'Chọn người ký', 'Xác nhận'];

function CreateRequest() {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSignatures, setSelectedSignatures] = useState({});
  const [signatureStepsCount, setSignatureStepsCount] = useState(1);
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driveFileUrl, setDriveFileUrl] = useState(null);
  const [selectedPaperType, setSelectedPaperType] = useState('');

  // Fetch approvers only when moving to step 1
  const fetchApprovers = async () => {
    try {
      console.log('Step 5: Fetching list of approvers...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        toast.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      const response = await axios.get('http://localhost:8080/user/view-approver', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Step 5 completed: Approvers list fetched successfully');

      if (Array.isArray(response.data)) {
        setApprovers(response.data);
      } else {
        console.error('Invalid approvers data format:', response.data);
        setApprovers([]);
        toast.error('Định dạng dữ liệu người ký không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching approvers:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        if (error.response.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải danh sách người ký');
        }
      } else {
        toast.error('Không thể kết nối đến server');
      }
      setApprovers([]);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel' // xls
    ];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      try {
        setLoading(true);
        console.log('Step 1: User selected file:', selectedFile.name);
        
        // Step 2: Upload to Google Drive
        console.log('Step 2: Uploading file to Google Drive...');
        const fileUrl = await uploadToGoogleDrive(selectedFile);
        if (!fileUrl) {
          throw new Error('Failed to get file URL from Google Drive');
        }
        console.log('Step 2 completed: File uploaded to Drive successfully');
        setDriveFileUrl(fileUrl);
        
        // Step 3: Save file info to database
        console.log('Step 3: Saving file info to database...');
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const savedFile = await axios.post('http://localhost:8080/attachment/upload-paper', 
          {
            url: fileUrl,
            fileName: selectedFile.name
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Server response:', savedFile.data);
        
        if (!savedFile.data || !savedFile.data.url) {
          throw new Error('Invalid response from server');
        }

        setFile({
          file: selectedFile,
          url: savedFile.data.url,
          id: savedFile.data.id,
          fileName: savedFile.data.fileName,
          owner: savedFile.data.owner,
          apiData: savedFile.data
        });
        console.log('Step 3 completed: File info saved to database');
        toast.success('File đã được tải lên thành công!');

        // Step 5: Fetch approvers immediately after file upload
        console.log('Step 5: Fetching list of approvers...');
        await fetchApprovers();
      } catch (error) {
        console.error('Error in file upload process:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          toast.error(`Lỗi từ server: ${error.response.data.message || 'Không thể tải lên file'}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        } else {
          console.error('Error message:', error.message);
          toast.error(`Lỗi: ${error.message || 'Không thể tải lên file'}`);
        }
      } finally {
        setLoading(false);
        event.target.value = null;
      }
    } else {
      toast.error('Vui lòng chọn file PDF, PNG, JPEG hoặc Excel');
      event.target.value = null;
    }
  };

  const handleAttachmentChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    try {
      setLoading(true);
      console.log('Starting attachment uploads:', selectedFiles.map(f => f.name));
      
      const uploadPromises = selectedFiles.map(async (file) => {
        console.log('Uploading attachment:', file.name);
        
        // Step 1: Upload to Google Drive first
        console.log('Uploading to Google Drive...');
        const fileUrl = await uploadToGoogleDrive(file);
        if (!fileUrl) {
          throw new Error('Failed to get file URL from Google Drive');
        }
        console.log('Attachment uploaded to Drive successfully, URL:', fileUrl);
        
        // Step 2: Save file info to database only after successful Drive upload
        console.log('Saving file info to database...');
        const savedFile = await axios.post('http://localhost:8080/attachment/upload-paper', 
          {
            url: fileUrl,
            fileName: file.name
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!savedFile.data || !savedFile.data.id) {
          throw new Error('Failed to save file information to database');
        }
        console.log('File info saved to database:', savedFile.data);
        
        return {
          id: savedFile.data.id,
          file: file,
          name: file.name,
          url: fileUrl,
          apiData: savedFile.data
        };
      });

      const newAttachments = await Promise.all(uploadPromises);
      console.log('All attachments uploaded successfully:', newAttachments);
      
      setAttachments(prev => [...prev, ...newAttachments]);
      toast.success('File đính kèm đã được tải lên thành công!');
    } catch (error) {
      console.error('Error uploading attachments:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        toast.error(`Lỗi từ server: ${error.response.data.message || 'Không thể tải lên file đính kèm'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        console.error('Error message:', error.message);
        toast.error(`Lỗi: ${error.message || 'Không thể tải lên file đính kèm'}`);
      }
    } finally {
      setLoading(false);
      event.target.value = null;
    }
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
    toast.success('File đính kèm đã được xóa!');
  };

  const handleAddSignatureStep = () => {
    setSignatureStepsCount(prevCount => prevCount + 1);
  };

  const handleSignatureSelect = (stepIndex, approverId) => {
    console.log('Selecting approver:', { stepIndex, approverId });
    const approver = approvers.find(a => a.id === approverId);
    console.log('Found approver:', approver);
    
    if (approver) {
      setSelectedSignatures(prev => ({
        ...prev,
        [stepIndex]: approver
      }));
    } else {
      console.error('Approver not found for ID:', approverId);
      toast.error('Không tìm thấy người ký');
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!selectedPaperType) {
        toast.error('Vui lòng chọn loại đơn');
        return;
      }
      setActiveStep((prevStep) => prevStep + 1);
    } else if (activeStep === 1) {
      if (!file || !file.url) {
        toast.error('Vui lòng chọn và đợi file PDF tải lên hoàn tất');
        return;
      }
      setActiveStep((prevStep) => prevStep + 1);
    } else if (activeStep === 2) {
      // Validate signature selections
      for (let i = 0; i < signatureStepsCount; i++) {
        if (!selectedSignatures[i]) {
           toast.error(`Vui lòng chọn người ký cho Bước ${i + 1}`);
           return;
        }
      }
      setActiveStep((prevStep) => prevStep + 1);
    } else if (activeStep === 3) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedSignatures).length < signatureStepsCount) {
      toast.error('Vui lòng chọn người ký cho tất cả các bước');
      return;
    }

    for (let i = 0; i < signatureStepsCount; i++) {
      if (!selectedSignatures[i]) {
        toast.error('Vui lòng chọn người ký cho tất cả các bước theo thứ tự');
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Validate required data
      if (!file?.apiData?.id) {
        throw new Error('File ID is missing');
      }

      if (!title.trim()) {
        throw new Error('Title is required');
      }

      if (!selectedPaperType) {
        throw new Error('Vui lòng chọn loại đơn');
      }

      const paperId = parseInt(file.apiData.id);
      const donDinhKemIdList = attachments.map(att => parseInt(att.apiData.id));
      const approverIdList = Object.values(selectedSignatures).map(signer => parseInt(signer.id));

      // Validate the data
      if (isNaN(paperId)) {
        throw new Error('Invalid paper ID');
      }

      if (donDinhKemIdList.some(id => isNaN(id))) {
        throw new Error('Invalid attachment ID found');
      }

      if (approverIdList.some(id => isNaN(id))) {
        throw new Error('Invalid approver ID found');
      }

      const paperRequest = {
        paperId: paperId,
        donDinhKemIdList: donDinhKemIdList,
        approverIdList: approverIdList,
        paperTypeId: parseInt(selectedPaperType),
        title: title.trim(),
        description: description.trim()
      };
      
      console.log('Request body being sent:', JSON.stringify(paperRequest, null, 2));
      
      // Ensure the request body is properly structured
      const response = await axios.post('http://localhost:8080/paper/create', 
        JSON.stringify(paperRequest),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('API Response:', response.data);
      
      toast.success('Đơn đã được tạo thành công!');
      
      // Reset form
      setActiveStep(0);
      setFile(null);
      setAttachments([]);
      setTitle('');
      setDescription('');
      setSelectedSignatures({});
      setSignatureStepsCount(1);
      setDriveFileUrl(null);
    } catch (error) {
      console.error('Error creating paper:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn');
    } finally {
      setLoading(false);
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
            <FormControl fullWidth required>
              <InputLabel>Loại đơn</InputLabel>
              <Select
                value={selectedPaperType}
                label="Loại đơn"
                onChange={(e) => setSelectedPaperType(e.target.value)}
              >
                {paperTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Upload File Trình Ký
            </Typography>
            <input
              accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
              style={{ display: 'none' }}
              id="pdf-file"
              type="file"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="pdf-file">
              <Button 
                variant="contained" 
                component="span"
                disabled={loading}
              >
                {loading ? 'Đang tải lên...' : 'Chọn File'}
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đã chọn: {file.file.name}
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
              disabled={loading}
            />
            <label htmlFor="attachment-files">
              <Button 
                variant="outlined" 
                component="span"
                disabled={loading}
              >
                {loading ? 'Đang tải lên...' : 'Thêm File Đính Kèm'}
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
                        disabled={loading}
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
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Chọn người ký theo từng bước
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
                      <MenuItem value="">
                        <em>Chọn người ký</em>
                      </MenuItem>
                      {Array.isArray(approvers) && approvers.length > 0 ? (
                        approvers.map((approver) => (
                          <MenuItem key={approver.id} value={approver.id}>
                            {approver.name} ({approver.role})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          <em>Không có người ký</em>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddSignatureStep}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              Thêm bước ký
            </Button>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Xác nhận thông tin
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Loại đơn: {paperTypes.find(type => type.id === parseInt(selectedPaperType))?.name}
                </Typography>
              </Grid>
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
                  File trình ký: {file?.file.name}
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
                        <Typography variant="body2">
                          {selectedSignatures[index].name} ({selectedSignatures[index].role})
                        </Typography>
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
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }} disabled={loading}>
              Quay lại
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Gửi đơn'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={loading}
            >
              Tiếp tục
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateRequest; 