// src/api/ContactCategory/ContactCategoryApi.ts
import axios from "axios";

// Backend base URL
const BASE_URL = "http://localhost:8000/api/crm-categories";


export interface ContactCategory {
  id?: number;  
  type: string;
  subtype: string;
  name: string;
  description: string;
  systm: boolean;       
  inactive: boolean;
}

// Fetch all contact categories
export const getContactCategories = async (): Promise<ContactCategory[]> => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

// Fetch a single contact category by ID
export const getContactCategory = async (id: number): Promise<ContactCategory> => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

// Create a new contact category
export const createContactCategory = async (data: ContactCategory): Promise<ContactCategory> => {
  const res = await axios.post(BASE_URL, data);
  return res.data;
};

// Update an existing contact category
export const updateContactCategory = async (id: number, data: ContactCategory): Promise<ContactCategory> => {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
};

// Delete a contact category
export const deleteContactCategory = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
};
