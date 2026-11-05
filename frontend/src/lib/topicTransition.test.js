import { afterEach, describe, expect, it, vi } from 'vitest';
import { topicSurface, transitionTopic } from './topicTransition';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.replaceChildren();
    document.documentElement.classList.remove('topic-transition-active');
    delete document.startViewTransition;
});

const surface = id => {
    const element = document.createElement('article');
    element.dataset.topicSurface = id;
    document.body.append(element);
    return element;
};

describe('topic shared-element transitions', () => {
    it('updates immediately when view transitions are unavailable', () => {
        const source = surface('catalog:addition');
        const update = vi.fn();
        expect(transitionTopic(source, update, () => null)).toBeNull();
        expect(update).toHaveBeenCalledOnce();
        expect(source.style.viewTransitionName).toBeFalsy();
    });

    it('respects reduced motion without calling the browser animation API', () => {
        vi.stubGlobal('matchMedia', () => ({ matches: true }));
        document.startViewTransition = vi.fn();
        const update = vi.fn();
        const destination = surface('item:new-instance');
        destination.scrollIntoView = vi.fn();
        transitionTopic(surface('catalog:addition'), update, () => destination);
        expect(update).toHaveBeenCalledOnce();
        expect(document.startViewTransition).not.toHaveBeenCalled();
        expect(destination.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });

    it('maps one source to the destination and clears names after completion', async () => {
        const source = surface('catalog:addition');
        const target = surface('item:new-instance');
        let captureUpdate;
        let finish;
        const finished = new Promise(resolve => { finish = resolve; });
        document.startViewTransition = vi.fn(callback => {
            captureUpdate = callback;
            return { ready: Promise.resolve(), finished, skipTransition: vi.fn() };
        });
        const update = vi.fn();
        transitionTopic(source, update, () => topicSurface('item:new-instance'));
        expect(source.style.viewTransitionName).toBe('worksheet-topic');
        captureUpdate();
        expect(update).toHaveBeenCalledOnce();
        expect(source.style.viewTransitionName).toBeFalsy();
        expect(target.style.viewTransitionName).toBe('worksheet-topic');
        finish();
        await finished;
        await Promise.resolve();
        await Promise.resolve();
        expect(target.style.viewTransitionName).toBeFalsy();
        expect(document.documentElement.classList.contains('topic-transition-active')).toBe(false);
    });

    it('still applies the update if the browser animation fails to start', () => {
        document.startViewTransition = () => { throw new Error('Unsupported capture'); };
        const update = vi.fn();
        transitionTopic(surface('catalog:addition'), update, () => null);
        expect(update).toHaveBeenCalledOnce();
        expect(document.documentElement.classList.contains('topic-transition-active')).toBe(false);
    });

    it('can interrupt a morph without old cleanup removing the new destination name', async () => {
        const card = surface('catalog:addition');
        const modal = surface('topic-modal');
        const item = surface('item:new-instance');
        const captures = [];
        document.startViewTransition = callback => {
            let finish;
            const finished = new Promise(resolve => { finish = resolve; });
            const transition = { ready: Promise.resolve(), finished, skipTransition: vi.fn() };
            captures.push({ callback, finish, transition });
            return transition;
        };
        const firstUpdate = vi.fn();
        const secondUpdate = vi.fn();
        transitionTopic(card, firstUpdate, () => modal);
        captures[0].callback();
        transitionTopic(modal, secondUpdate, () => item);
        captures[1].callback();
        expect(captures[0].transition.skipTransition).toHaveBeenCalledOnce();
        captures[0].finish();
        await captures[0].transition.finished;
        await Promise.resolve();
        await Promise.resolve();
        expect(item.style.viewTransitionName).toBe('worksheet-topic');
        captures[1].finish();
        await captures[1].transition.finished;
        await Promise.resolve();
        await Promise.resolve();
        expect(firstUpdate).toHaveBeenCalledOnce();
        expect(secondUpdate).toHaveBeenCalledOnce();
        expect(item.style.viewTransitionName).toBeFalsy();
    });
});