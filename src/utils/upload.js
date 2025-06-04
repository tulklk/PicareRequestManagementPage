// dung de upload len firebase
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase";

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

export default uploadFile;