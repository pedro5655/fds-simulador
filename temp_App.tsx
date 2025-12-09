import React, { useState } from 'react';
import { AppScreen } from './types';
import { ModuleSafety } from './components/ModuleSafety';
import { ModuleVisit } from './components/ModuleVisit';
import { ModuleScoring } from './components/ModuleScoring';
import { ModuleSovi } from './components/ModuleSovi';
import { ModuleQuiz } from './components/ModuleQuiz';
import { ModuleCompany } from './components/ModuleCompany';
import { 
  Menu, 
  Home, 
  ShieldCheck, 
  ClipboardList, 
  TrendingUp, 
  Award, 
  MessageCircleQuestion, 
  X,
  Star,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.HOME);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define the logical flow of the study modules
  const STUDY_FLOW = [
    AppScreen.COMPANY,
    AppScreen.ROUTINE,
    AppScreen.SOVI,
    AppScreen.SAFETY,
    AppScreen.SCORING,
    AppScreen.AUDIT_QUIZ
  ];

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const getTitle = (screen: AppScreen) => {
    switch(screen) {
      case AppScreen.HOME: return 'Início';
      case AppScreen.SAFETY: return 'Segurança';
      case AppScreen.ROUTINE: return 'Roteiro & Visita';
      case AppScreen.SCORING: return 'Pilares & Pontuação';
      case AppScreen.SOVI: return 'Metas de SOVI';
      case AppScreen.AUDIT_QUIZ: return 'Simulador Audit';
      case AppScreen.COMPANY: return 'Sobre a Heineken';
      default: return '';
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.HOME:
        return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-20">
             <div className="bg-white rounded-2xl p-8 text-center shadow-sm mt-4">
                <Star className="w-16 h-16 text-heineken-red mx-auto mb-4 fill-current" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Fotografia de Sucesso 2025</h1>
                <p className="text-gray-500 mb-8">Treinamento oficial para promotores e preparação para auditoria.</p>
                
                <button 
                  onClick={() => navigateTo(AppScreen.AUDIT_QUIZ)}
                  className="w-full bg-heineken-green text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-heineken-dark transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <MessageCircleQuestion />
                  Iniciar Simulador de Auditoria
                </button>

                <p className="text-xs text-gray-400 uppercase tracking-widest mt-8">Módulos de Estudo</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                   <button onClick={() => navigateTo(AppScreen.COMPANY)} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-green-500 transition-colors">
                      <Users className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                      <span className="text-sm font-semibold text-gray-700">Sobre a Heineken</span>
                   </button>
                   <button onClick={() => navigateTo(AppScreen.ROUTINE)} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-green-500 transition-colors">
                      <ClipboardList className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                      <span className="text-sm font-semibold text-gray-700">Roteiro & Visita</span>
                   </button>
                   <button onClick={() => navigateTo(AppScreen.SOVI)} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-green-500 transition-colors">
                      <TrendingUp className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                      <span className="text-sm font-semibold text-gray-700">Metas SOVI</span>
                   </button>
                   <button onClick={() => navigateTo(AppScreen.SAFETY)} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-green-500 transition-colors">
                      <ShieldCheck className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                      <span className="text-sm font-semibold text-gray-700">Segurança</span>
                   </button>
                   <button onClick={() => navigateTo(AppScreen.SCORING)} className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-green-500 transition-colors flex flex-col items-center">
                      <Award className="w-6 h-6 text-gray-700 mb-2" />
                      <span className="text-sm font-semibold text-gray-700">4 Pilares e Pontuação</span>
                   </button>
                </div>
             </div>
          </div>
        );
      case AppScreen.SAFETY: return <ModuleSafety />;
      case AppScreen.ROUTINE: return <ModuleVisit />;
      case AppScreen.SCORING: return <ModuleScoring />;
      case AppScreen.SOVI: return <ModuleSovi />;
      case AppScreen.AUDIT_QUIZ: return <ModuleQuiz />;
      case AppScreen.COMPANY: return <ModuleCompany />;
      default: return null;
    }
  };

  const getNavigationButtons = () => {
    if (currentScreen === AppScreen.HOME) return null;

    const currentIndex = STUDY_FLOW.indexOf(currentScreen);
    const prevScreen = currentIndex > 0 ? STUDY_FLOW[currentIndex - 1] : null;
    const nextScreen = currentIndex < STUDY_FLOW.length - 1 ? STUDY_FLOW[currentIndex + 1] : null;

    return (
      <div className="flex justify-between items-center gap-3 mt-8 pt-6 border-t border-gray-200">
        {prevScreen ? (
          <button 
            onClick={() => navigateTo(prevScreen)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm md:text-base">Anterior</span>
          </button>
        ) : (
          <div className="flex-1"></div> // Spacer
        )}

        {nextScreen ? (
          <button 
            onClick={() => navigateTo(nextScreen)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-heineken-green text-white font-semibold rounded-xl shadow-md shadow-green-200 hover:bg-heineken-dark transition-colors"
          >
            <span className="text-sm md:text-base">Próximo</span>
            <ChevronRight size={20} />
          </button>
        ) : (
          <button 
            onClick={() => navigateTo(AppScreen.HOME)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:bg-black transition-colors"
          >
            <Home size={18} />
            <span className="text-sm md:text-base">Início</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-10">
      {/* Header */}
      <header className="bg-heineken-green text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMenuOpen(true)} className="p-1 hover:bg-green-700 rounded">
               <Menu className="w-6 h-6" />
             </button>
             <h1 className="font-bold text-lg tracking-tight truncate">{getTitle(currentScreen)}</h1>
          </div>
          <Star className="w-5 h-5 text-heineken-red fill-current" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-6 pb-8">
        {renderScreen()}
        {getNavigationButtons()}
      </main>

      {/* Sidebar Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-white w-64 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 bg-heineken-green text-white flex justify-between items-center">
              <span className="font-bold text-xl">Menu</span>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <NavButton icon={<Home />} label="Início" active={currentScreen === AppScreen.HOME} onClick={() => navigateTo(AppScreen.HOME)} />
              <NavButton icon={<MessageCircleQuestion />} label="Simulador de Auditoria" active={currentScreen === AppScreen.AUDIT_QUIZ} onClick={() => navigateTo(AppScreen.AUDIT_QUIZ)} />
              <div className="h-px bg-gray-200 my-2" />
              <NavButton icon={<Users />} label="Sobre a Heineken" active={currentScreen === AppScreen.COMPANY} onClick={() => navigateTo(AppScreen.COMPANY)} />
              <NavButton icon={<ClipboardList />} label="Roteiro & Visita" active={currentScreen === AppScreen.ROUTINE} onClick={() => navigateTo(AppScreen.ROUTINE)} />
              <NavButton icon={<TrendingUp />} label="Metas de SOVI" active={currentScreen === AppScreen.SOVI} onClick={() => navigateTo(AppScreen.SOVI)} />
              <NavButton icon={<ShieldCheck />} label="10 Atitudes Seguras" active={currentScreen === AppScreen.SAFETY} onClick={() => navigateTo(AppScreen.SAFETY)} />
              <NavButton icon={<Award />} label="4 Pilares (Pontuação)" active={currentScreen === AppScreen.SCORING} onClick={() => navigateTo(AppScreen.SCORING)} />
            </nav>

            <div className="p-4 border-t text-center text-xs text-gray-400">
              Heineken Brasil &copy; 2025
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-green-50 text-heineken-green' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    {label}
  </button>
);

export default App;