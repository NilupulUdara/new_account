import axios from "axios";

//TAX TYPES API
const TAX_TYPES_API_URL = "http://localhost:8000/api/tax-types";

export const createTaxType = async (taxTypeData: any) => {
  try {
    const response = await axios.post(TAX_TYPES_API_URL, taxTypeData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getTaxTypes = async () => {
  try {
    const response = await axios.get(TAX_TYPES_API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getTaxType = async (id: string | number) => {
  try {
    const response = await axios.get(`${TAX_TYPES_API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateTaxType = async (
  id: string | number,
  taxTypeData: any
) => {
  try {
    const response = await axios.put(`${TAX_TYPES_API_URL}/${id}`, taxTypeData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteTaxType = async (id: string | number) => {
  try {
    const response = await axios.delete(`${TAX_TYPES_API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};


//TAX GROUPS API
const TAX_GROUPS_API_URL = "http://localhost:8000/api/tax-groups";

export const createTaxGroup = async (taxGroupData: any) => {
  try {
    const response = await axios.post(TAX_GROUPS_API_URL, taxGroupData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getTaxGroups = async () => {
  try {
    const response = await axios.get(TAX_GROUPS_API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getTaxGroup = async (id: string | number) => {
  try {
    const response = await axios.get(`${TAX_GROUPS_API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateTaxGroup = async (
  id: string | number,
  taxGroupData: any
) => {
  try {
    const response = await axios.put(
      `${TAX_GROUPS_API_URL}/${id}`,
      taxGroupData
    );
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteTaxGroup = async (id: string | number) => {
  try {
    const response = await axios.delete(`${TAX_GROUPS_API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
