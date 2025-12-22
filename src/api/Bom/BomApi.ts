import axios from "axios";

const BOM_API_URL = "http://localhost:8000/api/bom";

export interface BomPayload {
  parent: string;
  component: string;
  work_centre: number;
  loc_code: string;
  quantity: number;
}

export const getBoms = async () => {
  try {
    const response = await axios.get(BOM_API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching BOM list:", error);
    return [];
  }
};

export const getBomById = async (id: string | number) => {
  try {
    const response = await axios.get(`${BOM_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching BOM ${id}:`, error);
    return null;
  }
};

export const createBom = async (payload: BomPayload) => {
  try {
    const response = await axios.post(BOM_API_URL, payload);
    return response.data;
  } catch (error: any) {
    console.error("Error creating BOM:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateBom = async (
  id: string | number,
  payload: BomPayload
) => {
  try {
    const response = await axios.put(`${BOM_API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating BOM ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteBom = async (id: string | number) => {
  try {
    const response = await axios.delete(`${BOM_API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting BOM ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};
