import React from 'react';

interface CategoryFilterProps {
  categories: Array<{ _id?: string; name: string }>;
  selectedCategory: string;
  onSelectCategory: (catName: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
          selectedCategory === 'all'
            ? 'bg-stone-900 text-white shadow-xs'
            : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900 hover:border-stone-300'
        }`}
      >
        All Articles
      </button>

      {categories.map((cat) => {
        const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
        return (
          <button
            key={cat._id || cat.name}
            type="button"
            onClick={() => onSelectCategory(cat.name)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
