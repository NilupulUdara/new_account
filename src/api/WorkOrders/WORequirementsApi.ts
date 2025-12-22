import axios from "axios";

const API_URL = "http://localhost:8000/api/wo-requirements";

export interface WoRequirementPayload {
  workorder_id: number;
  stock_id: string;
  work_centre: number;
  units_req: number;
  unit_cost: number;
  loc_code: string;
  units_issued?: number;
}

export const getWoRequirements = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching WO requirements:", error);
    return [];
  }
};

export const getWoRequirementById = async (id: number | string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching WO requirement ${id}:`, error);
    return null;
  }
};

export const getWoRequirementsByWorkOrder = async (workorderId: number) => {
  try {
    const response = await axios.get(API_URL);
    return response.data.filter(
      (row: any) => Number(row.workorder_id) === Number(workorderId)
    );
  } catch (error) {
    console.error("Error filtering WO requirements:", error);
    return [];
  }
};

export const createWoRequirement = async (payload: WoRequirementPayload) => {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating WO requirement:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updateWoRequirement = async (
  id: number | string,
  payload: WoRequirementPayload
) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating WO requirement ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deleteWoRequirement = async (id: number | string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting WO requirement ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
