import axios from "axios";

const API_URL = "http://localhost:8000/api/work-centres"; 

// Create WorkCentre
export const createWorkCentre = async (workCentreData: any) => {
  try {
    const response = await axios.post(API_URL, workCentreData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Get all WorkCentres
export const getWorkCentres = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Get single WorkCentre by ID
export const getWorkCentre = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Update WorkCentre
export const updateWorkCentre = async (id: string | number, workCentreData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, workCentreData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Delete WorkCentre
export const deleteWorkCentre = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
