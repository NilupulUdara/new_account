import axios from "axios";

const API_URL = "http://localhost:8000/api/suppliers";

// ✅ Create supplier
export const createSupplier = async (supplierData: any) => {
  try {
    const response = await axios.post(API_URL, supplierData);
    return response.data;
  } catch (error: any) {
    console.error("Create Supplier Error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Get all suppliers
export const getSuppliers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error("Get Suppliers Error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Get supplier by ID
export const getSupplierById = async (id: number | string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Get Supplier Error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Update supplier
export const updateSupplier = async (id: number | string, supplierData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, supplierData);
    return response.data;
  } catch (error: any) {
    console.error("Update Supplier Error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Delete supplier
export const deleteSupplier = async (id: number | string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Delete Supplier Error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};
