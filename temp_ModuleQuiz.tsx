import React, { useState } from 'react';
import { AUDIT_QUESTIONS } from '../constants';
import { MessageCircleQuestion, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export const ModuleQuiz: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-heineken-dark text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircleQuestion className="w-8 h-8 text-heineken-red" />
          Simulador de Auditoria
        </h2>
        <p className="text-green-100 mt-2">
          Perguntas reais que o supervisor ou auditor fará em loja.
          Toque para revelar a resposta correta.
        </p>
      </div>

      <div className="space-y-3">
        {AUDIT_QUESTIONS.map((q, idx) => (
          <div 
            key={idx} 
            className={`bg-white rounded-lg shadow-sm border transition-all duration-300 ${openIndex === idx ? 'ring-2 ring-heineken-green border-transparent' : 'border-gray-200'}`}
          >
            <button
              onClick={() => toggleQuestion(idx)}
              className="w-full text-left p-4 flex justify-between items-center focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase flex-shrink-0 ${
                  q.category === 'SOVI' ? 'bg-blue-100 text-blue-700' :
                  q.category === 'Segurança' ? 'bg-red-100 text-red-700' :
                  q.category === 'Visibilidade' ? 'bg-purple-100 text-purple-700' :
                  q.category === 'Institucional' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {q.category}
                </span>
                <span className="font-semibold text-gray-800 text-sm md:text-base leading-tight">{q.question}</span>
              </div>
              {openIndex === idx ? <ChevronUp className="text-heineken-green flex-shrink-0" /> : <ChevronDown className="text-gray-400 flex-shrink-0" />}
            </button>
            
            {openIndex === idx && (
              <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-gray-700 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-heineken-green flex-shrink-0 mt-0.5" />
                  <p>{q.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};