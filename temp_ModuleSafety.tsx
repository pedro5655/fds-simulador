import React from 'react';
import { SAFETY_ATTITUDES } from '../constants';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const ModuleSafety: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-heineken-green">
        <h2 className="text-2xl font-bold text-heineken-green flex items-center gap-2">
          <ShieldCheck className="w-8 h-8" />
          10 Atitudes Seguras
        </h2>
        <p className="text-gray-600 mt-2">Segurança em primeiro lugar. Essas atitudes são inegociáveis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAFETY_ATTITUDES.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-heineken-green font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                {item.id}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex gap-3">
        <AlertTriangle className="text-yellow-600 w-6 h-6 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-yellow-800">Reporte de Riscos</h4>
          <p className="text-sm text-yellow-700">
            Identificou um risco? Reporte imediatamente no <strong>App Involves</strong> e avise o gerente da loja.
          </p>
        </div>
      </div>
    </div>
  );
};