'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const authApi = axios.create({ baseURL: API_BASE_URL });

const getStoredToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
    }
    return null;
};

const getStoredUser = () => {
    if (typeof window !== 'undefined') {
        const userJson = localStorage.getItem('authUser');
        return userJson ? JSON.parse(userJson) : null;
    }
    return null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser());
    const [token, setToken] = useState(getStoredToken()); 
    const [isLoggedIn, setIsLoggedIn] = useState(!!getStoredToken());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = getStoredToken();
            const storedUser = getStoredUser();

            if (storedToken && storedUser) {
                try {
                    authApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    const response = await authApi.get('/users/me');
                    setUser(response.data);
                    setToken(storedToken);
                    setIsLoggedIn(true);
                    setError(null);
                } catch (err) {
                    console.error("Token verification failed:", err);
                    logout();
                    setError("Session expired or invalid. Please log in again.");
                }
            } else {
                setUser(null);
                setToken(null);
                setIsLoggedIn(false);
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.post('/token', {
                username,
                password,
                grant_type: 'password',
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const newToken = response.data.access_token;
            setToken(newToken);
            localStorage.setItem('authToken', newToken);

            authApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            const userResponse = await authApi.get('/users/me');
            const loggedInUser = userResponse.data;
            setUser(loggedInUser);
            localStorage.setItem('authUser', JSON.stringify(loggedInUser));

            setIsLoggedIn(true);
            toast.success(`Welcome, ${loggedInUser.username}!`);
            return true;
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            const msg = err.response?.data?.detail || "Login failed. Check credentials.";
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username, password, email) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.post('/register', { username, password, email });
            console.log("Registration successful:", response.data);
            setError(null);
            toast.success("Registration successful! Please log in.");
            return true;
        } catch (err) {
            console.error("Registration failed:", err.response?.data || err.message);
            let errorMessage = "Registration failed. Please check your input.";

            if (err.response && err.response.data && err.response.data.detail) {
                if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                }
                else if (Array.isArray(err.response.data.detail) && err.response.data.detail.length > 0) {
                    errorMessage = err.response.data.detail.map(item => item.msg).join('; ');
                }
            } else if (err.message) {
                errorMessage = err.message; 
            }

            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsLoggedIn(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        delete authApi.defaults.headers.common['Authorization'];
        toast.success("You have been logged out.");
    };

    const authContextValue = {
        user,
        token,
        isLoggedIn,
        isLoading,
        error,
        login,
        logout,
        register,
        authApi,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};