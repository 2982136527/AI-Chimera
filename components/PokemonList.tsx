
import React from 'react';
import { SavedCreature } from '../types';
import { TYPE_COLORS } from '../constants';
import { Trash2, Calendar } from 'lucide-react';

interface PokemonListProps {
  items: SavedCreature[];
  onSelect: (item: SavedCreature) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const PokemonList: React.FC<PokemonListProps> = ({ items, onSelect, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fade-in-up">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <div className="w-16 h-16 border-4 border-slate-300 rounded-full border-t-transparent animate-spin opacity-20"></div>
        </div>
        <h3 className="text-lg font-bold text-slate-500">暂无收藏</h3>
        <p className="text-sm mt-2">去创造你的第一只 AI 幻兽吧！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2 animate-fade-in-up">
      {items.map((item) => {
        const mainType = item.data.types[0];
        const themeColor = TYPE_COLORS[mainType] || '#6366f1';
        const date = new Date(item.timestamp).toLocaleDateString('zh-CN');

        return (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden hover:-translate-y-1"
          >
            {/* Top Color Bar */}
            <div className="h-2 w-full" style={{ backgroundColor: themeColor }}></div>
            
            <div className="p-4 flex items-center gap-4">
               {/* Thumbnail */}
               <div className="relative w-20 h-20 shrink-0">
                  <div className="absolute inset-0 bg-slate-50 rounded-2xl rotate-3 transition-transform group-hover:rotate-6"></div>
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 z-10">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.data.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="text-xs text-slate-300">No Img</div>
                    )}
                  </div>
               </div>

               {/* Info */}
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <h3 className="font-bold text-slate-800 truncate text-lg group-hover:text-blue-600 transition-colors">{item.data.name}</h3>
                     <button 
                        onClick={(e) => onDelete(item.id, e)}
                        className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                        title="删除"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 font-mono truncate">{item.data.englishName}</p>
                  
                  <div className="flex gap-1 flex-wrap">
                    {item.data.types.map(t => (
                      <span 
                        key={t} 
                        className="text-[10px] px-1.5 py-0.5 rounded text-white font-bold shadow-sm"
                        style={{ backgroundColor: TYPE_COLORS[t] || '#999' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
               </div>
            </div>

            {/* Footer Meta */}
            <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-medium">
               <div className="flex items-center gap-1">
                 <Calendar size={10} /> {date}
               </div>
               <div className="font-mono opacity-50">
                 ID: {item.data.id.slice(0, 6)}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PokemonList;
