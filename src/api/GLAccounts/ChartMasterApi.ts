import axios from "axios";

const API_URL = "http://localhost:8000/api/chart-masters";

export const createChartMaster = async (chartMasterData: any) => {
  try {
    const response = await axios.post(API_URL, chartMasterData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    console.error("AXIOS ERROR:", error);
    if (error.response) {
      console.error("Backend response:", error.response.data);
      throw error.response.data;
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error("No response from server");
    } else {
      console.error("Axios setup error:", error.message);
      throw new Error(error.message);
    }
  }
};

export const getChartMasters = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getChartMaster = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateChartMaster = async (id: string | number, chartMasterData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, chartMasterData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteChartMaster = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
