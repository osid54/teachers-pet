'use client';


export default function ProblemTypeCard({ topic, onSelect, isSelected }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(topic);
        }
      }}
      onClick={() => onSelect(topic)}
        className={`bg-main-100 rounded-md cursor-pointer transition-all duration-200 text-center flex flex-col border-2 hover:-translate-y-[5px] shadow-sm
              p-sm min-[769px]:p-md h-30 w-30 min-[769px]:w-60 min-[769px]:h-60 items-center
                  ${isSelected ? 'border-main-500 shadow-md relative' : 'border-transparent hover:shadow-md'}`}
    >
      <h3 className="text-xs min-[769px]:text-h3 font-bold text-main-600 grow-0">{topic.name}</h3>
      <p className="text-main-500 grow text-xxs min-[769px]:text-md m-0 mt-xxs min-[769px]:mt-xs pt-xxs min-[769px]:pt-xs border-t border-main-300">
        {topic.description}
      </p>
      {isSelected && (
        <span className="text-lg text-main-500 absolute bottom-1 right-2 min-[769px]:text-h2 min-[769px]:bottom-xs min-[769px]:right-sm">✔</span>
      )}
    </div>
  );
}