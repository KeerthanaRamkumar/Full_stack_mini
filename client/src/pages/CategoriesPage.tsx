import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import { Layers, ArrowRight } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesAPI.getCategories().then((res) => {
      if (res.success) setCategories(res.categories || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-mono mb-1">
          <Layers className="w-3.5 h-3.5 text-stone-700" />
          <span>Taxonomy Index</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Curated Topics & Disciplines
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Explore monographs organized by core intellectual domains and technical paradigms.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <p className="font-serif italic text-stone-500">Loading topic catalogue...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id || cat.name}
              to={`/blogs?category=${encodeURIComponent(cat.name)}`}
              className="group p-6 bg-white border border-stone-200/90 rounded-2xl hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-stone-700">
                    {cat.name}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {cat.description || `Essays, tutorials, and critical thoughts on ${cat.name}.`}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span>Domain</span>
                <span className="text-stone-800 font-semibold group-hover:underline">Browse Articles →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
