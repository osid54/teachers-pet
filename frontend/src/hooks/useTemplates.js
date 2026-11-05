import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '@/lib/apiErrors';

const PAGE_SIZE = 10;

export function useTemplates({ api, userId, isLoggedIn, authLoading }) {
    const [filters, setFilterState] = useState({ tab: 'public', tags: [], sortBy: 'created_at', sortOrder: 'desc', search: '', page: 0 });
    const [search, setSearch] = useState('');
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState({ key: null, items: [], hasNext: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pending, setPending] = useState({});
    const activeMutations = useRef(new Set());
    const alive = useRef(true);
    const identity = isLoggedIn ? `user:${userId}` : 'guest';
    const scope = JSON.stringify([identity, filters]);
    const currentScope = useRef(scope);
    const currentIdentity = useRef(identity);
    currentScope.current = scope;
    currentIdentity.current = identity;

    useEffect(() => {
        alive.current = true;
        return () => { alive.current = false; };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setFilterState(current => current.search === search.trim()
            ? current : { ...current, search: search.trim(), page: 0 }), 250);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            setFilterState(current => current.tab === 'public' ? current : { ...current, tab: 'public', page: 0 });
        }
    }, [authLoading, isLoggedIn]);

    useEffect(() => {
        if (!api || authLoading || (filters.tab !== 'public' && !isLoggedIn)) return;
        const controller = new AbortController();
        const requestScope = scope;
        setLoading(true);
        setError(null);
        const fetchPage = async () => {
            try {
                const path = filters.tab === 'my' ? '/templates/me'
                    : filters.tab === 'saved' ? '/templates/saved' : '/templates/public';
                const response = await api.get(path, {
                    signal: controller.signal,
                    params: { skip: filters.page * PAGE_SIZE, limit: PAGE_SIZE + 1,
                        q: filters.search || undefined, tags: filters.tags.length ? filters.tags : undefined,
                        sort_by: filters.sortBy, sort_order: filters.sortOrder },
                    paramsSerializer: { indexes: null },
                });
                const items = response.data;
                if (controller.signal.aborted || currentScope.current !== requestScope) return;
                if (filters.page > 0 && !items.length) {
                    setFilterState(current => ({ ...current, page: current.page - 1 }));
                    return;
                }
                setResult({ key: requestScope, items: items.slice(0, PAGE_SIZE), hasNext: items.length > PAGE_SIZE });
            } catch (requestError) {
                if (controller.signal.aborted || currentScope.current !== requestScope) return;
                setError(apiErrorMessage(requestError, 'Templates could not be loaded. Please try again.'));
                setResult({ key: requestScope, items: [], hasNext: false });
            } finally {
                if (!controller.signal.aborted && currentScope.current === requestScope) setLoading(false);
            }
        };
        fetchPage();
        return () => controller.abort();
    }, [api, authLoading, isLoggedIn, identity, scope, filters, revision]);

    const refresh = () => {
        setRevision(current => current + 1);
    };
    const setFilters = changes => setFilterState(current => ({ ...current, ...changes, page: 0 }));
    const setPage = page => setFilterState(current => ({ ...current,
        page: Math.max(0, typeof page === 'function' ? page(current.page) : page) }));

    const mutate = async (action, template) => {
        if (!isLoggedIn) return { ok: false, error: 'Sign in to manage templates.' };
        const mutationKey = `${identity}:${action}:${template.id}`;
        if (activeMutations.current.has(mutationKey)) return { ok: false, error: 'This action is already in progress.' };
        activeMutations.current.add(mutationKey);
        setPending(current => ({ ...current, [mutationKey]: true }));
        const startedScope = scope;
        const startedIdentity = identity;
        try {
            const response = action === 'delete' ? await api.delete(`/templates/${template.id}`)
                : await api.post(`/templates/${template.id}/${action}`);
            if (!alive.current || currentIdentity.current !== startedIdentity) return { ok: true };
            if (currentScope.current !== startedScope) {
                refresh();
                return { ok: true };
            }
            if (action === 'delete' || (action === 'favorite' && filters.tab === 'saved')) {
                setResult(current => ({ ...current, items: current.items.filter(item => item.id !== template.id) }));
                setRevision(current => current + 1);
            } else {
                const changes = action === 'like' ? { likes_count: response.data.likes_count, is_liked: !template.is_liked }
                    : { is_favorited: !template.is_favorited };
                setResult(current => ({ ...current, items: current.items.map(item => item.id === template.id ? { ...item, ...changes } : item) }));
            }
            return { ok: true };
        } catch (mutationError) {
            const message = apiErrorMessage(mutationError, 'That change could not be saved. Please try again.');
            if (alive.current && currentIdentity.current === startedIdentity && action !== 'delete') toast.error(message);
            return { ok: false, error: message };
        } finally {
            activeMutations.current.delete(mutationKey);
            if (alive.current) setPending(current => {
                const next = { ...current };
                delete next[mutationKey];
                return next;
            });
        }
    };

    const canFetch = !authLoading && (filters.tab === 'public' || isLoggedIn);
    return { filters, search, setSearch, setFilters, setPage, refresh,
        isPending: (action, id) => Boolean(pending[`${identity}:${action}:${id}`]),
        templates: result.key === scope ? result.items : [],
        hasNext: result.key === scope && result.hasNext,
        isLoading: canFetch && (loading || result.key !== scope), error,
        like: template => mutate('like', template), favorite: template => mutate('favorite', template),
        remove: template => mutate('delete', template) };
}