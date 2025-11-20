
export const TYPE_COLORS: Record<string, string> = {
  // Classical Elements
  '无': '#A8A77A', '一般': '#A8A77A', 'Normal': '#A8A77A',
  '炎': '#EE8130', '火': '#EE8130', 'Fire': '#EE8130', 'Pyro': '#EE8130',
  '潮': '#6390F0', '水': '#6390F0', 'Water': '#6390F0', 'Hydro': '#6390F0',
  '森': '#7AC74C', '草': '#7AC74C', 'Nature': '#7AC74C', 'Dendro': '#7AC74C',
  '雷': '#F7D02C', '电': '#F7D02C', 'Electric': '#F7D02C', 'Electro': '#F7D02C',
  '霜': '#96D9D6', '冰': '#96D9D6', 'Ice': '#96D9D6', 'Cryo': '#96D9D6',
  '武': '#C22E28', '格斗': '#C22E28', 'Martial': '#C22E28', 'Fighting': '#C22E28',
  '毒': '#A33EA1', 'Toxin': '#A33EA1', 'Poison': '#A33EA1',
  '地': '#E2BF65', '地面': '#E2BF65', 'Earth': '#E2BF65', 'Geo': '#E2BF65',
  '风': '#A98FF3', '飞行': '#A98FF3', 'Air': '#A98FF3', 'Anemo': '#A98FF3',
  '念': '#F95587', '超能力': '#F95587', 'Mind': '#F95587', 'Psychic': '#F95587',
  '虫': '#A6B91A', 'Insect': '#A6B91A', 'Bug': '#A6B91A',
  '岩': '#B6A136', '岩石': '#B6A136', 'Stone': '#B6A136', 'Rock': '#B6A136',
  '灵': '#735797', '幽灵': '#735797', 'Spirit': '#735797', 'Ghost': '#735797',
  '龙': '#6F35FC', 'Dragon': '#6F35FC', 'Draco': '#6F35FC',
  '暗': '#705746', '恶': '#705746', 'Dark': '#705746', 'Shadow': '#705746',
  '钢': '#B7B7CE', 'Steel': '#B7B7CE', 'Metal': '#B7B7CE',
  '光': '#D685AD', '妖精': '#D685AD', 'Light': '#D685AD', 'Fairy': '#D685AD',
};

export const DEFAULT_PLACEHOLDER_IMG = "https://picsum.photos/400/400";

// Renamed styles to remove specific IP artist names
export const ART_STYLES = [
  { id: 'fantasy_concept', label: '幻想概念风', prompt: 'High quality fantasy concept art, watercolor and ink, detailed creature design, RPG artbook style, clean lines, soft shading' },
  { id: '3d_render', label: '3D 渲染', prompt: '3D render, blender, unreal engine 5, c4d, clay material, cute, glossy, studio lighting, 4k' },
  { id: 'pixel_retro', label: '复古像素', prompt: '16-bit pixel art, retro game sprite, GBA style, detailed dithering, vibrant colors' },
  { id: 'cyber_mecha', label: '赛博机甲', prompt: 'Mecha style, robotic parts, metallic texture, glowing neon lights, futuristic, sci-fi, intricate mechanical details' },
  { id: 'ink_wash', label: '水墨绘卷', prompt: 'Traditional ink wash painting, sumi-e style, bold brush strokes, artistic, ancient scroll style' },
  { id: 'realistic', label: '国家地理', prompt: 'Hyper realistic, national geographic photography, detailed texture, cinematic lighting, 8k resolution' },
  { id: 'blueprint', label: '工程蓝图', prompt: 'Technical blueprint, schematic drawing, white lines on blue background, detailed annotations, scientific' },
];