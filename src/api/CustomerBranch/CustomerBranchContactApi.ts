import axios from "axios";

const API_URL = "http://localhost:8000/api/crm-persons";
const CONTACTS_API_URL = "http://localhost:8000/api/crm-contacts";

// ✅ Create a new contact for a customer
export const createCustomerContact = async (contactData: any) => {
  try {
    const response = await axios.post(API_URL, contactData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// ✅ Get all contacts for a specific customer or branch
export const getCustomerContacts = async (branchId: string | number) => {
  if (!branchId) {
    return [];
  }
  
  try {
    // Step 1: Get ALL contacts from the API to analyze
    const allContactsResponse = await axios.get(CONTACTS_API_URL);
    
    // Step 2: Filter contacts by exact entity_id match with branchId (converted to string)
    const branchIdStr = String(branchId);
    const branchContacts = allContactsResponse.data.filter(
      (contact: any) => String(contact.entity_id) === branchIdStr
    );
    
    if (branchContacts.length === 0) {
      return [];
    }
    
    // Step 3: Extract person IDs and make separate requests for each
    const personDetails = [];
    for (const contact of branchContacts) {
      try {
        // Make a direct request for this specific person
        const personResponse = await axios.get(`${API_URL}/${contact.person_id}`);
        
        if (personResponse.data) {
          personDetails.push({
            ...personResponse.data,
            contact_id: contact.id,
            contact_type: contact.type
          });
        }
      } catch (personError) {
        // Failed to fetch person
      }
    }
    
    return personDetails;
  } catch (error: any) {
    return [];
  }
};

// ✅ Update a contact
export const updateCustomerContact = async (id: string | number, contactData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, contactData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// ✅ Delete a contact
export const deleteCustomerContact = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};