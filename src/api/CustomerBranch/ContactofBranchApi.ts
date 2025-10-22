import axios from "axios";

const API_URL = "http://localhost:8000/api/crm-persons";

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

// ✅ Get all contacts for a specific customer
export const getCustomerContacts = async (customerId: string | number) => {
  try {
    if (!customerId) return []; // Return empty if no customerId is provided
    
    // 1. Fetch contacts for this customer only
    const contactsResponse = await axios.get(`http://localhost:8000/api/crm-contacts`, {
      params: { 
        entity_id: customerId
        // Removed action filter to get all contacts for this entity_id
      },
    });
    const crmContacts = contactsResponse.data;

    if (crmContacts.length === 0) return [];

    // 2. Fetch all related person details
    const personIds = crmContacts.map((c: any) => c.person_id);
    const personsResponse = await axios.get(`http://localhost:8000/api/crm-persons`, {
      params: { ids: personIds.join(",") },
    });
    const crmPersons = personsResponse.data;

    // 3. Fetch all relevant contact categories - now accepting both customer and cust_branch types
    const typeIds = crmContacts.map((c: any) => c.type);
    const categoriesResponse = await axios.get(`http://localhost:8000/api/crm-categories`, {
      params: { 
        ids: Array.from(new Set(typeIds)).join(","), // unique IDs only
        // Removed type filter to get all relevant categories
      },
    });
    const contactCategories = categoriesResponse.data;

    // Build a map: type ID → description
    const categoryMap: { [key: number]: string } = {};
    contactCategories.forEach((cat: any) => {
      // Include categories of all types
      categoryMap[cat.id] = cat.description || cat.name;
    });

    // Get a list of all category IDs - not filtering by type anymore
    const allCategoryIds = contactCategories.map(cat => cat.id);
      
    // 4. Merge contact + person + category info
    const merged = crmContacts
      // Extra validation to ensure we only include contacts for this customer
      .filter(contact => contact.entity_id == customerId)
      // Only include contacts whose type is in the allCategoryIds list
      .filter(contact => allCategoryIds.includes(contact.type))
      .map((contact: any) => {
        const person = crmPersons.find((p: any) => p.id === contact.person_id);
        
        return {
          id: contact.id,
          reference: person?.ref || "",
          assignment: categoryMap[contact.type] || "Unknown",
          name: person?.name || "",
          phone: person?.phone || "",
          phone2: person?.phone2 || "",
          fax: person?.fax || "",
          email: person?.email || "",
          inactive: contact.inactive || false,
        };
      });

    return merged;
  } catch (error: any) {
    console.error("Failed to fetch customer contacts:", error.response?.data || error);
    return [];
  }
};

// ✅ Update a contact
export const updateCustomerContact = async (id: string | number, contactData: any) => {
  try {
    // First, get the contact record to find the person_id
    const contactResponse = await axios.get(`http://localhost:8000/api/crm-contacts/${id}`);
    const contact = contactResponse.data;
    
    if (!contact) {
      throw new Error("Contact not found");
    }
    
    // Get the person details
    const personResponse = await axios.get(`${API_URL}/${contact.person_id}`);
    const personData = personResponse.data;
    
    if (!personData) {
      throw new Error("Person data not found");
    }
    
    // 1. Update the contact type if assignment is provided
    if (contactData.assignment !== undefined) {
      await axios.put(`http://localhost:8000/api/crm-contacts/${id}`, {
        ...contact,
        type: contactData.assignment // Update the type field with the new assignment value
      });
    }
    
    // 2. Update the person data
    const updatedPersonData = {
      ...personData,
      name: contactData.name || personData.name,
      name2: contactData.name2 || personData.name2,
      ref: contactData.ref || personData.ref,
      phone: contactData.phone || personData.phone,
      phone2: contactData.phone2 || personData.phone2,
      fax: contactData.fax || personData.fax,
      email: contactData.email || personData.email,
      address: contactData.address || personData.address,
      lang: contactData.lang || personData.lang,
      notes: contactData.notes || personData.notes,
    };
    
    const response = await axios.put(`${API_URL}/${contact.person_id}`, updatedPersonData);
    return response.data;
  } catch (error: any) {
    console.error("Failed to update contact:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Delete a contact
export const deleteCustomerContact = async (id: string | number) => {
  try {
    // The id passed is the crm_contacts.id, not the person_id
    
    // First, get the contact to find the related person_id
    const contactResponse = await axios.get(`http://localhost:8000/api/crm-contacts/${id}`);
    const contact = contactResponse.data;
    
    if (!contact) {
      throw new Error("Contact not found");
    }
    
    // Delete the contact from crm_contacts
    await axios.delete(`http://localhost:8000/api/crm-contacts/${id}`);
    
    // Check if this person has other contacts before deleting the person
    const relatedContactsResponse = await axios.get(`http://localhost:8000/api/crm-contacts`, {
      params: { person_id: contact.person_id }
    });
    
    // If this was the only contact for this person, delete the person as well
    if (relatedContactsResponse.data.length <= 1) {
      await axios.delete(`${API_URL}/${contact.person_id}`);
    }
    
    return { success: true, message: "Contact deleted successfully" };
  } catch (error: any) {
    console.error("Failed to delete contact:", error.response?.data || error);
    throw error.response?.data || error;
  }
};
