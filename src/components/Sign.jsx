import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useState } from 'react';

const Sign = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [boxHeight, setBoxHeight] = useState(150);
  const [bottomMargin, setBottomMargin] = useState(50);

  const findEmptySpace = async (page, height, requiredSpace) => {
    try {
      // Get the page content stream
      const contentStream = await page.getContentStream();
      const content = await contentStream.getText();
      
      // If there's no content, we can use the bottom of the page
      if (!content || content.trim() === '') {
        return height - requiredSpace;
      }

      // Check if there's enough space at the bottom
      const lastContentY = height - 100; // Assume content ends 100 points from bottom
      if (lastContentY > requiredSpace) {
        return height - requiredSpace;
      }

      // If not enough space at bottom, return null to create new page
      return null;
    } catch (error) {
      console.error('Error checking page content:', error);
      // If we can't check content, create new page to be safe
      return null;
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Read the uploaded PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get the last page
      const pageCount = pdfDoc.getPageCount();
      const lastPage = pdfDoc.getPage(pageCount - 1);
      
      // Get the page dimensions
      const { width, height } = lastPage.getSize();
      
      // Define border width and padding
      const borderWidth = 1;
      const padding = 20;
      const horizontalPadding = 50;
      
      // Calculate available width after padding
      const availableWidth = width - (horizontalPadding * 2);
      const sectionWidth = availableWidth / 5;
      
      // Convert box height from pixels to points
      const boxHeightInPoints = boxHeight * 0.75;
      
      // Calculate required space for boxes
      const requiredSpace = boxHeightInPoints + bottomMargin + 20; // 20 points for title
      
      // Find empty space on the last page
      let emptySpaceY = await findEmptySpace(lastPage, height, requiredSpace);
      let targetPage = lastPage;
      
      // If no empty space found on last page, create new page
      if (emptySpaceY === null) {
        targetPage = pdfDoc.addPage([width, height]);
        emptySpaceY = height - requiredSpace; // Start from top of new page
      }
      
      // Add 5 sections with borders and titles
      for (let i = 0; i < 5; i++) {
        const x = horizontalPadding + (sectionWidth * i);
        
        // Draw border
        targetPage.drawRectangle({
          x: x + borderWidth,
          y: emptySpaceY,
          width: sectionWidth - (borderWidth * 2),
          height: boxHeightInPoints,
          borderColor: rgb(0, 0, 0),
          borderWidth: borderWidth,
        });
        
        // Add title
        targetPage.drawText(`Section ${i + 1}`, {
          x: x + 10,
          y: emptySpaceY + boxHeightInPoints - 20,
          size: 12,
          color: rgb(0, 0, 0),
        });
      }
      
      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob and URL for preview
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please make sure it\'s a valid PDF file.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          style={{ padding: '10px' }}
        />
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>
            Box Height (px):
            <input
              type="number"
              value={boxHeight}
              onChange={(e) => setBoxHeight(Number(e.target.value))}
              min="50"
              max="300"
              style={{ marginLeft: '5px', width: '60px' }}
            />
          </label>
          
          <label>
            Bottom Margin (px):
            <input
              type="number"
              value={bottomMargin}
              onChange={(e) => setBottomMargin(Number(e.target.value))}
              min="0"
              max="500"
              style={{ marginLeft: '5px', width: '60px' }}
            />
          </label>
        </div>
      </div>

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '800px',
            border: '1px solid #ccc'
          }}
          title="PDF Preview"
        />
      )}
    </div>
  );
};

export default Sign;
