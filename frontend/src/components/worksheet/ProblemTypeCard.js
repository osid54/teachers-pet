'use client';

import React from 'react';

export default function ProblemTypeCard({ topic, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(topic)}
      className={`bg-main-100 rounded-md cursor-pointer transition-all duration-200 text-center flex flex-col border-2 hover:-translate-y-[5px] shadow-sm
                  p-sm sm:p-md h-30 w-30 sm:w-60 sm:h-60 items-center 
                  ${isSelected ? 'border-main-500 shadow-md relative' : 'border-transparent hover:shadow-md'}`}
    >
      <h3 className="text-xs sm:text-h3 font-bold text-main-600 grow-0">{topic.name}</h3>
      <p className="text-main-500 grow text-xxs sm:text-md m-0 mt-xxs sm:mt-xs pt-xxs sm:pt-xs border-t border-main-300">
        {topic.description}
      </p>
      {isSelected && (
        <span className="text-lg text-main-500 absolute bottom-1 right-2 sm:text-h2 sm:bottom-xs sm:right-sm">✔</span>
      )}
    </div>
  );
}