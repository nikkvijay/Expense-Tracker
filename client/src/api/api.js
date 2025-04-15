import axios from "axios";
import { logout } from "@/utils/authUtils";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const handleError = (error) => {
  console.error("API error:", error.response?.data || error.message);
  if (error.response?.status === 401) {
    logout();
    window.location.href = "/login";
  }
  throw error;
};

export const login = async ({ email, password }) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const signup = async ({ email, password }) => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, { email, password });
    return res.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const createExpense = async (data) => {
  console.log("Creating expense with data:", data);
  if (!data || typeof data !== "object" || !data.category || !data.amount) {
    throw new Error("Invalid expense data");
  }
  try {
    const res = await axios.post(`${API_URL}/expenses`, data, getAuthHeaders());
    return res.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getExpenses = async () => {
  try {
    const res = await axios.get(`${API_URL}/expenses`, getAuthHeaders());
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateExpense = async (id, data) => {
  console.log(`Updating expense ID: ${id} with data:`, data);
  if (typeof id !== "string" || !id) {
    throw new Error("Invalid expense ID");
  }
  if (!data || typeof data !== "object" || !data.category || !data.amount) {
    throw new Error("Invalid expense data");
  }
  try {
    const res = await axios.put(
      `${API_URL}/expenses/${id}`,
      data,
      getAuthHeaders()
    );
    return res.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteExpense = async (id) => {
  console.log(`Sending DELETE request for expense ID: ${id}`);
  if (typeof id !== "string" || !id) {
    throw new Error("Invalid expense ID");
  }
  try {
    await axios.delete(`${API_URL}/expenses/${id}`, getAuthHeaders());
  } catch (error) {
    handleError(error);
  }
};

export const getDistribution = async () => {
  try {
    const res = await axios.get(
      `${API_URL}/expenses/distribution`,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
