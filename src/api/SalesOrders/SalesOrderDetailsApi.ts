import axios from "axios";

const API_URL = "http://localhost:8000/api/salesorderdetails";

export const getSalesOrderDetails = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales order details:", error);
    return [];
  }
};

export const getSalesOrderDetailById = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sales order detail ${id}:`, error);
    return null;
  }
};

export const createSalesOrderDetail = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating sales order detail:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateSalesOrderDetail = async (id: string | number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating sales order detail ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteSalesOrderDetail = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting sales order detail ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};
