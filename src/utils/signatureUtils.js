import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import { uploadToGoogleDrive } from './upload';

/**
 * Downloads a PDF file from the backend proxy endpoint using fileId
 * @param {string} fileId - The Google Drive file ID
 * @returns {Promise<Uint8Array>} - The PDF file as a Uint8Array
 */
export const downloadPDF = async (fileIdOrUrl) => {
  const fileId = extractFileId(fileIdOrUrl);
  if (!fileId) throw new Error('Invalid file ID or URL');
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:8080/api/gg-cloud/download?fileId=${fileId}`,
      {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('PDF download response:', response);
    return new Uint8Array(response.data);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF file');
  }
};

/**
 * Embeds signatures into a PDF file
 * @param {Uint8Array} pdfBytes - The original PDF file
 * @param {Array} signatures - Array of signature objects with {url, name}
 * @returns {Promise<Uint8Array>} - The modified PDF file
 */
export const embedSignaturesInPDF = async (pdfBytes, signatures) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const lastPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
    const { width, height } = lastPage.getSize();

    const borderWidth = 1;
    const padding = 20;
    const horizontalPadding = 50;
    const boxHeight = 150 * 0.75;
    const availableWidth = width - (horizontalPadding * 2);
    const sectionWidth = availableWidth / 5;
    const emptySpaceY = height - (boxHeight + 50 + 20);

    // Use Helvetica font for better Unicode support
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < signatures.length; i++) {
      const signature = signatures[i];
      if (!signature) continue;
      const x = horizontalPadding + (sectionWidth * i);

      // Log which signature is being processed
      console.log(`Processing signature ${i + 1}: name="${signature.name}" url="${signature.url}"`);

      // Draw border
      lastPage.drawRectangle({
        x: x + borderWidth,
        y: emptySpaceY,
        width: sectionWidth - (borderWidth * 2),
        height: boxHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: borderWidth,
      });

      // Draw the name (replace unsupported chars for now)
      let name = signature.name || '';
      try {
        lastPage.drawText(name, {
          x: x + 10,
          y: emptySpaceY + boxHeight - 20,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
      } catch (e) {
        // Remove non-ASCII chars if error
        lastPage.drawText(name.replace(/[^\x00-\x7F]/g, ''), {
          x: x + 10,
          y: emptySpaceY + boxHeight - 20,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
      }

      // Try to embed as image (PNG/JPG) or as PDF
      if (signature.url) {
        console.log(`Signature ${i + 1} (name="${signature.name}"): signature.url is present.`);
        try {
          const fileId = extractFileId(signature.url);
          console.log(`Signature ${i + 1} (name="${signature.name}"): Extracted fileId: ${fileId}`);
          const signatureBytes = await downloadPDF(fileId);
          console.log(`Signature ${i + 1} (name="${signature.name}"): downloadPDF completed.`);
          
          // Log the first few bytes to inspect content
          console.log(`Signature ${i + 1} (name="${signature.name}") first 8 bytes:`, new Uint8Array(signatureBytes).slice(0, 8));

          const fileType = await getFileType(signatureBytes);
          console.log(`Signature ${i + 1} (name="${signature.name}") detected file type: ${fileType}`);
          let image;
          let embedded = false;

          // Try PNG
          if (fileType === 'png') {
            try {
              image = await pdfDoc.embedPng(signatureBytes);
              lastPage.drawImage(image, {
                x: x + 10,
                y: emptySpaceY + 10,
                width: sectionWidth - 20,
                height: boxHeight - 30,
              });
              embedded = true;
            } catch (e) {
              console.error(`Failed to embed PNG for signature ${i + 1} (name="${signature.name}"):`, e);
            }
          }

          // Try JPG/JPEG
          if (!embedded && fileType === 'jpg') {
            try {
              image = await pdfDoc.embedJpg(signatureBytes);
              lastPage.drawImage(image, {
                x: x + 10,
                y: emptySpaceY + 10,
                width: sectionWidth - 20,
                height: boxHeight - 30,
              });
              embedded = true;
            } catch (e) {
              console.error(`Failed to embed JPG for signature ${i + 1} (name="${signature.name}"):`, e);
            }
          }

          // Try PDF
          if (!embedded && fileType === 'pdf') {
            try {
              const sigPdfDoc = await PDFDocument.load(signatureBytes);
              console.log(`Signature ${i + 1} (name="${signature.name}"): sigPdfDoc page count: ${sigPdfDoc.getPageCount()}`);
              const [sigPage] = await pdfDoc.copyPages(sigPdfDoc, [0]);
              lastPage.drawPage(sigPage, {
                x: x + 10,
                y: emptySpaceY + 10,
                width: sectionWidth - 20,
                height: boxHeight - 30,
              });
              embedded = true;
            } catch (e) {
              console.error(`Failed to embed PDF for signature ${i + 1} (name="${signature.name}"):`, e);
            }
          }

          if (!embedded) {
            throw new Error('Signature is not a valid PNG, JPG, or PDF');
          }
        } catch (error) {
          console.error(`Error embedding signature ${i + 1} (name="${signature.name}"):`, error);
        }
      }
    }
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error embedding signatures:', error);  
    throw new Error('Failed to embed signatures in PDF');
  }
};

/**
 * Uploads a modified PDF file
 * @param {Uint8Array} pdfBytes - The modified PDF file
 * @param {string} originalFileName - The original file name
 * @returns {Promise<{url: string, id: number}>} - The uploaded file details
 */
export const uploadModifiedPDF = async (pdfBytes, originalFileName) => {
  try {
    // Convert Uint8Array to File
    const file = new File([pdfBytes], originalFileName, { type: 'application/pdf' });

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert('File is too large. Maximum allowed size is 5MB.');
      return;
    }

    // Upload to Google Drive
    const fileUrl = await uploadToGoogleDrive(file);

    // Save to database
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:8080/attachment/upload-paper',
      {
        url: fileUrl,
        fileName: originalFileName
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      url: response.data.url,
      id: response.data.id
    };
  } catch (error) {
    console.error('Error uploading modified PDF:', error);
    throw new Error('Failed to upload modified PDF');
  }
};

// Helper to extract fileId from a URL or return as is
function extractFileId(urlOrId) {
  if (/^[a-zA-Z0-9_-]{20,}$/.test(urlOrId)) return urlOrId;
  const idMatch = urlOrId.match(/id=([a-zA-Z0-9_-]{20,})/) || urlOrId.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  return idMatch ? idMatch[1] : null;
}

function getFileType(bytes) {
  return new Promise((resolve, reject) => {
    const arr = new Uint8Array(bytes).subarray(0, 8);
    let headerString = "";
    for (let i = 0; i < arr.length; i++) {
      headerString += arr[i].toString(16).padStart(2, "0");
    }

    // Check PDF
    if (headerString.startsWith("25504446")) {
      resolve("pdf");
      return;
    }

    // Check JPEG
    if (headerString.startsWith("ffd8ffe0") ||
        headerString.startsWith("ffd8ffe1") ||
        headerString.startsWith("ffd8ffe2") ||
        headerString.startsWith("ffd8ffe3") ||
        headerString.startsWith("ffd8ffe8")) {
      resolve("jpg");
      return;
    }

    // Check PNG
    if (headerString.startsWith("89504e47")) {
      resolve("png");
      return;
    }

    resolve("unknown");
  });
} 