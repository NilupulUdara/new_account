import axios from "axios";

const API_URL = "http://localhost:8000/api/supplier-contacts";

//  Create a new contact for a Supplier
export const createSupplierContact = async (contactData: any) => {
  try {
    const response = await axios.post(API_URL, contactData);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create contact:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

//  Get all contacts for a specific Supplier
export const getSupplierContacts = async (SupplierId: string | number) => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch contacts:", error.response?.data || error);
    return [];
  }
};

//  Update a contact
export const updateSupplierContact = async (id: string | number, contactData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, contactData);
    return response.data;
  } catch (error: any) {
    console.error("Failed to update contact:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

//  Delete a contact
export const deleteSupplierContact = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete contact:", error.response?.data || error);
    throw error.response?.data || error;
  }
};
