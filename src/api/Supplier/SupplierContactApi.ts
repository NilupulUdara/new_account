import axios from "axios";

const API_URL = "http://localhost:8000/api/crm-persons";

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
// Get contacts for a specific supplier
export const getSupplierContacts = async (supplierId: string | number) => {
  try {
    // 1. Fetch contacts for this supplier
    const contactsResponse = await axios.get(`http://localhost:8000/api/crm-contacts`, {
      params: { entity_id: supplierId },
    });
    const crmContacts = contactsResponse.data;

    if (crmContacts.length === 0) return [];

    // 2. Fetch all related person details
    const personIds = crmContacts.map((c: any) => c.person_id);
    const personsResponse = await axios.get(`http://localhost:8000/api/crm-persons`, {
      params: { ids: personIds.join(",") },
    });
    const crmPersons = personsResponse.data;

    // 3. Fetch all relevant contact categories
    const typeIds = crmContacts.map((c: any) => c.type);
    const categoriesResponse = await axios.get(`http://localhost:8000/api/crm-categories`, {
      params: { ids: Array.from(new Set(typeIds)).join(",") }, // unique IDs only
    });
    const contactCategories = categoriesResponse.data;

    // Build a map: type ID → description
    const categoryMap: { [key: number]: string } = {};
    contactCategories.forEach((cat: any) => {
      categoryMap[cat.id] = cat.description;
    });

    // 4. Merge contact + person + category info
    const merged = crmContacts.map((contact: any) => {
      const person = crmPersons.find((p: any) => p.id === contact.person_id);
      let firstName = "";
      let lastName = "";
      if (person?.name) {
        const parts = person.name.split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      }

      return {
        id: contact.id,
        reference: person.ref,
        assignment: categoryMap[contact.type] || "Unknown",
        firstName,
        lastName,
        phone: person?.phone || "",
        secPhone: person?.phone2 || "",
        fax: person?.fax || "",
        email: person?.email || "",
        inactive: contact.inactive || false,
      };
    });


    return merged;
  } catch (error: any) {
    console.error("Failed to fetch supplier contacts:", error.response?.data || error);
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
