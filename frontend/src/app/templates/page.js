'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Checkbox } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import styles from '@/styles/pages/_templates.module.scss';
import authFormStyles from '@/styles/components/ui/_authForms.module.scss';

import TemplateListGrid from '@/components/templates/TemplateListGrid';

import { PREDEFINED_TAGS } from '@/lib/constants';

export default function TemplatesPage() {
    const {
        user,
        isLoggedIn,
        isLoading: authLoading,
        error: authError,
        login,
        register,
        logout,
        authApi
    } = useAuth(); const [activeTab, setActiveTab] = useState('public');
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
    const [myTemplates, setMyTemplates] = useState([]);
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [templatesError, setTemplatesError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(0);
    const templatesPerPage = 10;

    useEffect(() => {
        setIsMounted(true);
    }, [isLoggedIn]);

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
                setPublicTemplates(response.data);
            } else if (activeTab === 'my' && isLoggedIn) {
                response = await authApi.get('/templates/me');
                setMyTemplates(response.data);
            } else if (activeTab === 'saved' && isLoggedIn) {
                response = await authApi.get('/templates/saved');
                setSavedTemplates(response.data);
            }
        } catch (err) {
            console.error(`Failed to fetch ${activeTab} templates:`, err.response?.data || err.message);
            setTemplatesError(err.response?.data?.detail || `Failed to load ${activeTab} templates.`);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                logout();
            }
        } finally {
            setIsLoadingTemplates(false);
        }
    }, [activeTab, isLoggedIn, isMounted, authLoading, authApi, currentPage, searchQuery, selectedTags, sortBy, sortOrder]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

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
            alert("Please log in to like templates.");
            return;
        }
        try {
            const response = await authApi.post(`/templates/${templateId}/like`);
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
            alert("Failed to like template. " + (err.response?.data?.detail || ""));
        }
    };

    const handleFavoriteTemplate = async (templateId) => {
        if (!isLoggedIn) {
            alert("Please log in to favorite templates.");
            return;
        }
        try {
            const response = await authApi.post(`/templates/${templateId}/favorite`);
            alert(response.data.message);
            if (activeTab === 'saved') {
                fetchTemplates();
            }
        } catch (err) {
            console.error("Failed to favorite template:", err.response?.data || err.message);
            alert("Failed to favorite template. " + (err.response?.data?.detail || ""));
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!isLoggedIn) {
            alert("Please log in to delete templates.");
            return;
        }
        try {
            await authApi.delete(`/templates/${templateId}`);
            alert("Template deleted successfully!"); // Or a toast
            if (activeTab === 'my') {
                setMyTemplates(prev => prev.filter(t => t.id !== templateId));
            }
            setPublicTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (err) {
            console.error("Failed to delete template:", err.response?.data || err.message);
            alert("Failed to delete template. " + (err.response?.data?.detail || ""));
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
        return <div className={styles.loadingMessage}>Loading templates...</div>;
    }

    return (
        <div className={styles.templatesContainer}>
            <h1 className={styles.pageTitle}>Templates</h1>

            {!isLoggedIn ? (
                <div className={styles.authPromptSection}>
                    <p className={styles.authMessage}>
                        Log in or register to save your own templates, organize your favorites, and access personalized features!
                    </p>
                    <div className={styles.authButtons}>
                        <Button
                            onClick={() => { setShowLoginForm(true); setShowRegisterForm(false); setInlineAuthError(null); }}
                            variant={showLoginForm ? 'primary' : 'secondary'}
                            className={styles.authButton}
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => { setShowRegisterForm(true); setShowLoginForm(false); setInlineAuthError(null); }}
                            variant={showRegisterForm ? 'primary' : 'secondary'}
                            className={styles.authButton}
                        >
                            Register
                        </Button>
                    </div>

                    {inlineAuthError && <p className={authFormStyles.errorMessage}>{inlineAuthError}</p>}

                    {showLoginForm && (
                        <div className={authFormStyles.authFormContainer}>
                            <form onSubmit={handleLoginSubmit} className={authFormStyles.form}>
                                <Input
                                    label="Username"
                                    type="text"
                                    value={loginUsername}
                                    onChange={(e) => setLoginUsername(e.target.value)}
                                    required
                                    className={authFormStyles.inputField}
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    className={authFormStyles.inputField}
                                />
                                <Button type="submit" isLoading={authLoading} disabled={authLoading} className={authFormStyles.submitButton}>
                                    Login
                                </Button>
                            </form>
                        </div>
                    )}

                    {showRegisterForm && (
                        <div className={authFormStyles.authFormContainer}>
                            <form onSubmit={handleRegisterSubmit} className={authFormStyles.form}>
                                <Input
                                    label="Username"
                                    type="text"
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                    required
                                    className={authFormStyles.inputField}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    required
                                    className={authFormStyles.inputField}
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                    className={authFormStyles.inputField}
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    value={registerConfirmPassword}
                                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                    required
                                    className={authFormStyles.inputField}
                                />
                                <Button type="submit" isLoading={authLoading} disabled={authLoading} className={authFormStyles.submitButton}>
                                    Register
                                </Button>
                            </form>
                        </div>
                    )}
                    {(!showLoginForm && !showRegisterForm) && (
                        <section className={styles.templateSection}>
                            <h2 className={styles.sectionTitle}>Public Templates</h2>
                            <div className={styles.filterSection}>
                                <Input
                                    label="Search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                                    placeholder="Search by name or description..."
                                    labelPosition="top"
                                    className={styles.searchInput}
                                />

                                <div className={styles.tagFilters}>
                                    <h3 className={styles.filterTitle}>Filter by Tags:</h3>
                                    <div className={styles.tagCheckboxes}>
                                        {PREDEFINED_TAGS.map(tag => (
                                            <Checkbox
                                                key={tag}
                                                label={tag}
                                                checked={selectedTags.includes(tag)}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setSelectedTags(prev =>
                                                        isChecked ? [...prev, tag] : prev.filter(t => t !== tag)
                                                    );
                                                    setCurrentPage(0);
                                                }}
                                                labelPosition="inline"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.sortOptions}>
                                    <h3 className={styles.filterTitle}>Sort By:</h3>
                                    <select
                                        className={styles.sortSelect}
                                        value={sortBy}
                                        onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
                                    >
                                        <option value="created_at">Date Created</option>
                                        <option value="likes_count">Likes</option>
                                    </select>
                                    <select
                                        className={styles.sortSelect}
                                        value={sortOrder}
                                        onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(0); }}
                                    >
                                        <option value="desc">Descending</option>
                                        <option value="asc">Ascending</option>
                                    </select>
                                </div>
                            </div>

                            <TemplateListGrid
                                templates={publicTemplates}
                                isLoading={isLoadingTemplates}
                                emptyMessage={searchQuery || selectedTags.length > 0 ? "No templates match your search." : "No public templates found."}
                                loadingMessage="Loading public templates..."
                                authContext={{ user: null, isLoggedIn: false }}
                                onUse={handleUseTemplate}
                                onEdit={handleEditTemplate}
                                onLike={handleLikeTemplate}
                                onFavorite={handleFavoriteTemplate}
                            />
                            <div className={styles.pagination}>
                                <Button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 0}>Previous</Button>
                                <Button onClick={() => setCurrentPage(prev => prev + 1)} disabled={publicTemplates.length < templatesPerPage}>Next</Button>
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className={styles.loggedInTabs}>
                    <Button
                        onClick={() => setActiveTab('public')}
                        variant={activeTab === 'public' ? 'primary' : 'secondary'}
                        className={styles.tabButton}
                    >
                        Public Templates
                    </Button>
                    <Button
                        onClick={() => setActiveTab('my')}
                        variant={activeTab === 'my' ? 'primary' : 'secondary'}
                        className={styles.tabButton}
                    >
                        My Templates
                    </Button>
                    <Button
                        onClick={() => setActiveTab('saved')}
                        variant={activeTab === 'saved' ? 'primary' : 'secondary'}
                        className={styles.tabButton}
                    >
                        Saved Templates
                    </Button>
                    <Link href="/" passHref legacyBehavior>
                        <Button as="a" variant="accent" className={styles.createTemplateButton}>
                            Create New Template
                        </Button>
                    </Link>
                    <Button onClick={logout} variant="danger" className={styles.tabButton}>
                        Logout
                    </Button>
                </div>
            )}

            {isLoggedIn && (
                <div className={styles.templateDisplayArea}>
                    {activeTab === 'public' && (
                        <section className={styles.templateSection}>
                            <h2 className={styles.sectionTitle}>Public Templates</h2>
                            <div className={styles.filterSection}>
                                <Input label="Search" type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }} placeholder="Search by name or description..." labelPosition="top" className={styles.searchInput} />
                                <div className={styles.tagFilters}>
                                    <h3 className={styles.filterTitle}>Filter by Tags:</h3>
                                    <div className={styles.tagCheckboxes}>{PREDEFINED_TAGS.map(tag => (<Checkbox key={tag} label={tag} checked={selectedTags.includes(tag)} onChange={(e) => { const isChecked = e.target.checked; setSelectedTags(prev => isChecked ? [...prev, tag] : prev.filter(t => t !== tag)); setCurrentPage(0); }} labelPosition="inline" />))}</div>
                                </div>
                                <div className={styles.sortOptions}>
                                    <h3 className={styles.filterTitle}>Sort By:</h3>
                                    <select className={styles.sortSelect} value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}><option value="created_at">Date Created</option><option value="likes_count">Likes</option></select>
                                    <select className={styles.sortSelect} value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(0); }}><option value="desc">Descending</option><option value="asc">Ascending</option></select>
                                </div>
                            </div>
                            <TemplateListGrid 
                                templates={publicTemplates} 
                                isLoading={isLoadingTemplates} 
                                emptyMessage={searchQuery || selectedTags.length > 0 ? "No templates match your search." : "No public templates found yet."} 
                                loadingMessage="Loading public templates..." 
                                authContext={{ user, isLoggedIn }} 
                                onUse={handleUseTemplate} 
                                onEdit={handleEditTemplate}
                                onDelete={handleDeleteTemplate} 
                                onLike={handleLikeTemplate} 
                                onFavorite={handleFavoriteTemplate} 
                            />
                            <div className={styles.pagination}>
                                <Button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 0}>Previous</Button>
                                <Button onClick={() => setCurrentPage(prev => prev + 1)} disabled={publicTemplates.length < templatesPerPage}>Next</Button>
                            </div>
                        </section>
                    )}

                    {activeTab === 'my' && (
                        <section className={styles.templateSection}>
                            <h2 className={styles.sectionTitle}>My Created Templates</h2>
                            <TemplateListGrid
                                templates={myTemplates}
                                isLoading={isLoadingTemplates}
                                emptyMessage="You haven't created any templates yet."
                                loadingMessage="Loading your templates..."
                                authContext={{ user, isLoggedIn }}
                                onUse={handleUseTemplate}
                                onEdit={handleEditTemplate}
                                onDelete={handleDeleteTemplate}
                                onLike={handleLikeTemplate}
                                onFavorite={handleFavoriteTemplate} 
                            />
                        </section>
                    )}

                    {activeTab === 'saved' && (
                        <section className={styles.templateSection}>
                            <h2 className={styles.sectionTitle}>My Saved/Favorited Templates</h2>
                            <TemplateListGrid
                                templates={savedTemplates}
                                isLoading={isLoadingTemplates}
                                emptyMessage="You haven't saved any templates yet."
                                loadingMessage="Loading your saved templates..."
                                authContext={{ user, isLoggedIn }}
                                onUse={handleUseTemplate}
                                onEdit={handleEditTemplate}
                                onDelete={handleDeleteTemplate}
                                onLike={handleLikeTemplate}
                                onFavorite={handleFavoriteTemplate} 
                            />
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}