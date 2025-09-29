import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const login = async (data: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, data);

    return {
      ...response.data,
      access_token: response.data.token,
    };
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("token");
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
