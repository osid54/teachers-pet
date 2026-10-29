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

    if (isLoading) {
        return <p className="text-center py-xxl text-lg text-main-500">{loadingMessage || "Loading templates..."}</p>;
    }

    if (!templates || templates.length === 0) {
        return <p className="text-center py-xxl text-lg text-main-500">{emptyMessage}</p>;
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-xl p-xs min-[769px]:p-md">
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
                    isLoggedIn={user != null}
                    activeTab={activeTab}
                />
            ))}
        </div>
    );
}