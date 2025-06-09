import { useState } from 'react';
import { toast } from 'react-toastify';
import * as signatureService from '../services/signatureService';
import { downloadPDF, embedSignaturesInPDF, uploadModifiedPDF } from '../utils/signatureUtils';

export const useSignatureEmbedding = () => {
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [error, setError] = useState(null);

  const embedSignatures = async (paperId, authorId) => {
    setIsEmbedding(true);
    setError(null);

    try {
      // 1. Get approval steps
      const approvalSteps = await signatureService.getApprovalSteps(paperId);
      const isLastStep = approvalSteps.some(step => 
        step.status === 'CHECKED' && step.step === step.totalSteps
      );

      if (!isLastStep) {
        return;
      }

      // 2. Get author's signature
      const authorDetails = await signatureService.getUserDetails(authorId);
      const authorSignature = await signatureService.getSignatureAttachment(authorDetails.chuKy);

      // 3. Get approvers' signatures
      const approverSignatures = await Promise.all(
        approvalSteps.map(async (step) => {
          if (step.status !== 'CHECKED') return null;
          
          const approverDetails = await signatureService.getUserDetails(step.approverId);
          const signature = await signatureService.getSignatureAttachment(approverDetails.chuKy);
          return {
            ...signature,
            name: approverDetails.name
          };
        })
      );

      // 4. Get the original PDF
      const originalPdf = await downloadPDF(`https://drive.usercontent.google.com/download?id=${authorSignature.url}&export=download&authuser=0`);

      // 5. Prepare signatures array (author first, then approvers)
      const signatures = [
        { ...authorSignature, name: 'Author' },
        ...approverSignatures.filter(Boolean)
      ];

      // 6. Embed signatures
      const modifiedPdf = await embedSignaturesInPDF(originalPdf, signatures);

      // 7. Upload modified PDF
      const { id: newAttachmentId } = await uploadModifiedPDF(modifiedPdf, authorSignature.fileName);

      // 8. Update paper's attachment ID
      await signatureService.updatePaperAttachment(paperId, newAttachmentId);

      toast.success('Signatures embedded successfully');
      return true;
    } catch (error) {
      console.error('Error in signature embedding:', error);
      setError(error.message);
      toast.error('Failed to embed signatures: ' + error.message);
      return false;
    } finally {
      setIsEmbedding(false);
    }
  };

  return {
    embedSignatures,
    isEmbedding,
    error
  };
}; 