import React, { useState } from 'react';
import { ROUTINE_STEPS, VISIT_SCRIPT_STEPS } from '../constants';
import { Footprints, Clock, Calendar, Presentation, ChevronRight } from 'lucide-react';

export const ModuleVisit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routine' | 'script'>('script');

  return (
    <div className="space-y-6 pb-20">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-200 rounded-lg">
        <button 
          onClick={() => setActiveTab('script')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'script' ? 'bg-white shadow text-heineken-green' : 'text-gray-500'}`}
        >
          Roteiro de Visita (Audit)
        </button>
        <button 
          onClick={() => setActiveTab('routine')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'routine' ? 'bg-white shadow text-heineken-green' : 'text-gray-500'}`}
        >
          Rotina Diária (11 Passos)
        </button>
      </div>

      {activeTab === 'script' ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-heineken-green">
            <h2 className="text-2xl font-bold text-heineken-green flex items-center gap-2">
              <Presentation className="w-8 h-8" />
              Roteiro de Apresentação
            </h2>
            <p className="text-gray-600 mt-2">O passo a passo para apresentar sua loja durante uma auditoria ou visita do supervisor.</p>
          </div>

          <div className="space-y-4">
            {VISIT_SCRIPT_STEPS.map((step, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-black text-heineken-green text-lg">PASSO {step.step}</span>
                  <ChevronRight className="text-gray-300 w-5 h-5" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
            <p className="text-sm text-blue-800 font-medium text-center">
              "Visita gabaritada é só correr pro abraço!"
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-heineken-green">
            <h2 className="text-2xl font-bold text-heineken-green flex items-center gap-2">
              <Footprints className="w-8 h-8" />
              Os 11 Passos da Execução
            </h2>
            <p className="text-gray-600 mt-2">Siga o trajeto definido e cumpra a rotina perfeita.</p>
          </div>

          <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 my-8">
            {ROUTINE_STEPS.map((step, index) => (
              <div key={index} className="relative pl-8">
                <span className="absolute -left-[9px] top-1 bg-heineken-green text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white">
                  {index + 1}
                </span>
                <h3 className="font-bold text-gray-800 text-lg">{step}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border-t-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-blue-500" />
                <h3 className="font-bold text-gray-800">Horário</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>44 horas semanais</li>
                <li>Check-in: 08:00hs</li>
                <li>Almoço: 1h de duração</li>
                <li>Check-out: 16:20hs</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-t-4 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-purple-500" />
                <h3 className="font-bold text-gray-800">Rotina Mensal</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Matinal: 1x semana (30min)</li>
                <li>Reunião Mensal: 1x mês (Presencial)</li>
                <li>Visita Supervisor: 1x semana</li>
                <li>Coaching: 1x mês</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};