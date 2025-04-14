import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

// Auth APIs
export const login = async ({ email, password }) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userId', res.data.userId);
    toast.success('Logged in successfully');
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Login failed');
    throw error;
  }
};

export const signup = async ({ email, password }) => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userId', res.data.userId);
    toast.success('Signed up successfully');
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Signup failed');
    throw error;
  }
};