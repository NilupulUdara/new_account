import axios from "axios";

const API_URL = "http://localhost:8000/api/purch-order-details";

export const getPurchOrderDetails = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase order details:", error);
    return [];
  }
};

export const getPurchOrderDetailById = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase order detail ${id}:`, error);
    return null;
  }
};

export const getPurchOrderDetailsByOrderNo = async (
  orderNo: string | number
) => {
  try {
    const response = await axios.get(API_URL);
    const allDetails = response.data;
    return allDetails.filter(
      (detail: any) => String(detail.order_no) === String(orderNo)
    );
  } catch (error) {
    console.error(
      `Error fetching purchase order details for order ${orderNo}:`,
      error
    );
    return [];
  }
};

export const createPurchOrderDetail = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating purchase order detail:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updatePurchOrderDetail = async (
  id: string | number,
  data: any
) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating purchase order detail ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deletePurchOrderDetail = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting purchase order detail ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
