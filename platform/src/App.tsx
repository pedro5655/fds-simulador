import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  ClipboardCheck,
  Menu,
  Plus,
  Route,
  ShieldCheck,
  X,
} from 'lucide-react';
import { evaluateVisit } from '@/domain/rules/engine';
import { AssessmentFlow } from '@/features/assessment/AssessmentFlow';
import { ActionPlanView } from '@/features/results/ActionPlanView';
import { Dashboard } from '@/features/results/Dashboard';
import { VisitMode } from '@/features/results/VisitMode';
import { useVisitDraft } from '@/hooks/useVisitDraft';

type View = 'assessment' | 'dashboard' | 'actions' | 'visit';

const views: Array<{ id: View; label: string; icon: typeof BarChart3 }> = [
  { id: 'dashboard', label: 'Diagnóstico', icon: BarChart3 },
  { id: 'actions', label: 'Plano', icon: ClipboardCheck },
  { id: 'visit', label: 'Modo Visita', icon: Route },
];

export function App() {
  const { visit, setVisit, reset } = useVisitDraft();
  const [view, setView] = useState<View>(() => visit.identity.storeName ? 'dashboard' : 'assessment');
  const [menuOpen, setMenuOpen] = useState(false);
  const evaluation = useMemo(() => evaluateVisit(visit), [visit]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    return () => window.cancelAnimationFrame(frame);
  }, [view]);

  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
  };

  const startNew = () => {
    if (!window.confirm('Iniciar uma nova avaliação? O rascunho salvo neste aparelho será substituído.')) {
      return;
    }
    reset();
    navigate('assessment');
  };

  return (
    <div className="app-shell" data-view={view}>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate('dashboard')}>
          <span className="brand__mark"><ShieldCheck size={22} /></span>
          <span className="brand__word"><strong>Visita <i>em</i> Cena</strong><small>Rock in Rio · 2026</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {views.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" aria-current={view === item.id ? 'page' : undefined} className={view === item.id ? 'is-active' : ''} onClick={() => navigate(item.id)}>
                <Icon size={17} /> {item.label}
              </button>
            );
          })}
          <button type="button" onClick={() => navigate('assessment')} className={view === 'assessment' ? 'is-active' : ''}>
            Avaliar loja
          </button>
        </nav>
        <button type="button" className="menu-toggle" aria-label="Abrir menu" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <button type="button" onClick={() => navigate('assessment')}>Avaliar loja</button>
          {views.map((item) => <button type="button" key={item.id} onClick={() => navigate(item.id)}>{item.label}</button>)}
          <button type="button" onClick={startNew}><Plus size={17} /> Nova avaliação</button>
        </div>
      )}

      <main>
        {view === 'assessment' && (
          <AssessmentFlow visit={visit} setVisit={setVisit} onFinish={() => navigate('dashboard')} />
        )}
        {view === 'dashboard' && (
          <Dashboard
            visit={visit}
            evaluation={evaluation}
            onOpenActions={() => navigate('actions')}
            onOpenVisit={() => navigate('visit')}
            onEditAssessment={() => navigate('assessment')}
          />
        )}
        {view === 'actions' && (
          <ActionPlanView visit={visit} setVisit={setVisit} gaps={evaluation.prioritizedGaps} />
        )}
        {view === 'visit' && <VisitMode />}
      </main>

      {view !== 'assessment' && (
        <nav className="bottom-nav" aria-label="Navegação do resultado">
          {views.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" className={view === item.id ? 'is-active' : ''} onClick={() => navigate(item.id)}>
                <Icon size={20} /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      <footer>
        <span>Uso interno · Rascunho salvo somente neste aparelho</span>
        <button type="button" onClick={startNew}><Plus size={16} /> Nova avaliação</button>
      </footer>
    </div>
  );
}
