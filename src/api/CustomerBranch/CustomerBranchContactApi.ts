import axios from "axios";

const API_URL = "http://localhost:8000/api/crm-persons";
const CONTACTS_API_URL = "http://localhost:8000/api/crm-contacts";

// ✅ Create a new contact for a customer
export const createCustomerContact = async (contactData: any) => {
  try {
    const response = await axios.post(API_URL, contactData);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create contact:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Get all contacts for a specific customer or branch
export const getCustomerContacts = async (branchId: string | number) => {
  console.log(`Fetching contacts for branch ID: ${branchId}`);
  
  if (!branchId) {
    console.warn("No branch ID provided to getCustomerContacts");
    return [];
  }
  
  try {
    // Direct approach: Get the person with the same ID as the branch_code
    // This implements the requirement: crm_persons.id = cust_branch.branch_code
    console.log(`Directly querying API for person with ID matching branch_code: ${API_URL}/${branchId}`);
    const personResponse = await axios.get(`${API_URL}/${branchId}`);
    console.log(`Person ${branchId} details response:`, personResponse);
    
    if (personResponse.data) {
      console.log(`Found matching person for branch ${branchId}:`, personResponse.data);
      const branchContacts = [personResponse.data];
      console.log(`All contacts collected for branch ${branchId}:`, branchContacts);
      return branchContacts; // Return as array with one item
    }
    
    console.warn(`No matching person found for branch: ${branchId}`);
    const branchContacts: any[] = [];
    console.log(`All contacts collected for branch ${branchId}:`, branchContacts);
    return branchContacts;
  } catch (error: any) {
    console.error(`Failed to fetch person with ID ${branchId}:`, error.message);
    // If direct match fails, return empty array
    const branchContacts: any[] = [];
    console.log(`No contacts found for branch ${branchId}`);
    return branchContacts;
  }
};

// ✅ Update a contact
export const updateCustomerContact = async (id: string | number, contactData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, contactData);
    return response.data;
  } catch (error: any) {
    console.error("Failed to update contact:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Delete a contact
export const deleteCustomerContact = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete contact:", error.response?.data || error);
    throw error.response?.data || error;
  }
};