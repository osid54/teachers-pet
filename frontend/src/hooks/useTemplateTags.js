import { useEffect, useSyncExternalStore } from 'react';
import { fetchTemplateTags } from '@/services/worksheetApi';

const listeners = new Set();
const initialState = { tags: [], status: 'idle', error: null };
let state = initialState;
let request = null;

const publish = next => {
    state = next;
    listeners.forEach(listener => listener());
};
const subscribe = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};
const load = (retry = false) => {
    if (request) return request;
    if (!retry && state.status !== 'idle') return Promise.resolve();
    publish({ ...state, status: 'loading', error: null });
    request = Promise.resolve().then(fetchTemplateTags).then(tags => {
        publish({ tags, status: 'ready', error: null });
    }).catch(error => {
        publish({ tags: [], status: 'error', error: error.message || 'Template tags could not be loaded.' });
    }).finally(() => { request = null; });
    return request;
};

export function useTemplateTags() {
    const snapshot = useSyncExternalStore(subscribe, () => state, () => initialState);
    useEffect(() => { load(); }, []);
    return { ...snapshot, retry: () => load(true) };
}