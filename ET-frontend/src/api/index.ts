import axios from 'axios';
import type { AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  email: string;
  token: string;
  userId: string;
  // Extended profile fields (optional for backward compatibility)
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  id: string;
  user: string;
  category: string;
  amount: number;
  comments?: string;
  paymentMethod: 'card' | 'cash' | 'account' | 'digital';
  createdAt: string;
  updatedAt: string;
  date: string;
}

export interface ExpenseInput {
  category: string;
  amount: number;
  comments?: string;
  description?: string;
  paymentMethod?: 'card' | 'cash' | 'account' | 'digital';
  date?: string;
}

export interface Income {
  _id: string;
  id: string;
  user: string;
  source: 'salary' | 'freelance' | 'investment' | 'business' | 'other';
  amount: number;
  description?: string;
  date: string;
  isRecurring: boolean;
  frequency: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface IncomeInput {
  source: 'salary' | 'freelance' | 'investment' | 'business' | 'other';
  amount: number;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  frequency?: 'weekly' | 'monthly' | 'yearly';
}

export interface DistributionData {
  _id: string;
  total: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface UserProfileUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
}

// Helper functions
const getAuthHeaders = () => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
});

const handleError = (error: any): never => {
  console.error('API error:', error.response?.data || error.message);
  if (error.response?.status === 401) {
    logout();
    window.location.href = '/login';
  }
  throw error;
};

// Auth utilities
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

