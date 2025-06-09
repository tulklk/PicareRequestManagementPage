// dung de upload len firebase

import axios from 'axios';



export const uploadToGoogleDrive = async (file) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Starting file upload to Google Drive:', file.name);
    const startTime = new Date().getTime();

    const formData = new FormData();
    formData.append('file', file);

    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG, JPG, or PDF files are allowed.');
      return;
    }

    const response = await axios.post('http://localhost:8080/api/gg-cloud/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      
    });

    const endTime = new Date().getTime();
    const uploadTime = (endTime - startTime) / 1000; // Convert to seconds
    console.log(`File upload completed in ${uploadTime} seconds`);

    if (!response.data || !response.data.url) {
      throw new Error('No URL received from server');
    }

    console.log('Upload response:', response.data);
    return response.data.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error(error.response?.data?.error || 'Failed to upload file');
  }
};

