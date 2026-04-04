'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Checkbox } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import TemplateListGrid from '@/components/templates/TemplateListGrid';
import { PREDEFINED_TAGS } from '@/lib/constants';

export default function TemplatesPage() {
    const {
        user, isLoggedIn, isLoading: authLoading, error: authError,
        login, register, logout, authApi
    } = useAuth();

    const [activeTab, setActiveTab] = useState('public');
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [inlineAuthError, setInlineAuthError] = useState(null);

    const [publicTemplates, setPublicTemplates] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [templatesError, setTemplatesError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(0);
    const templatesPerPage = 10;

    useEffect(() => { setIsMounted(true); }, [isLoggedIn]);

    const fetchTemplates = useCallback(async () => {
        if (!isMounted || authLoading || !authApi) {
            return;
        }

        setIsLoadingTemplates(true);
        setTemplatesError(null);

        try {
            let response;
            if (activeTab === 'public') {
                const params = {
                    skip: currentPage * templatesPerPage,
                    limit: templatesPerPage,
                    q: searchQuery || undefined,
                    tags: selectedTags.length > 0 ? selectedTags : undefined,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                };
                response = await authApi.get('/templates/public', { params });
            } else if (activeTab === 'my' && isLoggedIn) {
                response = await authApi.get('/templates/me');
            } else if (activeTab === 'saved' && isLoggedIn) {
                response = await authApi.get('/templates/saved');
            }

            setPublicTemplates(response.data);
        } catch (err) {
            console.error(`Failed to fetch ${activeTab} templates:`, err.response?.data || err.message);
            const msg = err.response?.data?.detail || `Failed to load ${activeTab} templates.`;
            setTemplatesError(msg);
            toast.error(msg);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                logout();
            }
        } finally {
            setIsLoadingTemplates(false);
        }
    }, [activeTab, isLoggedIn, isMounted, authLoading, authApi, currentPage, searchQuery, selectedTags, sortBy, sortOrder]);


    const handleUseTemplate = (template) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('tempLoadTemplate', JSON.stringify(template.settings_json));
            router.push('/');
        }
    };

    const handleEditTemplate = (templateId) => {
        router.push(`/?templateId=${templateId}`);
    };

    const handleLikeTemplate = async (templateId) => {
        if (!isLoggedIn) {
            toast.error("Please log in to like templates.");
            return;
        }
        try {
            const response = await authApi.post(`/templates/${templateId}/like`);
            toast.success(response.data.message);
            if (activeTab === 'public') {
                setPublicTemplates(prev => prev.map(t =>
                    t.id === templateId ? { ...t, likes_count: response.data.likes_count } : t
                ));
            } else if (activeTab === 'my') {
                setMyTemplates(prev => prev.map(t =>
                    t.id === templateId ? { ...t, likes_count: response.data.likes_count } : t
                ));
            }
        } catch (err) {
            console.error("Failed to like template:", err.response?.data || err.message);
            const msg = err.response?.data?.detail || "Failed to like template.";
            toast.error(msg);
        }
    };

    const handleFavoriteTemplate = async (templateId) => {
        if (!isLoggedIn) {
            toast.error("Please log in to favorite templates.");
            return;
        }
        try {
            const response = await authApi.post(`/templates/${templateId}/favorite`);
            toast.success(response.data.message);
            if (activeTab === 'saved') {
                fetchTemplates();
            }
        } catch (err) {
            console.error("Failed to favorite template:", err.response?.data || err.message);
            const msg = err.response?.data?.detail || "Failed to favorite template.";
            toast.error(msg);
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!isLoggedIn) {
            toast.error("Please log in to delete templates.");
            return;
        }
        try {
            await authApi.delete(`/templates/${templateId}`);
            toast.success("Template deleted successfully!");
            if (activeTab === 'my') {
                setMyTemplates(prev => prev.filter(t => t.id !== templateId));
            }
            setPublicTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (err) {
            console.error("Failed to delete template:", err.response?.data || err.message);
            const msg = err.response?.data?.detail || "Failed to delete template.";
            toast.error(msg);
        }
    };

    useEffect(() => {
        if (isMounted && !authLoading && authApi) {
            fetchTemplates();
        }
    }, [activeTab, isLoggedIn, isMounted, authLoading, authApi]); 

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setInlineAuthError(null);
        const success = await login(loginUsername, loginPassword);
        if (!success) {
            setInlineAuthError(authError || "Login failed. Please try again.");
        } else {
            setShowLoginForm(false);
            setShowRegisterForm(false);
            setActiveTab('my');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setInlineAuthError(null);
        if (registerPassword !== registerConfirmPassword) {
            setInlineAuthError("Passwords do not match!");
            return;
        }
        const success = await register(registerUsername, registerPassword, registerEmail);
        if (!success) {
            setInlineAuthError(authError || "Registration failed. Username or email may be taken.");
        } else {
            alert("Registration successful! Please log in.");
            setShowLoginForm(true);
            setShowRegisterForm(false);
            setRegisterUsername('');
            setRegisterEmail('');
            setRegisterPassword('');
            setRegisterConfirmPassword('');
        }
    };

    if (!isMounted) {
        return <div className="text-center p-xxl text-lg text-main-500 m-0">Loading templates...</div>;
    }

    return (
        <div className="flex flex-col gap-lg max-w-[1200px] mx-auto p-md">
            <h1 className="text-xl font-bold text-main-700 text-center mb-md">Templates</h1>

            {!isLoggedIn ? (
                <div className="flex flex-col items-center gap-md mb-xxl">
                    <p className="text-base text-main-500 text-center max-w-2xl">
                        Log in or register to save your own templates, organize your favorites, and access personalized features!
                    </p>
                    <div className="flex gap-md">
                        <Button
                            onClick={() => { setShowLoginForm(!showLoginForm); setShowRegisterForm(false); setInlineAuthError(null); }}
                            variant={showLoginForm ? 'primary' : 'secondary'}
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => { setShowRegisterForm(!showRegisterForm); setShowLoginForm(false); setInlineAuthError(null); }}
                            variant={showRegisterForm ? 'primary' : 'secondary'}
                        >
                            Register
                        </Button>
                    </div>

                    {inlineAuthError && <p className="text-main-600 text-sm mt-xs mb-md font-medium">{inlineAuthError}</p>}

                    {(showLoginForm || showRegisterForm) && (
                        <div className="bg-main-100 rounded-lg p-xl shadow-sm border-2 border-dashed border-main-300 w-full max-w-md mt-md">
                            <form
                                onSubmit={showLoginForm ? handleLoginSubmit : handleRegisterSubmit}
                                className="flex flex-col gap-md"
                            >
                                <Input label="Username" value={showLoginForm ? loginUsername : registerUsername} onChange={(e) => showLoginForm ? setLoginUsername(e.target.value) : setRegisterUsername(e.target.value)} required />
                                {!showLoginForm && <Input label="Email" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />}
                                <Input label="Password" type="password" value={showLoginForm ? loginPassword : registerPassword} onChange={(e) => showLoginForm ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)} required />
                                {!showLoginForm && <Input label="Confirm Password" type="password" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} required />}
                                <Button type="submit" isLoading={authLoading} className="mt-xs">
                                    {showLoginForm ? 'Login' : 'Register'}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-wrap justify-center gap-md mb-lg">
                    {['public', 'my', 'saved'].map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            variant={activeTab === tab ? 'primary' : 'secondary'}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Templates
                        </Button>
                    ))}
                        <Link href="/">
                            <Button variant="secondary">
                                Create New Template
                            </Button>
                        </Link>
                    <Button onClick={logout} variant="secondary">Logout</Button>
                </div>
            )}

            <section className="bg-main-100 rounded-lg p-lg shadow-sm">
                <h2 className="text-h2 text-main-600 mb-lg border-b border-main-300 pb-xs capitalize">
                    {activeTab} Templates
                </h2>

                <div className="flex flex-col gap-lg mb-xl bg-main-200 p-md rounded-md">
                    <Input
                        label="Search"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                        placeholder="Search by name or description..."
                        labelPosition="top"
                    />

                    <div className="flex flex-wrap items-end gap-md">
                        <div className="flex flex-col gap-xxs">
                            <h3 className="text-sm font-medium text-main-500">Sort By:</h3>
                            <div className="flex gap-xs">
                                <select
                                    className="border border-main-300 rounded-sm bg-main-100 p-xs text-main-600"
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
                                >
                                    <option value="created_at">Date Created</option>
                                    <option value="likes_count">Likes</option>
                                </select>
                                <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} variant="order">
                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-xxs flex-grow">
                            <h3 className="text-sm font-medium text-main-500">Filter by Tags:</h3>
                            <div className="flex flex-wrap gap-sm bg-main-100 p-sm rounded-sm border border-main-300">
                                {PREDEFINED_TAGS.map(tag => (
                                    <Checkbox
                                        key={tag}
                                        label={tag}
                                        checked={selectedTags.includes(tag)}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setSelectedTags(prev => isChecked ? [...prev, tag] : prev.filter(t => t !== tag));
                                            setCurrentPage(0);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <TemplateListGrid
                    templates={publicTemplates}
                    isLoading={isLoadingTemplates}
                    emptyMessage="No templates found."
                    authContext={{ user, isLoggedIn }}
                    onUse={handleUseTemplate}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                    onLike={handleLikeTemplate}
                    onFavorite={handleFavoriteTemplate}
                    activeTab={activeTab}
                />

                <div className="flex justify-center gap-md mt-xl">
                    <Button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 0}>Previous</Button>
                    <Button onClick={() => setCurrentPage(prev => prev + 1)} disabled={publicTemplates.length < templatesPerPage}>Next</Button>
                </div>
            </section>
        </div>
    );
}