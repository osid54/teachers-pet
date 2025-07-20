'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import Link from 'next/link';

import styles from '@/styles/pages/_templates.module.scss';
import authFormStyles from '@/styles/components/ui/_authForms.module.scss';

export default function TemplatesPage() {
    const { isLoggedIn, isLoading: authLoading, error: authError, login, register, logout } = useAuth(); 
    const [activeTab, setActiveTab] = useState('public');
    const [isMounted, setIsMounted] = useState(false);

    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [inlineAuthError, setInlineAuthError] = useState(null);

    useEffect(() => {
        setIsMounted(true);
        if (!isLoggedIn) {
        }
    }, [isLoggedIn]);

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
                    {!showLoginForm && !showRegisterForm && (
                        <section className={styles.templateSection}>
                            <h2 className={styles.sectionTitle}>Public Templates</h2>
                            <p>Public templates will be displayed here.</p>
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
                        <Button as="a" variant="secondary" className={styles.createTemplateButton}>
                            Create New Template
                        </Button>
                    </Link>
                    <Button
                        onClick={logout}
                        variant="secondary"
                        className={styles.tabButton}
                    >
                        Logout
                    </Button>
                </div>
            )}

            {isLoggedIn && (
                <div className={styles.templateDisplayArea}>
                    {activeTab === 'public' && (
                        <section className={styles.templateSection}>
                            <h2 className={styles.sectionTitle}>All Public Templates</h2>
                            <p>Public templates will be displayed here.</p>
                        </section>
                    )}

                    {activeTab === 'my' && (
                        <section className={styles.templateSection}>
                            <h2 className={styles.sectionTitle}>My Created Templates</h2>
                            <p>Your created templates will be displayed here.</p>
                        </section>
                    )}

                    {activeTab === 'saved' && (
                        <section className={styles.templateSection}>
                            <h2 className={styles.sectionTitle}>My Saved/Favorited Templates</h2>
                            <p>Your saved templates will be displayed here.</p>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}