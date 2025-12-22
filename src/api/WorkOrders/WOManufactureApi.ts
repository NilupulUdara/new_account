import axios from "axios";

const API_URL = "http://localhost:8000/api/wo-manufacture";

export interface WoManufacturePayload {
  reference?: string | null;
  workorder_id: number;
  quantity: number;
  date: string;
}

export const getWoManufactures = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching WO manufacture records:", error);
    return [];
  }
};

export const getWoManufactureById = async (id: number | string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching WO manufacture ${id}:`, error);
    return null;
  }
};

export const getWoManufacturesByWorkOrder = async (workorderId: number) => {
  try {
    const response = await axios.get(API_URL);
    return response.data.filter(
      (row: any) => Number(row.workorder_id) === Number(workorderId)
    );
  } catch (error) {
    console.error(
      `Error fetching manufacture records for workorder ${workorderId}:`,
      error
    );
    return [];
  }
};

export const createWoManufacture = async (
  payload: WoManufacturePayload
) => {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating WO manufacture:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updateWoManufacture = async (
  id: number | string,
  payload: WoManufacturePayload
) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating WO manufacture ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deleteWoManufacture = async (id: number | string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting WO manufacture ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
