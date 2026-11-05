"use client";

import { Button } from "@/components/ui";
import { Pencil, Plus } from "lucide-react";

export default function ProblemTypeCard({
  topic,
  onQuickAdd,
  onCustomize,
  isSelected,
}) {
  return (
    <article
      data-topic-surface={`catalog:${topic.id}`}
      className={`bg-main-100 rounded-md transition-all duration-200 text-center flex flex-col border-2 shadow-sm
        overflow-hidden min-h-40 w-full min-[769px]:min-h-52
        ${isSelected ? "border-main-500 shadow-md" : "border-transparent hover:shadow-md"}`}
    >
      <div className="grow p-sm min-[769px]:p-md">
        <h3 className="text-xs min-[769px]:text-h3 font-bold text-main-600 m-0">
          {topic.name}
        </h3>
        <p className="text-main-500 text-xxs min-[769px]:text-md m-0 mt-xxs min-[769px]:mt-xs pt-xxs min-[769px]:pt-xs border-t border-main-300">
          {topic.description}
        </p>
      </div>
      <div
        className="mt-auto flex w-full shrink-0"
        role="group"
        aria-label={`${topic.name} actions`}
      >
        <Button
          onClick={() => onQuickAdd(topic)}
          aria-label={`Quick add ${topic.name}`}
          title="Quick add"
          variant="ghost"
          className="flex-1 rounded-none px-sm hover:translate-y-0"
        >
          <Plus aria-hidden="true" size={20} className="mb-sm mt-sm" />
        </Button>
        <Button
          onClick={() => onCustomize(topic)}
          aria-label={`Customize ${topic.name}`}
          title="Customize"
          variant="ghost"
          className="flex-1 rounded-none px-sm hover:translate-y-0"
        >
          <Pencil aria-hidden="true" size={20} className="mb-sm mt-sm" />
        </Button>
      </div>
    </article>
  );
}
