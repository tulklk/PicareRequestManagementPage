import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

/**
 * Get approval steps for a paper
 * @param {number} paperId - The ID of the paper
 * @returns {Promise<Array>} - Array of approval steps
 */
export const getApprovalSteps = async (paperId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/approve-step/view-by-paper/${paperId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching approval steps:', error);
    throw new Error('Failed to fetch approval steps');
  }
};

/**
 * Get user details
 * @param {number} userId - The ID of the user
 * @returns {Promise<Object>} - User details including chuKy
 */
export const getUserDetails = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/user/view/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error('Failed to fetch user details');
  }
};

/**
 * Get signature attachment
 * @param {number} chuKy - The chuKy value
 * @returns {Promise<Object>} - Signature attachment details
 */
export const getSignatureAttachment = async (chuKy) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/attachment/view/${chuKy}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching signature attachment:', error);
    throw new Error('Failed to fetch signature attachment');
  }
};

/**
 * Update paper's attachment ID
 * @param {number} paperId - The ID of the paper
 * @param {number} attachmentId - The ID of the new attachment
 * @returns {Promise<Object>} - Updated paper details
 */
export const updatePaperAttachment = async (paperId, attachmentId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_BASE_URL}/paper/update-attachment/${paperId}`,
      { attachmentId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating paper attachment:', error);
    throw new Error('Failed to update paper attachment');
  }
}; 