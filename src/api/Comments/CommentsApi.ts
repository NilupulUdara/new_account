import axios from "axios";

const API_URL = "http://localhost:8000/api/comments";

/**
 * Get all comments
 */
export const getComments = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

/**
 * Create a new comment
 * @param data - Object containing comment details
 */
export const createComment = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating comment:", error.response?.data || error);
    throw error.response?.data || error;
  }
};
