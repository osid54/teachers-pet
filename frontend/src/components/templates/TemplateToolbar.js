import { useState } from 'react';
import { ArrowDown, ArrowUp, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui';
import TemplateTagSelector from './TemplateTagSelector';

export default function TemplateToolbar({ search, onSearchChange, filters, onFiltersChange }) {
    const [showFilters, setShowFilters] = useState(false);
    return (
        <div className="min-w-0 border-y border-main-300 py-md">
            <div className="flex flex-wrap items-center gap-sm">
                <label className="relative min-w-0 flex-1 basis-52">
                    <span className="sr-only">Search</span>
                    <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-main-500" />
                    <input type="search" value={search} onChange={event => onSearchChange(event.target.value)}
                        placeholder="Search templates" className="h-10 w-full min-w-0 rounded-sm border border-main-300 bg-main-100 py-xs pl-9 pr-sm text-sm text-main-700 focus-visible:outline-2 focus-visible:outline-main-600" />
                </label>
                <label className="min-w-0">
                    <span className="sr-only">Sort templates by</span>
                    <select value={filters.sortBy} onChange={event => onFiltersChange({ sortBy: event.target.value })}
                        className="h-10 max-w-full rounded-sm border border-main-300 bg-main-100 px-sm text-sm text-main-700">
                        <option value="created_at">Date created</option><option value="likes_count">Likes</option>
                    </select>
                </label>
                <Button variant="ghost" title={filters.sortOrder === 'desc' ? 'Descending order' : 'Ascending order'}
                    aria-label={filters.sortOrder === 'desc' ? 'Sort ascending' : 'Sort descending'}
                    onClick={() => onFiltersChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                    className="h-10 w-10 shrink-0 rounded-sm p-0! text-main-600! hover:translate-y-0">
                    {filters.sortOrder === 'desc' ? <ArrowDown aria-hidden="true" size={18} /> : <ArrowUp aria-hidden="true" size={18} />}
                </Button>
                <Button variant="ghost" aria-expanded={showFilters} aria-controls="template-tag-filters" onClick={() => setShowFilters(open => !open)} className="h-10 text-sm text-main-600!">
                    <SlidersHorizontal aria-hidden="true" size={16} /> Filters{filters.tags.length ? ` (${filters.tags.length})` : ''}
                </Button>
                {filters.tags.length > 0 && <Button variant="ghost" onClick={() => onFiltersChange({ tags: [] })} title="Clear filters" aria-label="Clear tag filters" className="h-10 w-10 p-0! text-main-600!">
                    <X aria-hidden="true" size={16} />
                </Button>}
            </div>
            {showFilters && <div id="template-tag-filters" className="mt-md min-w-0">
                <TemplateTagSelector value={filters.tags} onChange={tags => onFiltersChange({ tags })} />
            </div>}
        </div>
    );
}