import axios from "axios";

const API_URL = "http://localhost:8000/api/item-codes";

export const getItemCodes = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching item codes:", error);
        return [];
    }
};

export const getItemCodeById = async (id: string | number) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching item code ${id}:`, error);
        return null;
    }
};

export const createItemCode = async (data: any) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error: any) {
        console.error("Error creating item code:", error.response?.data || error);
        throw error.response?.data || error;
    }
};

export const updateItemCode = async (id: string | number, data: any) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error(`Error updating item code ${id}:`, error.response?.data || error);
        throw error.response?.data || error;
    }
};

export const deleteItemCode = async (id: string | number) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error deleting item code ${id}:`, error.response?.data || error);
        throw error.response?.data || error;
    }
};
