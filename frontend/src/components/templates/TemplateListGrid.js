'use client';

import TemplateCard from './TemplateCard';

export default function TemplateListGrid({
    templates,
    emptyMessage,
    loadingMessage,
    isLoading = false,
    authContext,
    onUse,
    onEdit,
    onDelete,
    onLike,
    onFavorite,
    activeTab,
}) {
    const user = authContext ? authContext.user : null;

    if (isLoading && !templates?.length) {
        return <p role="status" className="py-lg text-center text-sm text-main-500">{loadingMessage || "Loading templates..."}</p>;
    }

    if (!templates || templates.length === 0) {
        return <p role="status" className="py-lg text-center text-sm text-main-500">{emptyMessage}</p>;
    }

    return (
        <div className="grid grid-cols-1 gap-md min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3">
            {templates.map(template => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    isOwner={user ? template.user_id === user.id : false}
                    onUse={onUse}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLike={onLike}
                    onFavorite={onFavorite}
                    isLoggedIn={Boolean(authContext?.isLoggedIn)}
                    activeTab={activeTab}
                />
            ))}
        </div>
    );
}