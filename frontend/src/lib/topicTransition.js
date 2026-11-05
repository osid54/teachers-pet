import { flushSync } from 'react-dom';

const transitionName = 'worksheet-topic';
let pendingTransition = null;

export function topicSurface(id) {
    return Array.from(document.querySelectorAll('[data-topic-surface]'))
        .find(element => element.dataset.topicSurface === id);
}

export function transitionTopic(source, update, destination) {
    pendingTransition?.applyUpdate();
    pendingTransition?.transition.skipTransition();
    pendingTransition?.cleanup();

    const sourceElement = typeof source === 'function' ? source() : source;
    if (!document.startViewTransition || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !sourceElement?.isConnected) {
        flushSync(update);
        destination()?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
        return null;
    }

    let updated = false;
    let cancelled = false;
    let target;
    let oldTargetName;
    const oldSourceName = sourceElement.style.viewTransitionName;
    const applyUpdate = () => {
        if (updated) return;
        updated = true;
        flushSync(update);
    };
    const record = { applyUpdate, transition: null, cleanup: null };
    const cleanup = () => {
        if (cancelled) return;
        cancelled = true;
        sourceElement.style.viewTransitionName = oldSourceName;
        if (target) target.style.viewTransitionName = oldTargetName;
        if (pendingTransition === record) {
            document.documentElement.classList.remove('topic-transition-active');
            pendingTransition = null;
        }
    };
    record.cleanup = cleanup;
    document.documentElement.classList.add('topic-transition-active');
    sourceElement.style.viewTransitionName = transitionName;
    pendingTransition = record;

    try {
        record.transition = document.startViewTransition(() => {
            if (cancelled) return;
            sourceElement.style.viewTransitionName = oldSourceName;
            applyUpdate();
            target = destination();
            if (!target?.isConnected) {
                target = null;
                record.transition?.skipTransition();
                return;
            }
            target.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
            oldTargetName = target.style.viewTransitionName;
            target.style.viewTransitionName = transitionName;
        });
        record.transition.ready.catch(() => {});
        record.transition.finished.catch(() => {}).finally(cleanup);
        return record.transition;
    } catch {
        cleanup();
        applyUpdate();
        return null;
    }
}