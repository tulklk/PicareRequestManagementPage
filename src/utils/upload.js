// dung de upload len firebase
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase";
import axios from 'axios';

const uploadFile = async (file) => {
    try {
        console.log("Starting upload for file:", file.name);
        const storageRef = ref(storage, file.name);
        console.log("Storage reference created");
        
        const response = await uploadBytes(storageRef, file);
        console.log("Upload successful, getting download URL");
        
        const downloadURL = await getDownloadURL(response.ref);
        console.log("Download URL obtained:", downloadURL);
        
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

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

