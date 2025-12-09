import React from 'react';
import { PILLARS_SCORE } from '../constants';
import { Star, Award } from 'lucide-react';

export const ModuleScoring: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-heineken-green to-heineken-dark text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
             <h2 className="text-3xl font-bold flex items-center gap-2">
              <Award className="w-8 h-8 text-yellow-400" />
              100 Pontos
            </h2>
            <p className="text-green-100 mt-1">Nota máxima que sua loja pode alcançar.</p>
          </div>
          <div className="text-right">
             <span className="text-xs uppercase tracking-wider opacity-75">Fotografia de Sucesso</span>
             <div className="text-2xl font-bold">2025</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PILLARS_SCORE.map((pillar) => (
          <div key={pillar.name} className="bg-white rounded-lg shadow-sm overflow-hidden flex">
            <div className={`${pillar.color} w-2`}></div>
            <div className="p-4 flex-1 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-gray-50 text-gray-600`}>
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{pillar.name}</h3>
                  <p className="text-sm text-gray-500">{pillar.desc}</p>
                </div>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-800">{pillar.points}</span>
                <span className="text-xs text-gray-400 uppercase font-bold">Pontos</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
       <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
           <Star className="text-yellow-500 fill-yellow-500" />
           Planograma Ideal
        </h3>
        <div className="flex flex-col gap-2">
           <p className="text-sm text-gray-600 mb-2">Ordem de exposição na gôndola (Esquerda para Direita):</p>
           
           {/* Grid layout for shelf simulation, preventing overflow */}
           <div className="grid grid-cols-4 gap-1 w-full text-[10px] md:text-sm">
              <div className="bg-amber-900 text-white py-4 px-1 rounded text-center font-bold flex items-center justify-center break-words leading-tight">CRAFT</div>
              <div className="bg-heineken-green text-white py-4 px-1 rounded text-center font-bold flex items-center justify-center break-words leading-tight">PREMIUM</div>
              <div className="bg-red-600 text-white py-4 px-1 rounded text-center font-bold flex items-center justify-center break-words leading-tight">MAINSTREAM</div>
              <div className="bg-blue-500 text-white py-4 px-1 rounded text-center font-bold flex items-center justify-center break-words leading-tight">ECONOMY</div>
           </div>
           
           <p className="text-xs text-gray-400 mt-2 text-center">
             *Na ausência de item, substituir pelo próximo à direita.
           </p>
        </div>
       </div>

    </div>
  );
};