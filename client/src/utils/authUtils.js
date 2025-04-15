import { jwtDecode } from "jwt-decode";

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      logout();
      return false;
    }
    return true;
  } catch (error) {
    console.error("Token decoding error:", error);
    return false; // Don't automatically logout on decode error
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
};

export const setToken = (token) => {
  localStorage.setItem("token", token);
};