// Auth API calls
export const login = async (credentials: { email: string; password: string }): Promise<User> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: User }> = await axios.post(
      `${API_URL}/auth/login`, 
      credentials
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const signup = async (credentials: { email: string; password: string }): Promise<User> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: User }> = await axios.post(
      `${API_URL}/auth/signup`, 
      credentials
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Profile API calls
export const updateProfile = async (data: UserProfileUpdate): Promise<User> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: User }> = await axios.put(
      `${API_URL}/auth/profile`,
      data,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; message: string }> = await axios.put(
      `${API_URL}/auth/change-password`,
      data,
      getAuthHeaders()
    );
    return { message: response.data.message };
  } catch (error) {
    handleError(error);
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: User }> = await axios.get(
      `${API_URL}/auth/profile`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Expense API calls
export const createExpense = async (data: ExpenseInput): Promise<Expense> => {
  console.log('Creating expense with data:', data);
  
  if (!data || typeof data !== 'object' || !data.category || !data.amount) {
    throw new Error('Invalid expense data');
  }

  // Transform the data to match backend expectations
  const expenseData = {
    category: data.category,
    amount: data.amount,
    comments: data.comments || data.description || '',
    paymentMethod: data.paymentMethod || 'card',
    date: data.date,
  };

  try {
    const response: AxiosResponse<{ success: boolean; data: Expense }> = await axios.post(
      `${API_URL}/expenses`, 
      expenseData, 
      getAuthHeaders()
    );
    
    // Transform the response to include frontend-expected fields
    const expense = response.data.data;
    return {
      ...expense,
      id: expense._id,
      date: expense.date || expense.createdAt,
    };
  } catch (error) {
    handleError(error);
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const response: AxiosResponse<Expense[]> = await axios.get(
      `${API_URL}/expenses`, 
      getAuthHeaders()
    );
    
    // Transform expenses to include frontend-expected fields
    return response.data.map(expense => ({
      ...expense,
      id: expense._id,
      date: expense.date || expense.createdAt,
    }));
  } catch (error) {
    handleError(error);
  }
};

export const updateExpense = async (id: string, data: ExpenseInput): Promise<Expense> => {
  console.log(`Updating expense ID: ${id} with data:`, data);
  
  if (typeof id !== 'string' || !id) {
    throw new Error('Invalid expense ID');
  }
  if (!data || typeof data !== 'object' || !data.category || !data.amount) {
    throw new Error('Invalid expense data');
  }

  // Transform the data to match backend expectations
  const expenseData = {
    category: data.category,
    amount: data.amount,
    comments: data.comments || data.description || '',
    paymentMethod: data.paymentMethod || 'card',
    date: data.date,
  };

  try {
    const response: AxiosResponse<{ success: boolean; data: Expense }> = await axios.put(
      `${API_URL}/expenses/${id}`,
      expenseData,
      getAuthHeaders()
    );
    
    // Transform the response to include frontend-expected fields
    const expense = response.data.data;
    return {
      ...expense,
      id: expense._id,
      date: expense.date || expense.createdAt,
    };
  } catch (error) {
    handleError(error);
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  console.log(`Sending DELETE request for expense ID: ${id}`);
  
  if (typeof id !== 'string' || !id) {
    throw new Error('Invalid expense ID');
  }

  try {
    await axios.delete(`${API_URL}/expenses/${id}`, getAuthHeaders());
  } catch (error) {
    handleError(error);
  }
};

export const getDistribution = async (): Promise<DistributionData[]> => {
  try {
    const response: AxiosResponse<DistributionData[]> = await axios.get(
      `${API_URL}/expenses/distribution`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Income API calls
export const createIncome = async (data: IncomeInput): Promise<Income> => {
  console.log('Creating income with data:', data);
  
  if (!data || typeof data !== 'object' || !data.source || !data.amount) {
    throw new Error('Invalid income data');
  }

  try {
    const response: AxiosResponse<{ success: boolean; data: Income }> = await axios.post(
      `${API_URL}/incomes`, 
      data, 
      getAuthHeaders()
    );
    
    // Transform the response to include frontend-expected fields
    const income = response.data.data;
    return {
      ...income,
      id: income._id,
    };
  } catch (error) {
    handleError(error);
  }
};

export const getIncomes = async (): Promise<Income[]> => {
  try {
    const response: AxiosResponse<Income[]> = await axios.get(
      `${API_URL}/incomes`, 
      getAuthHeaders()
    );
    
    // Transform incomes to include frontend-expected fields
    return response.data.map(income => ({
      ...income,
      id: income._id,
    }));
  } catch (error) {
    handleError(error);
  }
};

export const getTotalIncome = async (month?: number, year?: number): Promise<{ total: number }> => {
  try {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response: AxiosResponse<{ total: number }> = await axios.get(
      `${API_URL}/incomes/total?${params.toString()}`, 
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateIncome = async (id: string, data: IncomeInput): Promise<Income> => {
  console.log(`Updating income ID: ${id} with data:`, data);
  
  if (typeof id !== 'string' || !id) {
    throw new Error('Invalid income ID');
  }
  if (!data || typeof data !== 'object' || !data.source || !data.amount) {
    throw new Error('Invalid income data');
  }

  try {
    const response: AxiosResponse<{ success: boolean; data: Income }> = await axios.put(
      `${API_URL}/incomes/${id}`,
      data,
      getAuthHeaders()
    );
    
    // Transform the response to include frontend-expected fields
    const income = response.data.data;
    return {
      ...income,
      id: income._id,
    };
  } catch (error) {
    handleError(error);
  }
};

export const deleteIncome = async (id: string): Promise<void> => {
  console.log(`Sending DELETE request for income ID: ${id}`);
  
  if (typeof id !== 'string' || !id) {
    throw new Error('Invalid income ID');
  }

  try {
    await axios.delete(`${API_URL}/incomes/${id}`, getAuthHeaders());
  } catch (error) {
    handleError(error);
  }
};

// Legacy Budget API calls (kept for backward compatibility during transition)
export const getBudget = async (): Promise<{ amount: number; period: string }> => {
  // Try to get total income first, fallback to localStorage budget
  try {
    const currentDate = new Date();
    const incomeData = await getTotalIncome(currentDate.getMonth() + 1, currentDate.getFullYear());
    if (incomeData.total > 0) {
      return {
        amount: incomeData.total,
        period: 'monthly'
      };
    }
  } catch (error) {
    // Fall back to localStorage if income API fails
  }
  
  const savedBudget = localStorage.getItem('monthlyBudget');
  return {
    amount: savedBudget ? parseFloat(savedBudget) : 2000,
    period: 'monthly'
  };
};

export const updateBudget = async (amount: number): Promise<{ amount: number; period: string }> => {
  // For now, save to localStorage (this will be replaced with income management)
  localStorage.setItem('monthlyBudget', amount.toString());
  return {
    amount,
    period: 'monthly'
  };
};

// AI API calls
export const categorizeExpenseAI = async (description: string): Promise<{ category: string; confidence: number }> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: { category: string; confidence: number } }> = await axios.post(
      `${API_URL}/ai/categorize`,
      { description },
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    console.error('AI categorization error:', error);
    return { category: 'other', confidence: 0 };
  }
};

export const getSpendingAnalysis = async (): Promise<any> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: any }> = await axios.get(
      `${API_URL}/ai/analyze`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getBudgetRecommendations = async (): Promise<any> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: any }> = await axios.get(
      `${API_URL}/ai/budget-recommendations`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getSpendingAnomalies = async (): Promise<any> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: any }> = await axios.get(
      `${API_URL}/ai/anomalies`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getFinancialInsights = async (): Promise<any> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: any }> = await axios.get(
      `${API_URL}/ai/insights`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Chatbot API calls
export interface ChatMessage {
  id: string;
  timestamp: string;
  userMessage: string;
  botResponse: string;
  success: boolean;
}

export interface ChatResponse {
  response: string;
  action?: {
    type: string;
    data: any;
  };
  actionResult?: any;
  sessionId: string;
  timestamp: string;
}

export const sendChatMessage = async (message: string, currency?: { code: string; symbol: string; position: 'before' | 'after' }): Promise<ChatResponse> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: ChatResponse }> = await axios.post(
      `${API_URL}/chatbot/message`,
      { message, currency },
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getChatHistory = async (limit?: number): Promise<{ history: ChatMessage[]; totalMessages: number }> => {
  try {
    const params = limit ? `?limit=${limit}` : '';
    const response: AxiosResponse<{ success: boolean; data: { history: ChatMessage[]; totalMessages: number } }> = await axios.get(
      `${API_URL}/chatbot/history${params}`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const clearChatHistory = async (): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; message: string }> = await axios.delete(
      `${API_URL}/chatbot/history`,
      getAuthHeaders()
    );
    return { message: response.data.message };
  } catch (error) {
    handleError(error);
  }
};

export const getChatbotCapabilities = async (): Promise<any> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: any }> = await axios.get(
      `${API_URL}/chatbot/capabilities`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Speech API calls
export interface SpeechToTextResponse {
  transcript: string;
  confidence: number;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
  metadata?: {
    processedAt: string;
    language: string;
    userId: string;
  };
}

export interface VoiceMessageResponse extends ChatResponse {
  data: {
    speech: {
      transcript: string;
      confidence: number;
      alternatives?: Array<{
        transcript: string;
        confidence: number;
      }>;
    };
    chatbot: {
      response: string;
      action?: {
        type: string;
        data: any;
      };
      success: boolean;
    };
    metadata: {
      processedAt: string;
      language: string;
      userId: string;
      inputMethod: string;
    };
  };
}

export const speechToText = async (audioBlob: Blob, options?: {
  language?: string;
  encoding?: string;
  sampleRate?: number;
}): Promise<SpeechToTextResponse> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    
    if (options?.language) {
      formData.append('language', options.language);
    }
    if (options?.encoding) {
      formData.append('encoding', options.encoding);
    }
    if (options?.sampleRate) {
      formData.append('sampleRate', options.sampleRate.toString());
    }

    const response: AxiosResponse<{ success: boolean; data: SpeechToTextResponse }> = await axios.post(
      `${API_URL}/speech/speech-to-text`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.data;
  } catch (error: any) {
    // Special handling for speech service unavailable
    if (error.response?.status === 503) {
      throw new Error('Speech recognition service is not available. Please check server configuration.');
    }
    handleError(error);
  }
};

export const sendVoiceMessage = async (audioBlob: Blob, options?: {
  language?: string;
  currency?: { code: string; symbol: string; position: 'before' | 'after' };
  encoding?: string;
  sampleRate?: number;
}): Promise<VoiceMessageResponse> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    
    if (options?.language) {
      formData.append('language', options.language);
    }
    if (options?.currency) {
      formData.append('currency', JSON.stringify(options.currency));
    }
    if (options?.encoding) {
      formData.append('encoding', options.encoding);
    }
    if (options?.sampleRate) {
      formData.append('sampleRate', options.sampleRate.toString());
    }

    const response: AxiosResponse<VoiceMessageResponse> = await axios.post(
      `${API_URL}/speech/voice-message`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getSpeechLanguages = async (): Promise<Array<{ code: string; name: string }>> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: { languages: Array<{ code: string; name: string }>; default: string } }> = await axios.get(
      `${API_URL}/speech/languages`,
      getAuthHeaders()
    );
    return response.data.data.languages;
  } catch (error) {
    handleError(error);
  }
};

export const getSpeechServiceStatus = async (): Promise<{ available: boolean; message: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: { available: boolean; message: string } }> = await axios.get(
      `${API_URL}/speech/status`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error: any) {
    // Don't throw error for speech service status check - just return unavailable
    console.warn('Speech service status check failed:', error.response?.data?.message || error.message);
    return {
      available: false,
      message: error.response?.data?.message || 'Speech service unavailable'
    };
  }
};

// Utility functions for data transformation
export const transformExpenseForBackend = (expense: any): ExpenseInput => ({
  category: expense.category,
  amount: expense.amount,
  comments: expense.description || expense.comments || '',
});

export const transformExpenseFromBackend = (expense: any): Expense => ({
  ...expense,
  id: expense._id,
  date: expense.date || expense.createdAt,
  description: expense.comments || '',
});