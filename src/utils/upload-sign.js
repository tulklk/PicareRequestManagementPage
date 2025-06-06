import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase";
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';

const MAX_WIDTH = 130;
const MAX_HEIGHT = 130;

const resizeFile = async (file) => {
  try {
    // If it's a PDF, use the existing PDF resizing logic
    if (file.type === 'application/pdf') {
      return await resizePDF(file);
    }
    
    // For images, we'll use the original file since we'll handle resizing in the PDF generation
    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      return file;
    }

    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Error resizing file:', error);
    throw new Error('Failed to resize file');
  }
};

const resizePDF = async (file) => {
  try {
    // Read the uploaded PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Get the first page
    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();
    
    // Calculate scaling factors
    const scaleX = MAX_WIDTH / width;
    const scaleY = MAX_HEIGHT / height;
    const scale = Math.min(scaleX, scaleY);
    
    // If no scaling needed, return original file
    if (scale >= 1) {
      return file;
    }
    
    // Create a new PDF with the resized page
    const newPdfDoc = await PDFDocument.create();
    const [newPage] = await newPdfDoc.copyPages(pdfDoc, [0]);
    
    // Scale the page
    newPage.scale(scale, scale);
    
    // Add the scaled page to the new document
    newPdfDoc.addPage(newPage);
    
    // Save the resized PDF
    const resizedPdfBytes = await newPdfDoc.save();
    
    // Create a new file from the resized PDF
    return new File([resizedPdfBytes], file.name, {
      type: 'application/pdf',
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.error('Error resizing PDF:', error);
    throw new Error('Failed to resize PDF');
  }
};

const uploadFile = async (file) => {
  try {
    console.log("Starting upload for file:", file.name);
    
    // Resize the file if needed
    const resizedFile = await resizeFile(file);
    console.log("File resized if needed");
    
    const storageRef = ref(storage, file.name);
    console.log("Storage reference created");
    
    const response = await uploadBytes(storageRef, resizedFile);
    console.log("Upload successful, getting download URL");
    
    const downloadURL = await getDownloadURL(response.ref);
    console.log("Download URL obtained:", downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

export const uploadSignatureToGoogleDrive = async (file) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Starting signature upload to Google Drive:', file.name);
    const startTime = new Date().getTime();

    // Resize the file if needed
    const resizedFile = await resizeFile(file);
    console.log('Signature file resized if needed');

    const formData = new FormData();
    formData.append('file', resizedFile);

    const response = await axios.post('http://localhost:8080/api/gg-cloud/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    const endTime = new Date().getTime();
    const uploadTime = (endTime - startTime) / 1000; // Convert to seconds
    console.log(`Signature upload completed in ${uploadTime} seconds`);

    if (!response.data || !response.data.url) {
      throw new Error('No URL received from server');
    }

    console.log('Signature upload response:', response.data);
    return response.data.url;
  } catch (error) {
    console.error('Error uploading signature:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error(error.response?.data?.error || 'Failed to upload signature');
  }
};
