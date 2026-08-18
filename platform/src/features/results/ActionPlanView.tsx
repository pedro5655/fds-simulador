import type { Dispatch, SetStateAction } from 'react';
import { CalendarClock, CheckCircle2, CircleAlert, Target, UserRound } from 'lucide-react';
import { Card, EmptyState, Field, ProgressBar, SectionTitle } from '@/components/ui';
import type { Gap, VisitDraft } from '@/domain/rules/types';

export function ActionPlanView({
  visit,
  setVisit,
  gaps,
}: {
  visit: VisitDraft;
  setVisit: Dispatch<SetStateAction<VisitDraft>>;
  gaps: Gap[];
}) {
  const priorities = gaps.filter((gap) => gap.requiresPlan);
  const completedCount = priorities.filter((gap) => {
    const plan = visit.actions[gap.id];
    return Boolean(plan?.cause && plan.action && plan.owner && plan.dueDate);
  }).length;

  if (!priorities.length) {
    return (
      <div className="stack">
        <SectionTitle eyebrow="Plano de ação" title="Nenhuma resposta negativa aberta" />
        <EmptyState><CheckCircle2 size={28} /> Avalie os itens; somente respostas negativas exigirão causa, ação, responsável e prazo.</EmptyState>
      </div>
    );
  }

  const update = (gapId: string, field: 'cause' | 'action' | 'owner' | 'dueDate', value: string) =>
    setVisit((previous) => ({
      ...previous,
      actions: {
        ...previous.actions,
        [gapId]: {
          cause: previous.actions[gapId]?.cause ?? '',
          action: previous.actions[gapId]?.action ?? '',
          owner: previous.actions[gapId]?.owner ?? '',
          dueDate: previous.actions[gapId]?.dueDate ?? '',
          [field]: value,
        },
      },
    }));

  return (
    <div className="stack action-plan-view">
      <section className="action-plan-hero">
        <div className="action-plan-hero__mark"><Target size={28} /></div>
        <div>
          <span>Diagnóstico → compromisso</span>
          <h1>Da oportunidade<br />para a execução.</h1>
          <p>Toda resposta negativa precisa de quatro fatos: causa, ação, responsável e prazo. O sistema não preenche nenhum deles por conta própria.</p>
        </div>
        <div className="action-plan-hero__score">
          <strong>{completedCount}<small>/{priorities.length}</small></strong>
          <span>compromissos completos</span>
          <ProgressBar value={priorities.length ? (completedCount / priorities.length) * 100 : 100} />
        </div>
      </section>
      {priorities.map((gap, index) => {
        const plan = visit.actions[gap.id] ?? { cause: '', action: '', owner: '', dueDate: '' };
        const complete = Boolean(plan.cause && plan.action && plan.owner && plan.dueDate);
        return (
          <Card key={gap.id} tone={complete ? 'green' : index < 3 ? 'red' : 'amber'} className="action-commitment">
            <div className="priority-head">
              <div className="priority-number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <span>{gap.area} · {gap.metric.toUpperCase()}</span>
                <h3>{gap.title}</h3>
                <p>{gap.detail}</p>
              </div>
              {gap.recoverablePoints > 0 && <strong className="commitment-impact"><small>Recuperável</small>+{gap.recoverablePoints} pts {gap.metric === 'fds' ? 'FDS' : 'preparo'}</strong>}
            </div>
            <div className="action-grid">
              <Field label="01 · Causa informada">
                <textarea rows={2} value={plan.cause} onChange={(event) => update(gap.id, 'cause', event.target.value)} placeholder="O que foi observado pela equipe?" />
              </Field>
              <Field label="02 · Ação acordada">
                <textarea rows={2} value={plan.action} onChange={(event) => update(gap.id, 'action', event.target.value)} placeholder="Qual ação será executada?" />
              </Field>
              <Field label="03 · Responsável">
                <div className="input-with-icon"><UserRound size={17} /><input value={plan.owner} onChange={(event) => update(gap.id, 'owner', event.target.value)} placeholder="Nome ou função" /></div>
              </Field>
              <Field label="04 · Prazo">
                <div className="input-with-icon"><CalendarClock size={17} /><input type="date" value={plan.dueDate} onChange={(event) => update(gap.id, 'dueDate', event.target.value)} /></div>
              </Field>
            </div>
            <p className={`plan-status ${complete ? 'is-complete' : ''}`}>
              {complete ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
              {complete ? 'Plano completo e pronto para o roteiro.' : 'Complete os quatro campos; o sistema não preencherá justificativas por você.'}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
