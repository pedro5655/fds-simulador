import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  Route,
  ShieldAlert,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
} from 'lucide-react';
import { Card, EmptyState, ProgressBar } from '@/components/ui';
import { PRICE_RULER_VERSION } from '@/domain/rules/price-ruler';
import { RULESET_VERSION } from '@/domain/rules/rule-config';
import type { VisitDraft, VisitEvaluation } from '@/domain/rules/types';

type DashboardProps = {
  visit: VisitDraft;
  evaluation: VisitEvaluation;
  onOpenActions: () => void;
  onOpenVisit: () => void;
  onEditAssessment: () => void;
};

const pillarRows = [
  ['Presença', 'presence', 40],
  ['Posicionamento', 'positioning', 35],
  ['Visibilidade', 'visibility', 20],
  ['Precificação FDS', 'pricing', 5],
] as const;

const formatDate = (value: string) => {
  if (!value) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T12:00:00`))
    .replace('.', '');
};

export function Dashboard({
  visit,
  evaluation,
  onOpenActions,
  onOpenVisit,
  onEditAssessment,
}: DashboardProps) {
  const actionable = evaluation.prioritizedGaps.filter((gap) => gap.severity !== 'info');
  const planRequired = actionable.filter((gap) => gap.requiresPlan);
  const primaryGap = planRequired[0] ?? actionable[0];
  const confirmedRecoverable = Math.min(
    100 - evaluation.fds.total,
    evaluation.fds.gaps
      .filter((gap) => gap.requiresPlan)
      .reduce((total, gap) => total + gap.recoverablePoints, 0),
  );
  const completePlans = planRequired.filter((gap) => {
    const plan = visit.actions[gap.id];
    return Boolean(plan?.cause && plan.action && plan.owner && plan.dueDate);
  }).length;
  const weakPillar = pillarRows.reduce((weakest, current) => {
    const weakRatio = evaluation.fds.pillars[weakest[1]] / weakest[2];
    const currentRatio = evaluation.fds.pillars[current[1]] / current[2];
    return currentRatio < weakRatio ? current : weakest;
  });
  const readinessGap = [...evaluation.readiness.factors]
    .sort((a, b) => (b.possible - b.earned) - (a.possible - a.earned))[0];

  const downloadReport = async () => {
    const { downloadExecutivePdf } = await import('@/report/executive-pdf');
    downloadExecutivePdf(visit, evaluation);
  };

  return (
    <div className="stack dashboard dashboard--executive">
      <section className="executive-hero">
        <div className="executive-hero__glow" aria-hidden="true" />
        <div className="executive-hero__ledger">
          <span>Visita em cena · RJ</span>
          <span className="provisional-stamp">Regras provisórias · v1</span>
        </div>

        <div className="executive-hero__main">
          <div>
            <span className="eyebrow eyebrow--lime">Preparação de alta liderança</span>
            <h1>{visit.identity.storeName || 'Loja não identificada'}</h1>
            <p>
              {visit.identity.format.toUpperCase()} / {visit.identity.channel.toUpperCase()} ·{' '}
              {formatDate(visit.identity.visitDate)}
              {visit.identity.storeCode ? ` · ${visit.identity.storeCode}` : ''}
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" className="button button--ghost-light" onClick={onEditAssessment}>
              Continuar avaliação <ArrowRight size={18} />
            </button>
            <button type="button" className="button button--lime" onClick={onOpenVisit}>
              Iniciar Modo Visita <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        <div className="hero-scoreboard" aria-label="Resumo das três métricas independentes">
          <article className="scoreboard-metric scoreboard-metric--fds">
            <span>01 · FDS oficial</span>
            <strong>{evaluation.fds.total}<small>/100</small></strong>
            <p>Execução pontuada</p>
          </article>
          <article className="scoreboard-metric scoreboard-metric--price">
            <span>02 · Preço conforme</span>
            <strong>{evaluation.price.percentage === null ? '—' : evaluation.price.percentage}<small>{evaluation.price.percentage === null ? '' : '%'}</small></strong>
            <p>{evaluation.price.percentage === null ? 'Não avaliado' : `${evaluation.price.conformingCount}/${evaluation.price.observedCount} itens`}</p>
          </article>
          <article className="scoreboard-metric scoreboard-metric--ready">
            <span>03 · Prontidão</span>
            <strong>{evaluation.readiness.score}<small>%</small></strong>
            <p>{evaluation.readiness.label}</p>
          </article>
        </div>

        <div className="hero-priority">
          <span className="hero-priority__index">P1</span>
          <div>
            <small>{primaryGap?.requiresPlan ? 'Prioridade confirmada' : 'Principal dado a concluir'}</small>
            <strong>{primaryGap?.title ?? 'Nenhuma prioridade aberta'}</strong>
          </div>
          {primaryGap && primaryGap.recoverablePoints > 0 && (
            <span className="impact-badge">+{primaryGap.recoverablePoints} pts {primaryGap.metric === 'fds' ? 'FDS' : 'preparo'}</span>
          )}
        </div>
      </section>

      <section className="executive-readout" aria-label="Leitura executiva da visita">
        <article>
          <span className="readout-icon"><BarChart3 size={20} /></span>
          <div><small>Maior alavanca FDS</small><strong>{weakPillar[0]}</strong><p>{evaluation.fds.pillars[weakPillar[1]]}/{weakPillar[2]} pontos atuais</p></div>
        </article>
        <article>
          <span className="readout-icon"><Target size={20} /></span>
          <div><small>Ganho confirmado</small><strong>{confirmedRecoverable > 0 ? `+${confirmedRecoverable} pontos` : 'Aguardando avaliação'}</strong><p>Somente lacunas já confirmadas entram aqui</p></div>
        </article>
        <article>
          <span className="readout-icon"><TimerReset size={20} /></span>
          <div><small>Próximo foco de preparo</small><strong>{readinessGap?.label ?? 'Visita preparada'}</strong><p>{readinessGap && readinessGap.earned < readinessGap.possible ? `${Math.round(readinessGap.possible - readinessGap.earned)} pontos de prontidão em aberto` : 'Nenhuma pendência registrada'}</p></div>
        </article>
      </section>

      <Card tone="amber" className="governance-alert governance-alert--executive">
        <ShieldAlert size={22} />
        <div><strong>Leituras independentes por desenho</strong><p>Régua de preço não altera a nota FDS. Prontidão mede a capacidade de conduzir a visita com dados, segurança e compromissos claros.</p></div>
      </Card>

      <div className="dashboard-grid dashboard-grid--executive">
        <Card className="scorecard-panel">
          <div className="card-heading">
            <div><span>Arquitetura da nota</span><h2>Onde o FDS está</h2></div>
            <strong className="score-total">{evaluation.fds.total}<small>/100</small></strong>
          </div>
          <div className="pillar-list">
            {pillarRows.map(([label, key, maximum], index) => {
              const value = evaluation.fds.pillars[key];
              return (
                <div className="pillar" key={key}>
                  <div><span><em>0{index + 1}</em>{label}</span><strong>{value}/{maximum}</strong></div>
                  <ProgressBar value={(value / maximum) * 100} />
                </div>
              );
            })}
          </div>
          <div className="recovery-note"><TrendingUp size={18} /><span>Ganho confirmado e recuperável</span><strong>+{confirmedRecoverable} pts</strong></div>
        </Card>

        <Card className="sovi-panel">
          <div className="card-heading">
            <div><span>SOVI direto</span><h2>Atual × meta</h2></div>
            <Sparkles size={22} />
          </div>
          <div className="share-list">
            {Object.entries(evaluation.fds.shares).map(([segment, share]) => {
              const difference = share.value === null ? null : Number((share.value - share.target).toFixed(1));
              return (
                <div key={segment} className={share.met ? 'share is-met' : share.value === null ? 'share is-unknown' : 'share'}>
                  <div className="share__title"><span>{segment}</span><strong>{share.value === null ? '—' : `${share.value}%`}</strong></div>
                  <div className="share__decision"><span>{share.value === null ? 'Não avaliado' : share.met ? 'Meta atingida' : 'Abaixo da meta'}</span><small>{difference === null ? `Meta ${share.target}%` : `${difference > 0 ? '+' : ''}${difference} p.p.`}</small></div>
                  <div className="share__line" aria-label={`Meta ${share.target}%`}><span style={{ width: `${Math.min(100, share.value ?? 0)}%` }} /><i style={{ left: `${share.target}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <section className="decision-section">
        <div className="decision-section__head">
          <div><span className="eyebrow">Decisão em 30 segundos</span><h2>O que precisa mudar primeiro</h2></div>
          <strong>{completePlans}/{planRequired.length} compromissos completos</strong>
        </div>
        {actionable.length === 0 ? (
          <EmptyState><CheckCircle2 size={28} /> Nenhuma lacuna prioritária foi registrada.</EmptyState>
        ) : (
          <div className="priority-list priority-list--executive">
            {actionable.slice(0, 5).map((gap, index) => {
              const plan = visit.actions[gap.id];
              const complete = Boolean(plan?.cause && plan.action && plan.owner && plan.dueDate);
              return (
                <Card key={gap.id} className={index === 0 ? 'gap-card gap-card--lead' : 'gap-card'}>
                  <div className="gap-rank">{String(index + 1).padStart(2, '0')}</div>
                  <div className="gap-card__body">
                    <span>{gap.area} · {gap.metric.toUpperCase()}</span><h3>{gap.title}</h3><p>{gap.detail}</p>
                    <small className={complete ? 'is-complete' : ''}>{complete ? 'Compromisso registrado' : gap.requiresPlan ? 'Compromisso obrigatório pendente' : 'Dado ainda não avaliado'}</small>
                  </div>
                  {gap.recoverablePoints > 0 && <strong>+{gap.recoverablePoints}<small> pts {gap.metric === 'fds' ? 'FDS' : 'preparo'}</small></strong>}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <div className="experience-grid experience-grid--executive">
        <button type="button" className="experience experience--plan" onClick={onOpenActions}><ClipboardList size={25} /><div><span>Transformar análise</span><strong>Assumir compromissos</strong></div><ArrowRight size={20} /></button>
        <button type="button" className="experience experience--visit" onClick={onOpenVisit}><Route size={25} /><div><span>Entrar em cena</span><strong>Abrir Modo Visita</strong></div><ArrowRight size={20} /></button>
        <button type="button" className="experience experience--report" onClick={() => void downloadReport()}><Download size={25} /><div><span>Leitura executiva</span><strong>Exportar relatório</strong></div><ArrowRight size={20} /></button>
      </div>

      <Card className="version-card version-card--executive">
        <AlertTriangle size={19} />
        <div><strong>Governança visível</strong><p>{RULESET_VERSION.label} · {RULESET_VERSION.id}</p><p>{PRICE_RULER_VERSION.label} · {PRICE_RULER_VERSION.id}</p><small>FDS aguarda homologação das ambiguidades do book. A régua publicada cobre RJ/agosto de 2026.</small></div>
      </Card>
    </div>
  );
}
