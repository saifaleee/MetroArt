import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Correct import

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('artToken_yourname');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Optional: Check token expiry
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // Token expired
        } else {
          // Fetch user details to confirm token validity on server-side
          getMe().then(response => {
            setUser(response.data);
          }).catch(() => {
            logout(); // Token invalid or server error
          }).finally(() => setLoading(false));
        }
      } catch (e) {
        console.error("Invalid token:", e);
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await loginApi({ email, password });
      localStorage.setItem('artToken_yourname', data.token);
      const decoded = jwtDecode(data.token);
      // setUser({ id: decoded.id, username: data.username, email: data.email }); // Or fetch from /me
      const meResponse = await getMe();
      setUser(meResponse.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.error(err);
      return false;
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const { data } = await registerApi({ username, email, password });
      localStorage.setItem('artToken_yourname', data.token);
      const decoded = jwtDecode(data.token);
      // setUser({ id: decoded.id, username: data.username, email: data.email });
      const meResponse = await getMe();
      setUser(meResponse.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('artToken_yourname');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);