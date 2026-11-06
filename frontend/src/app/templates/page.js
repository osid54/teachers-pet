'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TemplateListGrid from '@/components/templates/TemplateListGrid';
import { ChevronLeft, ChevronRight, LogIn, LogOut, Plus, RotateCw, Trash2 } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import TemplateToolbar from '@/components/templates/TemplateToolbar';
import TemplateAuthDialog from '@/components/templates/TemplateAuthDialog';
import SettingsModal from '@/components/worksheet/SettingsModal';

export default function TemplatesPage() {
    const { user, isLoggedIn, isLoading: authLoading, logout, authApi } = useAuth();
    const library = useTemplates({ api: authApi, userId: user?.id, isLoggedIn, authLoading });
    const [showAuth, setShowAuth] = useState(false);
    const [signInTarget, setSignInTarget] = useState('my');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const navigate = useNavigate();
    const deleting = deleteTarget && library.isPending('delete', deleteTarget.id);

    const handleUseTemplate = (template) => {
        try {
            localStorage.setItem('tempLoadTemplate', JSON.stringify(template.settings_json));
            navigate('/');
        } catch { toast.error('This template could not be opened. Please try again.'); }
    };
    const chooseView = tab => {
        if (tab !== 'public' && !isLoggedIn) {
            setSignInTarget(tab);
            setShowAuth(true);
            return;
        }
        library.setFilters({ tab });
    };
    const runAction = (action, templateId) => {
        const template = library.templates.find(item => item.id === templateId);
        return template ? library[action](template) : Promise.resolve();
    };
    const confirmDelete = async event => {
        event.preventDefault();
        setDeleteError(null);
        const result = await library.remove(deleteTarget);
        if (result.ok) {
            setDeleteTarget(null);
            toast.success('Template deleted.');
        } else setDeleteError(result.error);
    };
    const hasFilters = library.filters.search || library.filters.tags.length;

    return (
        <div className="mx-auto w-full max-w-[1400px]">
            <header className="mb-md flex flex-wrap items-center justify-between gap-md">
                <h1 className="m-0 text-h3 font-semibold text-main-800">Templates</h1>
                <div className="flex flex-wrap items-center gap-sm">
                    <Link to="/" className="inline-flex h-10 items-center gap-xs rounded-sm bg-main-600 px-md text-sm font-medium text-main-100 hover:no-underline">
                        <Plus aria-hidden="true" size={17} /> New worksheet
                    </Link>
                    {isLoggedIn ? <>
                        <span className="text-sm text-main-600">{user?.username}</span>
                        <Button variant="ghost" onClick={() => logout()} aria-label="Sign out" title="Sign out" className="h-10 w-10 p-0! text-main-600!">
                            <LogOut aria-hidden="true" size={18} />
                        </Button>
                    </> : <Button variant="ghost" disabled={authLoading} onClick={() => { setSignInTarget('my'); setShowAuth(true); }} className="h-10 text-sm text-main-600!">
                        <LogIn aria-hidden="true" size={17} /> Sign in
                    </Button>}
                </div>
            </header>
            <div className="mb-md flex w-full max-w-[28rem] overflow-hidden rounded-sm border border-main-300" role="group" aria-label="Template collection">
                {[['public', 'Community'], ['my', 'Mine'], ['saved', 'Saved']].map(([value, label]) => <button key={value} type="button"
                    aria-pressed={library.filters.tab === value} onClick={() => chooseView(value)}
                    className={`min-w-0 flex-1 px-sm py-xs text-sm font-medium focus-visible:outline-2 focus-visible:outline-main-600 ${
                        library.filters.tab === value ? 'bg-main-600 text-main-100' : 'bg-main-100 text-main-600 hover:bg-main-200'}`}>
                    {label}
                </button>)}
            </div>
            <TemplateToolbar search={library.search} onSearchChange={library.setSearch} filters={library.filters} onFiltersChange={library.setFilters} />
            <section aria-label="Template results" className="py-md" aria-busy={library.isLoading}>
                {library.error ? <div role="alert" className="flex flex-wrap items-center justify-between gap-md py-lg text-sm text-main-700">
                    <p className="m-0">{library.error}</p>
                    <Button variant="secondary" onClick={library.refresh}><RotateCw aria-hidden="true" size={16} /> Try again</Button>
                </div> : <>
                {!library.isLoading && library.templates.length > 0 && <p role="status" className="m-0 mb-sm text-sm text-main-500">
                    {library.templates.length} {library.templates.length === 1 ? 'template' : 'templates'} on this page
                </p>}
                <TemplateListGrid
                    templates={library.templates}
                    isLoading={library.isLoading}
                    emptyMessage={hasFilters ? 'No templates match your search.' : library.filters.tab === 'saved' ? 'No saved templates yet.'
                        : library.filters.tab === 'my' ? 'No templates of your own yet.' : 'No community templates yet.'}
                    authContext={{ user, isLoggedIn }}
                    onUse={handleUseTemplate}
                    onEdit={templateId => navigate(`/?templateId=${templateId}`)}
                    onDelete={templateId => { setDeleteError(null); setDeleteTarget(library.templates.find(template => template.id === templateId)); }}
                    onLike={templateId => runAction('like', templateId)}
                    onFavorite={templateId => runAction('favorite', templateId)}
                    activeTab={library.filters.tab}
                />
                {!library.isLoading && !library.templates.length && hasFilters && <div className="text-center">
                    <Button variant="ghost" onClick={() => { library.setSearch(''); library.setFilters({ search: '', tags: [] }); }}>Clear search and filters</Button>
                </div>}
                {(library.templates.length > 0 || library.filters.page > 0) && <nav aria-label="Template pages" className="mt-lg flex items-center justify-center gap-md">
                    <Button variant="ghost" className="text-main-600!" onClick={() => library.setPage(page => page - 1)} disabled={library.filters.page === 0 || library.isLoading}>
                        <ChevronLeft aria-hidden="true" size={16} /> Previous
                    </Button>
                    <span className="text-sm tabular-nums text-main-600">Page {library.filters.page + 1}</span>
                    <Button variant="ghost" className="text-main-600!" onClick={() => library.setPage(page => page + 1)} disabled={!library.hasNext || library.isLoading}>
                        Next <ChevronRight aria-hidden="true" size={16} />
                    </Button>
                </nav>}
                </>}
            </section>
            {showAuth && <TemplateAuthDialog onClose={() => setShowAuth(false)} onSignedIn={() => {
                library.setFilters({ tab: signInTarget });
                setShowAuth(false);
            }} />}
            {deleteTarget && <SettingsModal title="Delete template?" onClose={() => { if (!deleting) setDeleteTarget(null); }} onSubmit={confirmDelete}
                actions={<Button type="submit" variant="danger" isLoading={deleting}><Trash2 aria-hidden="true" size={17} /> Delete template</Button>}>
                <p className="m-0 break-words text-sm text-main-700">Delete "{deleteTarget.name}"? This cannot be undone.</p>
                {deleteError && <p role="alert" className="m-0 text-sm text-main-700">{deleteError}</p>}
            </SettingsModal>}
        </div>
    );
}