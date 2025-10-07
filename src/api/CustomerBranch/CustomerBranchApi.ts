import axios from "axios";

export interface CustomerBranch {
  debtor_no?: number;
  br_name: string;
  branch_ref: string;
  sales_person: number;
  sales_area?: number;
  sales_group: number;
  inventory_location: string;
  shipping_company: number;
  tax_group?: number;
  sales_account: string;
  sales_discount_account: string;
  receivables_account: string;
  payment_discount_account: string;
  bank_account?: string;
  br_post_address: string;
  br_address: string;
  notes: string;
  inactive: boolean;
}

const API_URL = "http://localhost:8000/api/customer-branch";

// ✅ Create a new branch
export const createBranch = async (branchData: any) => {
  try {
    const response = await axios.post(API_URL, branchData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Get all branches
export const getBranches = async (customerId?: string | number) => {
  try {
    const response = await axios.get(API_URL, {
      params: { debtor_no: customerId }, // send customer_id as query param
    });
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Get single branch by ID
export const getBranch = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Update branch
export const updateBranch = async (id: string | number, branchData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, branchData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Delete branch
export const deleteBranch = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Get all branch contacts (if your backend has contacts)
export const getBranchContacts = async (branchId: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${branchId}/contacts`);
    return response.data || [];
  } catch (error: any) {
    console.error("Failed to fetch branch contacts:", error.response || error);
    return [];
  }
};
