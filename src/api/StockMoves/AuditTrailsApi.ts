import axios from "axios";

const API_URL = "http://localhost:8000/api/audit-trails";

export const getAuditTrails = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching audit trails:", error);
    return [];
  }
};

export const getAuditTrailById = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching audit trail ${id}:`, error);
    return null;
  }
};

export const createAuditTrail = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating audit trail:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateAuditTrail = async (id: string | number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating audit trail ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteAuditTrail = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting audit trail ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};
