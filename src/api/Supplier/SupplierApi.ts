import axios from "axios";

const API_URL = "http://localhost:8000/api/suppliers";

export const createSupplier = async (supplierData: any) => {
  try {
    const response = await axios.post(API_URL, supplierData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
