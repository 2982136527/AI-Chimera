
import React, { useRef, useState, useEffect } from 'react';
import { CreatureData } from '../types';
import StatRadar from './StatRadar';
import TypeBadge from './TypeBadge';
import { TYPE_COLORS } from '../constants';
import { Sparkles, Ruler, Weight, Swords, Zap, Download, Share2, Check, Loader2, ShieldCheck, QrCode, Square, CheckSquare, Dna, Activity, ChevronRight, Crown, Gem, Hexagon, Star, Circle, Atom, Aperture, Plus } from 'lucide-react';

interface PokemonCardProps {
  data: CreatureData;
  imageUrl: string | null;
  onEvolve?: () => void;
  onUltimateEvolve?: () => void;
  onPreview?: (name: string) => void;
  onGeneratePreEvolution?: (name: string) => void;
  availableForms?: string[];
  fullEvolutionChain?: string[]; 
  isBusy?: boolean;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ 
  data, 
  imageUrl, 
  onEvolve, 
  onUltimateEvolve, 
  onPreview,
  onGeneratePreEvolution,
  availableForms = [], 
  fullEvolutionChain = [],
  isBusy 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  
  // Animation states
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [evolutionType, setEvolutionType] = useState<'normal' | 'ultimate'>('normal');

  // Safe check for data integrity to prevent crashes
  const hasValidData = data && data.stats && data.types;
  
  // Determine primary color based on the first type
  const mainType = hasValidData && (data.types || []).length > 0 ? data.types[0] : 'Normal';
  const themeColor = TYPE_COLORS[mainType] || '#6366f1';

  const evolutionChainSafe = data?.evolutionChain || [];
  // Use full evolution chain if available and valid, otherwise fallback to data's chain
  const displayChain = (fullEvolutionChain.length > 0 && fullEvolutionChain.includes(data.name))
      ? fullEvolutionChain 
      : evolutionChainSafe;

  const currentStageIndex = displayChain.indexOf(data.name);
  
  const canStandardEvolve = currentStageIndex !== -1 && currentStageIndex < 2;
  const canUltimateEvolve = currentStageIndex === 2;

  useEffect(() => {
    if (isBusy) {
       // Trigger animation when busy starts
       setIsAnimatingOut(true);
    } else {
       // Reset when busy ends (new card loaded)
       const timer = setTimeout(() => setIsAnimatingOut(false), 300);
       return () => clearTimeout(timer);
    }
  }, [isBusy]);

  const handleEvolveClick = () => {
    if (onEvolve) {
        setEvolutionType('normal');
        setIsAnimatingOut(true);
        setTimeout(() => {
            onEvolve();
        }, 500);
    }
  };

  const handleUltimateClick = () => {
    if (onUltimateEvolve) {
        setEvolutionType('ultimate');
        setIsAnimatingOut(true);
        setTimeout(() => {
            onUltimateEvolve();
        }, 500);
    }
  };

