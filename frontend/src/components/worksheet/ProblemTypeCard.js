'use client';

import { Button } from '@/components/ui';

export default function ProblemTypeCard({ topic, onQuickAdd, onCustomize, isSelected }) {
  return (
    <article className={`bg-main-100 rounded-md transition-all duration-200 text-center flex flex-col border-2 shadow-sm
        p-sm min-[769px]:p-md min-h-40 w-full min-[769px]:min-h-52 items-center
        ${isSelected ? 'border-main-500 shadow-md' : 'border-transparent hover:shadow-md'}`}>
      <h3 className="text-xs min-[769px]:text-h3 font-bold text-main-600 m-0">{topic.name}</h3>
      <p className="text-main-500 grow text-xxs min-[769px]:text-md m-0 mt-xxs min-[769px]:mt-xs pt-xxs min-[769px]:pt-xs border-t border-main-300">
        {topic.description}
      </p>
      <div className="flex w-full mt-sm border-t border-main-300 pt-xs" role="group" aria-label={`${topic.name} actions`}>
        <Button onClick={() => onQuickAdd(topic)} aria-label={`Quick add ${topic.name}`}
          title="Quick add" className="flex-1 rounded-r-none px-sm">+</Button>
        <Button onClick={() => onCustomize(topic)} aria-label={`Customize ${topic.name}`}
          title="Customize" variant="secondary" className="flex-1 rounded-l-none px-sm">
          <span aria-hidden="true">✎</span>
        </Button>
      </div>
    </article>
  );
}