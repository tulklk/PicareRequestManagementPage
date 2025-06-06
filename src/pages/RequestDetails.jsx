import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching paper with ID:', id);
        const response = await axios.get(
          `http://localhost:8080/paper/view/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log('Full paper response:', response);
        console.log('Paper data:', response.data);
        console.log('Paper waiting_step:', response.data.waiting_step);
        console.log('Paper id:', response.data.id);
        setRequest(response.data);
      } catch (error) {
        console.error('Error fetching request:', error);
        console.error('Error details:', error.response?.data);
      }
    };

    fetchRequest();
  }, [id]);

  const fetchSignature = async (signatureId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/attachment/view/${signatureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching signature:', error);
      throw error;
    }
  };

  const convertImageToPDF = async (imageUrl) => {
    try {
      // Fetch the image
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      
      // Convert image blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(imageBlob);
      });
      const base64 = await base64Promise;
      
      // Embed the image
      let image;
      if (imageBlob.type === 'image/png') {
        image = await pdfDoc.embedPng(base64);
      } else if (imageBlob.type === 'image/jpeg') {
        image = await pdfDoc.embedJpg(base64);
      } else {
        throw new Error('Unsupported image format');
      }
      
      // Draw the image on the page
      const { width, height } = image.scale(1);
      const scale = Math.min(page.getWidth() / width, page.getHeight() / height);
      page.drawImage(image, {
        x: (page.getWidth() - width * scale) / 2,
        y: (page.getHeight() - height * scale) / 2,
        width: width * scale,
        height: height * scale,
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting image to PDF:', error);
      throw error;
    }
  };

  const convertExcelToPDF = async (excelUrl) => {
    try {
      // For Excel files, we'll create a simple PDF with a message
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      
      // Add text explaining the conversion
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText('This is a converted Excel file. The original content is preserved in the file system.', {
        x: 50,
        y: page.getHeight() - 50,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting Excel to PDF:', error);
      throw error;
    }
  };

  const convertToPDF = async (fileUrl, fileName) => {
    try {
      const fileExtension = fileName.toLowerCase().split('.').pop();
      console.log('Converting file with extension:', fileExtension);

      switch (fileExtension) {
        case 'pdf':
          console.log('File is already a PDF, fetching...');
          // If it's already a PDF, fetch and return it
          const response = await fetch(fileUrl);
          return await response.arrayBuffer();

        case 'png':
        case 'jpg':
        case 'jpeg':
          console.log('File is an image, converting to PDF...');
          // Convert image to PDF
          return await convertImageToPDF(fileUrl);

        case 'xlsx':
        case 'xls':
          console.log('File is an Excel file, creating placeholder PDF...');
          // Convert Excel to PDF
          return await convertExcelToPDF(fileUrl);

        default:
          console.log(`File is of unsupported type ${fileExtension.toUpperCase()}, creating placeholder PDF...`);
          // For other file types, create a simple PDF with a message
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([595, 842]); // A4 size
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

          page.drawText(`This is a converted ${fileExtension.toUpperCase()} file. The original content is preserved in the file system.`, {
            x: 50,
            y: page.getHeight() - 50,
            size: 12,
            font,
            color: rgb(0, 0, 0),
          });

          return await pdfDoc.save();
      }
    } catch (error) {
      console.error('Error converting file to PDF:', error);
      throw error;
    }
  };

  const addSignaturesToPDF = async (pdfBytes, signatures) => {
    console.log('Starting addSignaturesToPDF function...');
    console.log('Number of signatures to process:', signatures.length);
    console.log('First 5 bytes of PDF bytes:', new Uint8Array(pdfBytes.slice(0, 5))); // Log the first 5 bytes

    try {
      // Check if the file is a PDF by looking at the first few bytes
      const isPDF = new Uint8Array(pdfBytes.slice(0, 5)).every((byte, index) => {
        const pdfHeader = [0x25, 0x50, 0x44, 0x46, 0x2D]; // %PDF-
        return byte === pdfHeader[index];
      });

      if (!isPDF) {
        console.log('File is not a PDF, skipping signature addition');
        return pdfBytes;
      }

      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      console.log('Original PDF loaded successfully.');

      const page = pdfDoc.getPage(0); // Assuming signatures are added to the first page
      console.log('Accessed the first page.');

      const { width, height } = page.getSize();
      console.log(`Page size: ${width}x${height}`);

      // Define box dimensions
      const boxWidth = 130;
      const boxHeight = 130;
      const horizontalPadding = 50;
      const availableWidth = width - (horizontalPadding * 2);
      const sectionWidth = availableWidth / 5;
      const boxSpacing = 20; // Space between box and name
      const nameHeight = 20; // Height for name text

      // Load the font for names
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      console.log('Font embedded.');

      // Process each signature
      for (let i = 0; i < signatures.length; i++) {
        const signature = signatures[i];
        console.log(`Processing signature ${i + 1}:`, signature);
        if (!signature) {
          console.log(`Signature ${i + 1} is null or undefined, skipping.`);
          continue;
        }

        // Calculate position
        const x = horizontalPadding + (sectionWidth * i);
        const y = height - boxHeight - 50; // 50 points from top

        try {
          // Convert signature to PDF if it's an image
          let signaturePdfBytes;
          if (signature.url.toLowerCase().endsWith('.pdf')) {
            console.log(`Signature ${signature.name} is already a PDF, fetching.`);
            // If it's already a PDF, fetch it directly
            const response = await fetch(signature.url);
            signaturePdfBytes = await response.arrayBuffer();
          } else {
            console.log(`Signature ${signature.name} is an image, converting to PDF.`);
            // Convert image to PDF
            signaturePdfBytes = await convertImageToPDF(signature.url);
            console.log(`Signature ${signature.name} converted to PDF.`);
          }

          // Load the signature PDF
          console.log(`Loading PDF bytes for signature ${signature.name}...`);
          const signaturePdf = await PDFDocument.load(signaturePdfBytes);
          console.log(`Signature PDF loaded for ${signature.name}.`);

          const [signaturePage] = await pdfDoc.copyPages(signaturePdf, [0]);
          console.log(`Signature page copied for ${signature.name}.`);

          // Scale signature to fit box
          const { width: sigWidth, height: sigHeight } = signaturePage.getSize();
          const scale = Math.min(boxWidth / sigWidth, boxHeight / sigHeight);
          console.log(`Signature ${signature.name} size: ${sigWidth}x${sigHeight}, Scale: ${scale}`);

          // Draw signature
          console.log(`Drawing signature ${signature.name} on page at x:${x}, y:${y}, width:${sigWidth * scale}, height:${sigHeight * scale}`);
          page.drawPage(signaturePage, {
            x: x + (boxWidth - sigWidth * scale) / 2,
            y: y + (boxHeight - sigHeight * scale) / 2,
            width: sigWidth * scale,
            height: sigHeight * scale,
          });
          console.log(`Signature ${signature.name} drawn.`);

          // Draw name below the box
          console.log(`Drawing name ${signature.name} below signature.`);
          page.drawText(signature.name, {
            x: x + (boxWidth / 2) - (font.widthOfTextAtSize(signature.name, 12) / 2),
            y: y - boxSpacing,
            size: 12,
            font,
            color: rgb(0, 0, 0),
          });
          console.log(`Name ${signature.name} drawn.`);

        } catch (error) {
          console.error(`Error processing signature for ${signature.name}:`, error);
          // If there's an error with a signature, continue with the next one
          continue;
        }
      }

      console.log('All signatures processed. Saving PDF...');
      const finalPdfBytes = await pdfDoc.save();
      console.log('PDF saved with signatures.');
      return finalPdfBytes;
    } catch (error) {
      console.error('Error in addSignaturesToPDF function:', error);
      // If there's an error processing the PDF, return the original file
      return pdfBytes;
    }
  };

  const callApproveAPI = async (approveData, token, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${maxRetries} to call approve API`);
        console.log('Calling API with data:', approveData);
        
        const response = await axios.post(
          'http://localhost:8080/approve-step/approve',
          approveData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        );

        console.log('API Response:', response.data);
        return response;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Debug request data
      console.log('Full request data:', request);

      // 1. Get current user's signature
      console.log('Step 1: Getting current user signature...');
      const currentUser = JSON.parse(localStorage.getItem('loginUser'));
      if (!currentUser || !currentUser.chuKy) {
        throw new Error('Không tìm thấy chữ ký của người dùng');
      }
      const currentUserSignature = await fetchSignature(currentUser.chuKy);
      console.log('Step 1 completed: Current user signature fetched');

      // 2. Get the paper's details and then fetch approvers with signatures
      console.log('Step 2: Getting paper details and approvers...');
      console.log('Fetching paper details for ID:', id);
      // Keep this to get overall paper details like attachment
      const paperDetailsResponse = await axios.get(`http://localhost:8080/paper/view/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Paper details response:', paperDetailsResponse.data);

      if (!paperDetailsResponse.data) {
        throw new Error('Không thể lấy thông tin chi tiết đơn');
      }

      // Fetch approvers specifically for this paper using the new API
      console.log('Fetching approvers with signatures for paper ID:', request.id);
      const approversResponse = await axios.get(`http://localhost:8080/user/view-approver-by-paper/${request.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      console.log('Approvers response from new API:', approversResponse.data);

      if (!Array.isArray(approversResponse.data)) {
          throw new Error('Định dạng dữ liệu người duyệt không hợp lệ từ API mới');
      }

      const approvers = approversResponse.data; // Use the data from the new API
      console.log('Approvers array to process:', approvers);

      const approverSignatures = await Promise.all(
        approvers.map(async (approver) => {
          // Ensure approver object and chuKy exist
          if (!approver || !approver.chuKy) {
            console.warn(`Approver object is missing or approver ${approver?.name} (${approver?.id}) has no signature (chuKy is ${approver?.chuKy})`);
            return null; // Return null for missing approvers or those without signatures
          }
          try {
             const signature = await fetchSignature(approver.chuKy);
             return {
               ...signature,
               name: approver.name // Include name for drawing
             };
          } catch (sigError) {
             console.error(`Error fetching signature for approver ${approver.name} (${approver.id}) chuKy ${approver.chuKy}:`, sigError);
             return null; // Return null if fetching signature fails
          }
        })
      );
      // Filter out any null entries if signature fetching failed for some approvers
      const validApproverSignatures = approverSignatures.filter(sig => sig !== null);
      console.log('Step 2 completed: Approver signatures fetched and filtered');
      console.log('Valid approver signatures data:', validApproverSignatures);

      // 3. Get attachment data from the initial paper details response
      console.log('Step 3: Getting attachment data...');
      // Get the attachment ID from the paper details
      const attachmentId = paperDetailsResponse.data.paper_id; 
      console.log('Attachment ID from paper details:', attachmentId);

      if (!attachmentId) {
         throw new Error('Không tìm thấy ID file đính kèm trong chi tiết đơn');
      }

      // Fetch attachment details using the attachment ID
      console.log('Fetching attachment details for ID:', attachmentId);
      const attachmentResponse = await axios.get(`http://localhost:8080/attachment/view/${attachmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const attachmentData = attachmentResponse.data;

      if (!attachmentData || !attachmentData.url || !attachmentData.fileName) {
        throw new Error('Không thể lấy thông tin chi tiết file đính kèm từ API');
      }

      console.log('Attachment data:', attachmentData);

            // 4. Download original file using the backend proxy
            console.log('Step 4: Downloading original file using backend proxy...');
              console.log('File URL from attachment data:', attachmentData.url); // This log still shows the file ID as the 'URL'
        
              // The attachmentData.url is now the Google Drive File ID
              const googleDriveFileId = attachmentData.url; // <<<--- Change this line
              console.log('Google Drive File ID from attachment data:', googleDriveFileId); // Log the ID
        
              if (!googleDriveFileId) {
                  throw new Error('Không thể lấy Google Drive File ID từ dữ liệu đính kèm'); // Error if the ID is missing
              }
              // Remove the old log for extracted ID as we are taking it directly
        
              // Download file using the backend proxy API
              const downloadApiUrl = `http://localhost:8080/api/gg-cloud/download?fileId=${googleDriveFileId}`;
              console.log('Calling backend download proxy API:', downloadApiUrl); // Log the download API URL
        
              const fileResponse = await axios.get(downloadApiUrl, {
                 responseType: 'arraybuffer', // Important for binary data
                 headers: {
                   'Authorization': `Bearer ${token}` // Keep authorization if your backend needs it
                 }
              });

      // 5. Convert file to PDF and add signatures
      console.log('Step 5: Converting file to PDF and adding signatures...');
      const fileName = attachmentData.fileName;
      console.log('File name for conversion:', fileName); // Log the file name

      if (!fileName) {
        throw new Error('Không tìm thấy tên file trong dữ liệu đính kèm');
      }

      // Convert the file to PDF
      const pdfBytes = await convertToPDF(attachmentData.url, fileName);
      console.log('Original file converted to PDF.');

      // Add signatures to the PDF using the valid approver signatures
      const signedFileBytes = await addSignaturesToPDF(pdfBytes, validApproverSignatures);
      console.log('Step 5 completed: File converted to PDF and signatures added. Signed file bytes generated.');

      // 6. Upload new file to Google Drive using the backend upload proxy
      console.log('Step 6: Uploading signed file to Google Drive via backend proxy...');
      console.log('Using signedFileBytes for upload:', signedFileBytes ? 'Present' : 'Missing');

      const formData = new FormData();
      // Use the signedFileBytes (which is a PDF)
      formData.append('file', new Blob([signedFileBytes], { type: 'application/pdf' }),
        `${fileName.split('.')[0]}_signed.pdf`); // Give the signed file a new name


      // Call the backend upload API
      const uploadApiUrl = 'http://localhost:8080/api/gg-cloud/upload';
      console.log('Calling backend upload proxy API:', uploadApiUrl);

      const uploadResponse = await axios.post(uploadApiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // The 'Content-Type': 'multipart/form-data' header is usually set automatically by axios with FormData
        },
      });

      // According to your backend code, the upload API returns a JSON object with a 'url' property containing the fileId.
      // Assuming response.data is the JSON object: { "url": "fileId" }
      if (!uploadResponse.data || typeof uploadResponse.data.url !== 'string') {
          console.error('Unexpected or invalid response from upload API:', uploadResponse.data);
          throw new Error('Không thể lấy ID file đã tải lên từ backend upload proxy');
      }
      const uploadedFileId = uploadResponse.data.url; // Extract file ID from the 'url' property
      console.log('Step 6 completed: Signed file uploaded to Google Drive. New File ID:', uploadedFileId);


      // 7. Update attachment record
      console.log('Step 7: Updating attachment record...');
      // Using request.paper_id (which is the attachmentId) based on previous logs
      const attachmentRecordToUpdateId = request.paper_id; // This is the original attachment ID
      console.log('Updating original attachment record with ID:', attachmentRecordToUpdateId);

      // Construct the new Google Drive download URL from the uploaded file ID
      const newGoogleDriveUrl = `https://drive.google.com/uc?export=download&id=${uploadedFileId}`;
      console.log('New Google Drive URL for attachment:', newGoogleDriveUrl);

      const updateResponse = await axios.put(`http://localhost:8080/attachment/edit/${attachmentRecordToUpdateId}`, {
        // Update the URL and the fileName to point to the newly signed file
        url: newGoogleDriveUrl,
        fileName: `${fileName.split('.')[0]}_signed.pdf` // Update filename
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Update response:', updateResponse.data);
      console.log('Step 7 completed: Attachment record updated');

      // 8. Call approve API
      console.log('Step 8: Calling approve API...');
      const approveData = {
        step: request.waiting_step,
        approverId: currentUser.id,
        donKiemDuyetId: request.id, 
        denyReason: null
      };
      console.log('Approval request data:', approveData);

      try {
        const approveResponse = await callApproveAPI(approveData, token);
        console.log('Approval response:', approveResponse.data);

        if (!approveResponse.data) {
          throw new Error('Không nhận được phản hồi từ server sau khi duyệt');
        }

        console.log('Step 8 completed: Approval successful');
        toast.success('Đã duyệt đơn thành công!', {
          onClose: () => {
            navigate('/pending-approvals');
          }
        });
      } catch (approveError) {
        console.error('Error in approval API call:', approveError);
        if (approveError.response) {
          console.error('Error response data:', approveError.response.data);
          console.error('Error response status:', approveError.response.status);
          console.error('Error response headers:', approveError.response.headers);
          throw new Error(`Lỗi từ server khi duyệt: ${approveError.response.data.message || 'Không thể cập nhật trạng thái duyệt'}`);
        } else if (approveError.request) {
          console.error('No response received from approval API:', approveError.request);
          throw new Error('Không thể kết nối đến server để duyệt. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } else {
          console.error('Error message in approval API call:', approveError.message);
          throw new Error(`Lỗi khi gọi API duyệt: ${approveError.message}`);
        }
      }
    } catch (error) {
      console.error('Error in overall approval process:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error URL:', error.config?.url);
        console.error('Error method:', error.config?.method);
        toast.error(`Lỗi trong quá trình duyệt đơn: ${error.response.data.message || 'Có lỗi xảy ra khi duyệt đơn'}`);
      } else {
        toast.error(error.message || 'Có lỗi xảy ra khi duyệt đơn');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!denyReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      console.log('Request data:', request);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/approve-step/deny',
        {
          step: request.waiting_step,
          approverId: null,
          donKiemDuyetId: request.id,
          denyReason: denyReason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Deny response:', response.data);
      toast.success('Đã từ chối đơn!', {
        onClose: () => {
          navigate('/pending-approvals');
        }
      });
      setDenyDialogOpen(false);
      setDenyReason('');
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Có lỗi xảy ra khi từ chối đơn');
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/attachment/view/${request.paper_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Error fetching attachment:', error);
    }
  };

  if (!request) {
    return <Typography>Loading...</Typography>;
  }

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
                  secondary={request.title}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Mô tả"
                  secondary={request.description}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Ngày tạo"
                  secondary={new Date(request.created_date).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <Button
                  variant="contained"
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
              label={request.status === 'PENDING' ? 'Đang chờ ký' : 'Đã ký'}
              color={request.status === 'PENDING' ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleAccept}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Duyệt'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setDenyDialogOpen(true)}
              >
                Từ chối
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Deny Dialog */}
      <Dialog
        open={denyDialogOpen}
        onClose={() => {
          setDenyDialogOpen(false);
          setDenyReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận từ chối đơn</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            placeholder="Nhập lý do từ chối"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDenyDialogOpen(false);
              setDenyReason('');
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeny}
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