import React from 'react';
import { COMPANY_DATA } from '../constants';
import { Heart, Star, Users, Zap } from 'lucide-react';

export const ModuleCompany: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-heineken-green">
        <div className="flex justify-center mb-4">
          <Star className="w-12 h-12 text-heineken-red fill-current animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Identidade Heineken</h2>
        <p className="text-center text-gray-600">Nossa cultura e quem somos.</p>
      </div>

      {/* Missão */}
      <div className="bg-heineken-green text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Star className="fill-white" size={20} /> Missão
          </h3>
          <p className="text-xl font-medium italic">"{COMPANY_DATA.mission}"</p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Star size={120} />
        </div>
      </div>

      {/* Propósito */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-heineken-green text-lg mb-3 flex items-center gap-2">
           <Heart className="fill-heineken-green" size={20} /> Propósito
        </h3>
        <p className="text-gray-800 text-lg leading-relaxed">
          {COMPANY_DATA.purpose}
        </p>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-heineken-red">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Heart className="text-heineken-red" /> Valores
          </h3>
          <ul className="space-y-2">
            {COMPANY_DATA.values.map((val, idx) => (
              <li key={idx} className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-heineken-red"></div>
                {val}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-600">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="text-blue-600" /> Comportamentos
          </h3>
          <ul className="space-y-2">
            {COMPANY_DATA.behaviors.map((val, idx) => (
              <li key={idx} className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                {val}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};