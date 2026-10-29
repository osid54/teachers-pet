'use client';

import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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
        try {
            const user = userJson ? JSON.parse(userJson) : null;
            return user && typeof user === 'object' && user.id ? user : null;
        } catch {
            localStorage.removeItem('authUser');
            return null;
        }
    }
    return null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);
    const [token, setToken] = useState(getStoredToken);
    const [isLoggedIn, setIsLoggedIn] = useState(!!getStoredToken());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionError, setSessionError] = useState(null);
    const sessionVersion = useRef(0);

    const logout = useCallback((silent = false) => {
        sessionVersion.current += 1;
        setUser(null);
        setToken(null);
        setIsLoggedIn(false);
        setIsLoading(false);
        setSessionError(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        delete authApi.defaults.headers.common['Authorization'];
        if (!silent) toast.success('You have been logged out.');
    }, []);

    const refreshSession = useCallback(async () => {
        const storedToken = getStoredToken();
        if (!storedToken) { logout(true); return; }
        const version = ++sessionVersion.current;
        setIsLoading(true);
        setSessionError(null);
        authApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
            const response = await authApi.get('/users/me', { timeout: 15000 });
            if (version !== sessionVersion.current) return;
            setUser(response.data);
            setToken(storedToken);
            setIsLoggedIn(true);
            localStorage.setItem('authUser', JSON.stringify(response.data));
        } catch (err) {
            if (version !== sessionVersion.current) return;
            if (err.response?.status === 401) logout(true);
            else setSessionError('Unable to verify your session. Your sign-in has been preserved.');
        } finally {
            if (version === sessionVersion.current) setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        refreshSession();
        return () => { sessionVersion.current += 1; };
    }, [refreshSession]);

    useEffect(() => {
        const interceptor = authApi.interceptors.response.use(response => response, err => {
            const authorization = err.config?.headers?.get?.('Authorization') || err.config?.headers?.Authorization;
            if (err.response?.status === 401 && authorization && authorization === authApi.defaults.headers.common['Authorization']) {
                logout(true);
            }
            return Promise.reject(err);
        });
        return () => authApi.interceptors.response.eject(interceptor);
    }, [logout]);

    const login = async (username, password) => {
        const version = ++sessionVersion.current;
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
            const userResponse = await authApi.get('/users/me', {
                headers: { Authorization: `Bearer ${newToken}` }, timeout: 15000,
            });
            if (version !== sessionVersion.current) return false;
            setToken(newToken);
            localStorage.setItem('authToken', newToken);
            authApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            const loggedInUser = userResponse.data;
            setUser(loggedInUser);
            localStorage.setItem('authUser', JSON.stringify(loggedInUser));

            setIsLoggedIn(true);
            setSessionError(null);
            toast.success(`Welcome, ${loggedInUser.username}!`);
            return true;
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            const msg = err.response?.data?.detail || "Login failed. Check credentials.";
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            if (version === sessionVersion.current) setIsLoading(false);
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
        refreshSession,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {sessionError && <div role="status" className="mt-[90px] p-md text-main-700">
                {sessionError} <button type="button" className="underline" onClick={refreshSession} disabled={isLoading}>Retry session</button>
            </div>}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};