  const handleSaveCard = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      // @ts-ignore
      const html2canvas = window.html2canvas;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `Phantom_${data.name}_${data.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Save failed', err);
      alert('保存图片失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareCard = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      // @ts-ignore
      const html2canvas = window.html2canvas;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) return;
        
        // Try native sharing first
        if (navigator.share) {
            try {
                const file = new File([blob], `Phantom_${data.name}.png`, { type: 'image/png' });
                await navigator.share({
                    title: `查看我的 AI 幻兽：${data.name}`,
                    text: `我在 AI 幻兽工坊发现了一只稀有生物！`,
                    files: [file]
                });
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
                return;
            } catch (e) {
                // Share cancelled or failed, fallthrough to clipboard
            }
        }

        // Fallback to clipboard
        try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
        } catch (err) {
            alert('无法分享，请尝试保存图片');
        }
      });
    } catch (err) {
      console.error('Share failed', err);
    } finally {
      setIsSharing(false);
    }
  };

  const getRarity = (stats: any) => {
     if (!stats) return { label: 'UNKNOWN', color: '#999', icon: Circle };
     const total = (stats.vitality || 0) + (stats.power || 0) + (stats.armor || 0) + (stats.magic || 0) + (stats.spirit || 0) + (stats.agility || 0);
     if (total > 700) return { label: 'MYTHICAL', color: '#ef4444', icon: Crown }; // Red
     if (total > 600) return { label: 'LEGENDARY', color: '#eab308', icon: Crown }; // Yellow
     if (total > 500) return { label: 'EPIC', color: '#a855f7', icon: Hexagon }; // Purple
     if (total > 400) return { label: 'RARE', color: '#3b82f6', icon: Gem }; // Blue
     if (total > 300) return { label: 'UNCOMMON', color: '#22c55e', icon: Star }; // Green
     return { label: 'COMMON', color: '#64748b', icon: Circle }; // Gray
  };

  const rarity = getRarity(data?.stats);
  const RarityIcon = rarity.icon;

  // Determine total stats for display, safe access
  const totalStats = hasValidData ? (
    (data.stats.vitality || 0) + 
    (data.stats.power || 0) + 
    (data.stats.armor || 0) + 
    (data.stats.magic || 0) + 
    (data.stats.spirit || 0) + 
    (data.stats.agility || 0)
  ) : 0;

  // If data is missing, show loading placeholder
  if (!hasValidData) {
      return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[600px]">
            <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">读取幻兽数据中...</p>
        </div>
      );
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative perspective-1000">
      
      {/* Action Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 animate-fade-in-up px-2">
        {/* Watermark Toggle */}
        <div 
           onClick={() => setShowWatermark(!showWatermark)}
           className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors select-none group"
        >
            {showWatermark ? (
                <CheckSquare size={18} className="text-indigo-600" />
            ) : (
                <Square size={18} className="text-slate-300 group-hover:text-slate-400" />
            )}
            <span className={`text-sm font-medium ${showWatermark ? 'text-slate-700' : 'text-slate-400'}`}>
                水印验证
            </span>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
            {/* Evolve Buttons */}
            <div className="flex gap-2">
                {canStandardEvolve && (
                    <button
                        onClick={handleEvolveClick}
                        disabled={isBusy || isAnimatingOut}
                        className="flex items-center gap-2 px-4 md:px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all text-xs md:text-sm"
                    >
                        {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Dna size={16} />}
                        <span>幻化升阶</span>
                    </button>
                )}
                {canUltimateEvolve && (
                    <button
                        onClick={handleUltimateClick}
                        disabled={isBusy || isAnimatingOut}
                        className="flex items-center gap-2 px-4 md:px-5 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all ring-2 ring-amber-200 ring-offset-2 text-xs md:text-sm"
                    >
                        {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
                        <span>终焉觉醒</span>
                    </button>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleSaveCard}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md text-xs md:text-sm"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span>保存</span>
                </button>
                <button
                    onClick={handleShareCard}
                    disabled={isSharing}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md text-xs md:text-sm"
                >
                    {isSharing ? <Loader2 size={16} className="animate-spin" /> : shareSuccess ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
                    <span>{shareSuccess ? '已复制' : '分享'}</span>
                </button>
            </div>
        </div>
      </div>

      {/* Main Card Container */}
      <div 
        className={`transition-all duration-500 ease-out transform ${isAnimatingOut ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100 blur-0'}`}
      >
        <div 
            ref={cardRef}
            // Responsive: Vertical flex on mobile, Horizontal (Row) on MD+ screens.
            // Removed fixed aspect ratio (aspect-[1.6/1]) to prevent cutting off content on desktop.
            // Added min-h-[600px] for desktop to ensure a substantial size but allow growth.
            className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-white print:shadow-none group w-full flex flex-col md:flex-row md:min-h-[600px] h-auto"
        >
            {/* Holographic & Dynamic Background Layer */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none z-0"
                style={{ 
                    backgroundColor: themeColor,
                    backgroundImage: `radial-gradient(circle at 50% 50%, ${themeColor} 0%, transparent 70%)` 
                }}
            ></div>
            
            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            <div className="relative z-10 w-full h-full flex flex-col md:flex-row flex-1">
                
                {/* Left: Visual Art Area (Mobile: Top, Desktop: Left 45%) */}
                <div className="relative w-full md:w-[45%] h-[340px] md:h-auto flex-shrink-0 flex flex-col justify-between p-4 md:p-6 overflow-hidden">
                    {/* Dynamic Background for Art */}
                    <div 
                        className="absolute inset-0 z-0 opacity-20"
                        style={{ 
                            background: `linear-gradient(135deg, ${themeColor} 0%, #ffffff 100%)` 
                        }}
                    ></div>

                    {/* Rarity Badge */}
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-slate-100">
                        <RarityIcon size={14} color={rarity.color} fill={rarity.color} />
                        <span className="text-[10px] font-black tracking-wider" style={{ color: rarity.color }}>
                            {rarity.label}
                        </span>
                    </div>

                    {/* The Creature Image - Blend Mode Multiply to remove white bg */}
                    <div className="relative flex-1 flex items-center justify-center z-10 mt-2 md:-mt-4">
                        {/* Halo Effect behind image */}
                        <div 
                             className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl opacity-40 animate-pulse-slow"
                             style={{ backgroundColor: themeColor }}
                        ></div>
                        
                        {imageUrl ? (
                            <img 
                                src={imageUrl} 
                                alt={data.name} 
                                className="w-[85%] md:w-[110%] h-[85%] md:h-[110%] object-contain mix-blend-multiply filter contrast-125 brightness-105 drop-shadow-2xl rounded-[2rem]"
                            />
                        ) : (
                           <div className="flex flex-col items-center justify-center text-slate-300">
                               <Sparkles size={48} className="mb-2" />
                               <span className="text-sm font-bold">Awaiting Visuals</span>
                           </div>
                        )}
                    </div>

                    {/* Name & Core Identity */}
                    <div className="relative z-20 px-2 md:px-6 pb-2 md:pb-8">
                        <h1 
                            className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-1 md:mb-2 leading-none"
                            style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}
                        >
                            {data.name}
                        </h1>
                        <div className="flex items-center gap-2 mb-2 md:mb-3 opacity-80">
                           <span className="text-xs md:text-sm font-bold text-slate-600 font-mono uppercase tracking-widest">{data.englishName}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(data.types || []).map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                    </div>
                </div>

                {/* Right: Battle Data Area (Mobile: Bottom, Desktop: Right 55%) */}
                <div className="relative w-full md:w-[55%] bg-white/80 backdrop-blur-sm flex flex-col p-6 md:p-8">
                     
                     {/* Header: Species & Measurements */}
                     <div className="flex justify-between items-start mb-4 md:mb-6 border-b border-slate-100 pb-4">
                         <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">生物分类</p>
                             <p className="font-bold text-slate-700 text-sm md:text-base">{data.species}</p>
                         </div>
                         <div className="flex gap-4">
                             <div className="flex flex-col items-end">
                                 <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase"><Ruler size={10}/> Height</div>
                                 <p className="font-mono font-bold text-slate-600 text-sm md:text-base">{data.height}</p>
                             </div>
                             <div className="flex flex-col items-end">
                                 <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase"><Weight size={10}/> Weight</div>
                                 <p className="font-mono font-bold text-slate-600 text-sm md:text-base">{data.weight}</p>
                             </div>
                         </div>
                     </div>

                     {/* Stats Radar & Lore */}
                     <div className="flex flex-col sm:flex-row gap-4 mb-6">
                         <div className="w-full sm:w-1/2 relative h-40 sm:h-auto">
                             <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 rounded z-10">TOTAL {totalStats}</div>
                             <StatRadar stats={data.stats} />
                         </div>
                         <div className="w-full sm:w-1/2 flex flex-col justify-center">
                             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 h-full">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">档案记录</p>
                                 <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-4 sm:line-clamp-6 italic">
                                     "{data.archiveLog}"
                                 </p>
                             </div>
                         </div>
                     </div>

                     {/* Abilities & Moves Grid */}
                     <div className="flex-1 flex flex-col gap-2 overflow-hidden mb-12 md:mb-8">
                         {/* Passive Trait */}
                         <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                             <div className="mt-1 p-1 bg-slate-200 rounded text-slate-500"><Atom size={12} /></div>
                             <div>
                                 <div className="text-xs font-black text-slate-700 uppercase">特质: {data.trait?.name || '未知'}</div>
                                 <div className="text-[10px] text-slate-500 leading-tight">{data.trait?.description || '尚无详细特质记录'}</div>
                             </div>
                         </div>

                         {/* Active Moves */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                             {(data.skills || []).slice(0, 4).map((move, idx) => (
                                 <div key={idx} className="border border-slate-100 rounded-lg p-2 hover:border-indigo-200 transition-colors">
                                     {typeof move === 'object' ? (
                                         <>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-xs text-slate-800 truncate">{move.name}</span>
                                                {move.type && (
                                                    <span 
                                                        className="text-[8px] px-1 rounded text-white font-bold scale-90 origin-right flex-shrink-0"
                                                        style={{ backgroundColor: TYPE_COLORS[move.type] || '#999' }}
                                                    >
                                                        {move.type}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-slate-400 leading-tight line-clamp-1">{move.description}</p>
                                         </>
                                     ) : (
                                         <span className="font-bold text-xs text-slate-800">{move}</span>
                                     )}
                                 </div>
                             ))}
                         </div>
                     </div>

                     {/* Evolution Chain Footer */}
                     <div className="mt-auto pt-3 border-t border-slate-100 pb-8 md:pb-4">
                         <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">幻化谱系</span>
                             <div className="flex-1 h-px bg-slate-100"></div>
                         </div>
                         <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                             {displayChain.map((name, idx) => {
                                 const isCurrent = name === data.name;
                                 const isAvailable = availableForms.includes(name);
                                 const isPreEvolution = idx < currentStageIndex;
                                 const isMissingPreEvo = isPreEvolution && !isAvailable;

                                 return (
                                     <React.Fragment key={name}>
                                         {idx > 0 && <ChevronRight size={12} className="text-slate-300 shrink-0" />}
                                         <button
                                             onClick={() => {
                                                 if (isAvailable && onPreview) onPreview(name);
                                                 if (isMissingPreEvo && onGeneratePreEvolution) onGeneratePreEvolution(name);
                                             }}
                                             disabled={(!isAvailable && !isMissingPreEvo) || isBusy}
                                             className={`
                                                 flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all
                                                 ${isCurrent 
                                                     ? 'bg-slate-800 text-white shadow-md scale-105' 
                                                     : isAvailable
                                                         ? 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 shadow-sm'
                                                         : isMissingPreEvo
                                                             ? 'bg-slate-50 border border-dashed border-slate-300 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 hover:border-indigo-300 cursor-pointer'
                                                             : 'bg-slate-50 text-slate-300 cursor-default'
                                                 }
                                             `}
                                             title={isMissingPreEvo ? "点击发现这个形态" : name}
                                         >
                                             {isMissingPreEvo ? (
                                                 <span className="flex items-center gap-1"><Sparkles size={8}/> {name}</span>
                                             ) : name}
                                         </button>
                                     </React.Fragment>
                                 );
                             })}
                         </div>
                     </div>
                </div>
            </div>

            {/* Blockchain Watermark Footer */}
            {showWatermark && (
                <div className="absolute bottom-0 left-0 right-0 h-8 md:h-10 bg-slate-900 z-30 flex justify-between items-center px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span className="text-[8px] md:text-[10px] font-mono text-slate-400 tracking-wider hidden sm:inline">
                            SECURE HASH
                        </span>
                    </div>
                    <div className="font-mono text-[6px] md:text-[8px] text-slate-600 break-all w-1/2 text-right leading-tight opacity-50">
                        {data.id}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                         <QrCode size={12} className="text-white opacity-20" />
                         <span className="text-[8px] md:text-[10px] font-bold text-white tracking-widest">PHANTOM</span>
                    </div>
                </div>
            )}
        </div>

        {/* Animation Overlay (Ascension / Awakening) */}
        {(isBusy || isAnimatingOut) && (
             <div className="absolute inset-0 z-50 rounded-[2.5rem] overflow-hidden pointer-events-none">
                 {/* Overlay Backdrop */}
                 <div className={`absolute inset-0 transition-opacity duration-1000 ${isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}
                      style={{ backgroundColor: evolutionType === 'ultimate' ? '#000' : '#fff' }}
                 ></div>

                 {/* Ascension (Normal) Animation */}
                 {evolutionType === 'normal' && (
                     <div className="absolute inset-0 flex items-center justify-center">
                         {/* DNA Spirals */}
                         <div className="absolute w-[150%] h-[150%] border-[2px] border-indigo-500/20 rounded-full animate-spin-slow"></div>
                         <div className="absolute w-[120%] h-[120%] border-[2px] border-purple-500/20 rounded-full animate-spin-reverse"></div>
                         
                         {/* Rising Particles */}
                         <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent"></div>

                         <div className="relative z-10 flex flex-col items-center">
                             <div className="w-24 h-24 bg-indigo-500 rounded-full animate-ping-slow opacity-20 absolute"></div>
                             <Dna size={64} className="text-indigo-600 animate-spin-slow mb-4 drop-shadow-lg" />
                             <h2 className="text-2xl font-black text-indigo-800 tracking-[0.5em] uppercase animate-pulse">幻化升阶</h2>
                             <p className="text-xs text-indigo-400 font-mono mt-2">REWRITING GENETIC CODE...</p>
                         </div>
                     </div>
                 )}

                 {/* Awakening (Ultimate) Animation */}
                 {evolutionType === 'ultimate' && (
                     <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                         {/* Bursting Light Background */}
                         <div 
                            className="absolute inset-0 animate-spin-slow opacity-50"
                            style={{
                                background: 'conic-gradient(from 0deg, #7f1d1d, #b45309, #fbbf24, #b45309, #7f1d1d)'
                            }}
                         ></div>
                         
                         {/* Shockwaves */}
                         <div className="absolute w-full h-full border-[20px] border-amber-500/30 rounded-full animate-ping-slow"></div>
                         
                         <div className="relative z-10 flex flex-col items-center text-center">
                             <div className="w-32 h-32 bg-amber-500 rounded-full animate-pulse absolute blur-3xl opacity-40"></div>
                             <Crown size={80} className="text-amber-300 animate-shake mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                             <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500 tracking-[0.2em] uppercase animate-bounce drop-shadow-lg">
                                 终焉觉醒
                             </h2>
                             <p className="text-sm text-amber-200/80 font-mono mt-4 tracking-widest animate-pulse">LIMITER REMOVED // POWER OVERFLOW</p>
                         </div>
                     </div>
                 )}
             </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
