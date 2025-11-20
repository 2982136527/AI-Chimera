
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CreatureStats } from '../types';

interface StatRadarProps {
  stats: CreatureStats;
}

const StatRadar: React.FC<StatRadarProps> = ({ stats }) => {
  const data = [
    { subject: '生命 (VIT)', A: stats.vitality, fullMark: 150 },
    { subject: '力量 (STR)', A: stats.power, fullMark: 150 },
    { subject: '护甲 (DEF)', A: stats.armor, fullMark: 150 },
    { subject: '敏捷 (AGI)', A: stats.agility, fullMark: 150 },
    { subject: '意志 (RES)', A: stats.spirit, fullMark: 150 },
    { subject: '灵能 (MAG)', A: stats.magic, fullMark: 150 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }} />
          <Radar
            name="能力"
            dataKey="A"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatRadar;
