import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { SOVI_CRAFT_DATA, SOVI_PREMIUM_DATA, SOVI_MAINSTREAM_DATA, BRAND_TARGETS } from '../constants';
import { TrendingUp } from 'lucide-react';

const ChartCard = ({ title, data }: { title: string, data: any[] }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center">
    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="text-center mt-[-10px]">
      <span className="text-2xl font-bold text-heineken-green">{data[0].value}%</span>
      <p className="text-xs text-gray-500">Meta HEINEKEN</p>
    </div>
  </div>
);

export const ModuleSovi: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-heineken-green">
        <h2 className="text-2xl font-bold text-heineken-green flex items-center gap-2">
          <TrendingUp className="w-8 h-8" />
          Metas de SOVI 2025
        </h2>
        <p className="text-gray-600 mt-2">Memorize estes números! Eles serão perguntados na auditoria.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="Segmento CRAFT" data={SOVI_CRAFT_DATA} />
        <ChartCard title="Segmento PREMIUM" data={SOVI_PREMIUM_DATA} />
        <ChartCard title="Segmento MAINSTREAM" data={SOVI_MAINSTREAM_DATA} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Metas por Marca (Destaques)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BRAND_TARGETS.map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-sm text-gray-500">{item.brand}</span>
              <span className="block text-lg font-bold text-heineken-green">{item.target}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
           <strong>Importante:</strong> Lojas não pontuam por SOVI de marcas DCC, mas as metas são informativas.
        </div>
      </div>
    </div>
  );
};