import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Beer,
  CheckCircle2,
  ClipboardCheck,
  Eraser,
  Plus,
  ShieldCheck,
  Snowflake,
  Store,
  Tag,
  Trash2,
} from 'lucide-react';
import { BooleanChoice, Card, Field, SectionTitle } from '@/components/ui';
import { clearPriceObservation } from '@/domain/visit';
import { evaluatePrice, extraPointBandFor } from '@/domain/rules/engine';
import { priceEntriesFor } from '@/domain/rules/price-ruler';
import {
  EXTRA_POINT_MIN_PACKS,
  PLANOGRAM_RULES,
  SOVI_RULES,
  applicablePresenceRequirements,
} from '@/domain/rules/rule-config';
import type {
  Placement,
  PresenceAnswerValue,
  Segment,
  VisitDraft,
} from '@/domain/rules/types';

const steps = [
  { id: 'identity', label: 'Loja', icon: Store },
  { id: 'safety', label: 'Segurança', icon: ShieldCheck },
  { id: 'presence', label: 'Presença', icon: Beer },
  { id: 'execution', label: 'Execução', icon: ClipboardCheck },
  { id: 'prices', label: 'Preços', icon: Tag },
] as const;

const segmentNames: Record<Segment, string> = {
  craft: 'Craft',
  premium: 'Premium',
  mainstream: 'Mainstream',
};

const presenceSegmentNames = {
  craft: 'Craft',
  premium: 'Premium',
  mainstream: 'Mainstream',
  nab: 'Não alcoólicos',
} as const;

const numberValue = (value: string): number | null =>
  value === '' ? null : Number(value);

export function AssessmentFlow({
  visit,
  setVisit,
  onFinish,
}: {
  visit: VisitDraft;
  setVisit: Dispatch<SetStateAction<VisitDraft>>;
  onFinish: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState('');
  const [presenceSegment, setPresenceSegment] = useState<keyof typeof presenceSegmentNames>('craft');
  const current = steps[stepIndex];
  const requirements = useMemo(
    () => applicablePresenceRequirements(visit.identity.format),
    [visit.identity.format],
  );
  const availablePrices = useMemo(
    () => priceEntriesFor(visit.identity.channel, visit.identity.uf),
    [visit.identity.channel, visit.identity.uf],
  );
  const priceEvaluation = useMemo(() => evaluatePrice(visit), [visit]);
  const peBand = extraPointBandFor(visit.extraPoints.total);
  const filteredRequirements = requirements.filter(
    (requirement) => requirement.segment === presenceSegment,
  );
  const presenceProgress = requirements.reduce(
    (progress, requirement) => {
      const score = requirement.scores[visit.identity.format];
      const answer = visit.presence[requirement.id] ?? {};
      for (const placement of ['shelf', 'cold'] as Placement[]) {
        if (score[placement] <= 0) continue;
        progress.total += 1;
        if (answer[placement] !== undefined) progress.answered += 1;
      }
      return progress;
    },
    { answered: 0, total: 0 },
  );

  const patchVisit = (patch: Partial<VisitDraft>) =>
    setVisit((previous) => ({ ...previous, ...patch }));

  const patchIdentity = (patch: Partial<VisitDraft['identity']>) =>
    setVisit((previous) => ({
      ...previous,
      identity: { ...previous.identity, ...patch },
    }));

  const setPresence = (
    requirementId: string,
    placement: Placement,
    value: PresenceAnswerValue,
  ) =>
    setVisit((previous) => ({
      ...previous,
      presence: {
        ...previous.presence,
        [requirementId]: {
          shelf: previous.presence[requirementId]?.shelf,
          cold: previous.presence[requirementId]?.cold,
          [placement]: value,
        },
      },
    }));

  const addPrice = () => {
    if (!selectedPrice) return;
    setVisit((previous) => {
      if (previous.priceObservations.some((item) => item.rulerEntryId === selectedPrice)) {
        return previous;
      }
      return {
        ...previous,
        priceObservations: [
          ...previous.priceObservations,
          { id: crypto.randomUUID(), rulerEntryId: selectedPrice, observed: null },
        ],
      };
    });
    setSelectedPrice('');
  };

  const next = () => {
    if (stepIndex === steps.length - 1) onFinish();
    else {
      setStepIndex((value) => value + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="assessment">
      <div className="assessment-rail">
        <div>
          <span>Avaliação de loja</span>
          <strong>{visit.identity.storeName || 'Nova visita'}</strong>
        </div>
        <div className="assessment-rail__progress">
          <span>Etapa {stepIndex + 1} de {steps.length}</span>
          <div><i style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="step-strip" aria-label="Etapas da avaliação">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <button
              type="button"
              key={step.id}
              className={index === stepIndex ? 'is-active' : index < stepIndex ? 'is-done' : ''}
              aria-current={index === stepIndex ? 'step' : undefined}
              onClick={() => setStepIndex(index)}
            >
              <Icon size={17} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {current.id === 'identity' && (
        <div className="stack">
          <SectionTitle
            eyebrow="1 · Identificação"
            title="Qual loja vamos preparar?"
            description="Esses dados acompanham o diagnóstico, o roteiro e o relatório."
          />
          <Card>
            <div className="form-grid">
              <Field label="Nome da loja">
                <input value={visit.identity.storeName} onChange={(event) => patchIdentity({ storeName: event.target.value })} placeholder="Ex.: Supermercado Copacabana" />
              </Field>
              <Field label="Código da loja">
                <input value={visit.identity.storeCode} onChange={(event) => patchIdentity({ storeCode: event.target.value })} placeholder="Ex.: RJ-001" />
              </Field>
              <Field label="Promotor(a)">
                <input value={visit.identity.collaborator} onChange={(event) => patchIdentity({ collaborator: event.target.value })} placeholder="Nome completo" />
              </Field>
              <Field label="Data da visita">
                <input type="date" value={visit.identity.visitDate} onChange={(event) => patchIdentity({ visitDate: event.target.value })} />
              </Field>
              <Field label="Tempo de companhia" hint="Usado apenas na fala de apresentação.">
                <input value={visit.identity.companyTime} onChange={(event) => patchIdentity({ companyTime: event.target.value })} placeholder="Ex.: 2 anos" />
              </Field>
              <Field label="Tempo atendendo a loja">
                <input value={visit.identity.storeTime} onChange={(event) => patchIdentity({ storeTime: event.target.value })} placeholder="Ex.: 8 meses" />
              </Field>
              <Field label="Canal">
                <select
                  value={visit.identity.channel}
                  onChange={(event) => {
                    const channel = event.target.value as VisitDraft['identity']['channel'];
                    patchIdentity({
                      channel,
                      format: channel === 'atacado' ? 'atacado' : visit.identity.format === 'atacado' ? 'super' : visit.identity.format,
                    });
                  }}
                >
                  <option value="varejo">Varejo</option>
                  <option value="atacado">Atacado C&C</option>
                </select>
              </Field>
              <Field label="Formato">
                <select value={visit.identity.format} onChange={(event) => patchIdentity({ format: event.target.value as VisitDraft['identity']['format'] })}>
                  {visit.identity.channel === 'atacado' ? (
                    <option value="atacado">Atacado C&C</option>
                  ) : (
                    <>
                      <option value="hiper">Hiper</option>
                      <option value="super">Super</option>
                      <option value="mini">Mini</option>
                    </>
                  )}
                </select>
              </Field>
              <Field label="UF" hint="Primeira régua homologada disponível.">
                <select value="RJ" disabled><option>RJ</option></select>
              </Field>
            </div>
          </Card>
        </div>
      )}

      {current.id === 'safety' && (
        <div className="stack">
          <SectionTitle eyebrow="2 · Segurança" title="Comece pelo inegociável" description="Qualquer resposta negativa vira prioridade no plano de ação." />
          <Card tone="dark" className="safety-hero">
            <ShieldCheck size={30} />
            <div><strong>Antes do tour</strong><p>Apresente EPIs, saída de emergência e uso seguro do celular corporativo.</p></div>
          </Card>
          {[
            ['epis', 'EPIs corretos estão disponíveis e sendo usados?'],
            ['exitKnown', 'A saída e a rota de emergência foram identificadas?'],
            ['safePhoneUse', 'O celular será usado parado, em local seguro?'],
          ].map(([key, label]) => {
            const value = visit.safety[key as keyof VisitDraft['safety']];
            return (
              <Card key={key} tone={value === false ? 'red' : 'default'} className="safety-check-card">
                <div className="safety-check-card__head"><h3>{label}</h3><span className={`answer-status ${value === null ? 'is-unknown' : value ? 'is-ok' : 'is-critical'}`}>{value === null ? 'Não avaliado' : value ? 'Conforme' : 'Crítico'}</span></div>
                <BooleanChoice value={value} onChange={(nextValue) => patchVisit({ safety: { ...visit.safety, [key]: nextValue } })} yes="Conforme" no="Não conforme" />
                {value === false && <p className="negative-note"><AlertTriangle size={16} /> Exige causa, ação, responsável e prazo antes da visita.</p>}
              </Card>
            );
          })}
        </div>
      )}

      {current.id === 'presence' && (
        <div className="stack">
          <SectionTitle
            eyebrow="3 · Presença e rupturas"
            title="Encontre. Confirme. Recupere."
            description={`${presenceProgress.answered} de ${presenceProgress.total} colocações avaliadas em ${visit.identity.format.toUpperCase()}. Grupos OR pontuam uma única vez.`}
          />
          <div className="presence-switcher" role="tablist" aria-label="Segmentos de presença">
            {(Object.keys(presenceSegmentNames) as Array<keyof typeof presenceSegmentNames>).map((segment) => {
              const segmentRequirements = requirements.filter((requirement) => requirement.segment === segment);
              const segmentTotal = segmentRequirements.reduce((total, requirement) => {
                const score = requirement.scores[visit.identity.format];
                return total + Number(score.shelf > 0) + Number(score.cold > 0);
              }, 0);
              const segmentAnswered = segmentRequirements.reduce((total, requirement) => {
                const score = requirement.scores[visit.identity.format];
                const answer = visit.presence[requirement.id] ?? {};
                return total + Number(score.shelf > 0 && answer.shelf !== undefined) + Number(score.cold > 0 && answer.cold !== undefined);
              }, 0);
              if (segmentTotal === 0) return null;
              return (
                <button
                  key={segment}
                  type="button"
                  role="tab"
                  aria-selected={presenceSegment === segment}
                  className={presenceSegment === segment ? 'is-active' : ''}
                  onClick={() => setPresenceSegment(segment)}
                >
                  <span>{presenceSegmentNames[segment]}</span>
                  <strong>{segmentAnswered}/{segmentTotal}</strong>
                </button>
              );
            })}
          </div>
          {filteredRequirements.map((requirement, requirementIndex) => {
            const score = requirement.scores[visit.identity.format];
            const answer = visit.presence[requirement.id] ?? {};
            return (
              <Card key={requirement.id} className="presence-card">
                <div className="requirement-head">
                  <div>
                    <span className={`segment segment--${requirement.segment}`}>{presenceSegmentNames[requirement.segment]}</span>
                    <h3>{requirement.label}</h3>
                    {requirement.alternatives.length > 1 && <small className="or-explainer">1 de {requirement.alternatives.length} alternativas atende o requisito</small>}
                  </div>
                  <div className="presence-impact"><small>Impacto</small><strong>+{score.shelf + score.cold}</strong><span>pts</span></div>
                </div>
                <div className="presence-zones">
                  {(['shelf', 'cold'] as Placement[]).map((placement) => {
                    if (score[placement] <= 0) return null;
                    const raw = answer[placement];
                    const placementLabel = placement === 'shelf' ? 'Gôndola' : 'Gelada';
                    const stateLabel = raw === undefined ? 'Não avaliado' : raw === null ? 'Ruptura' : 'Presente';
                    return (
                      <section key={placement} className={`placement-zone placement-zone--${placement}`} aria-labelledby={`${requirement.id}-${placement}`}>
                        <div className="placement-zone__head">
                          <div>
                            {placement === 'shelf' ? <Store size={19} /> : <Snowflake size={19} />}
                            <strong id={`${requirement.id}-${placement}`}>{placementLabel}</strong>
                            <span>vale {score[placement]} pts</span>
                          </div>
                          <span className={`answer-status ${raw === undefined ? 'is-unknown' : raw === null ? 'is-critical' : 'is-ok'}`}>{stateLabel}</span>
                        </div>
                        <div className="presence-options">
                          <button type="button" aria-pressed={raw === undefined} className={raw === undefined ? 'presence-option is-selected is-unknown' : 'presence-option'} onClick={() => setPresence(requirement.id, placement, undefined)}>Não avaliado</button>
                          <button type="button" aria-pressed={raw === null} className={raw === null ? 'presence-option is-selected is-absent' : 'presence-option'} onClick={() => setPresence(requirement.id, placement, raw === null ? undefined : null)}>Ruptura</button>
                          {requirement.alternatives.map((alternative, alternativeIndex) => (
                            <button
                              key={alternative.id}
                              type="button"
                              aria-pressed={raw === alternative.id}
                              className={raw === alternative.id ? 'presence-option is-selected is-present' : 'presence-option'}
                              onClick={() => setPresence(requirement.id, placement, raw === alternative.id ? undefined : alternative.id)}
                            >
                              {requirement.alternatives.length > 1 && <em>{String.fromCharCode(65 + alternativeIndex)}</em>}
                              {alternative.label}
                            </button>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
                <span className="presence-card__index">{String(requirementIndex + 1).padStart(2, '0')}</span>
              </Card>
            );
          })}
        </div>
      )}

      {current.id === 'execution' && (
        <div className="stack">
          <SectionTitle eyebrow="4 · Execução" title="SOVI, planograma, pontos extras e geladeira" description="Números reais primeiro; a fala da visita será montada depois." />
          <Card>
            <div className="card-heading"><div><span>Medição de espaço</span><h3>SOVI direto</h3></div><strong className="micro-badge">Meta × atual</strong></div>
            <div className="sovi-grid">
              {(['craft', 'premium', 'mainstream'] as Segment[]).map((segment) => {
                const values = visit.sovi[segment];
                const target = SOVI_RULES.find((rule) => rule.segment === segment)!.target;
                const current = values.worldCm !== null && values.worldCm > 0 && values.heinekenCm !== null && values.heinekenCm <= values.worldCm
                  ? Number(((values.heinekenCm / values.worldCm) * 100).toFixed(1))
                  : null;
                const met = current !== null && current >= target;
                return (
                  <div className={`measure-card ${current === null ? 'is-unknown' : met ? 'is-met' : 'is-below'}`} key={segment}>
                    <div className="measure-card__head">
                      <span className={`segment segment--${segment}`}>{segmentNames[segment]}</span>
                      <strong>{current === null ? '—' : `${current}%`}</strong>
                    </div>
                    <div className="measure-card__status"><span>{current === null ? 'Não avaliado' : met ? 'Meta atingida' : 'Abaixo da meta'}</span><small>Meta {target}%</small></div>
                    <div className="measure-meter"><span style={{ width: `${Math.min(100, current ?? 0)}%` }} /><i style={{ left: `${target}%` }} /></div>
                    <div><Field label="Mundo (cm)"><input inputMode="decimal" type="number" min="0" value={values.worldCm ?? ''} onChange={(event) => patchVisit({ sovi: { ...visit.sovi, [segment]: { ...values, worldCm: numberValue(event.target.value) } } })} /></Field>
                    <Field label="HEINEKEN (cm)"><input inputMode="decimal" type="number" min="0" value={values.heinekenCm ?? ''} onChange={(event) => patchVisit({ sovi: { ...visit.sovi, [segment]: { ...values, heinekenCm: numberValue(event.target.value) } } })} /></Field></div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <h3>Planograma</h3>
            <div className="check-list">
              {PLANOGRAM_RULES.map((rule) => (
                <div key={rule.id} className="check-row">
                  <div><span className={`segment segment--${rule.segment}`}>{rule.segment}</span><p>{rule.label}</p></div>
                  <BooleanChoice value={visit.planogram[rule.id] ?? null} onChange={(value) => patchVisit({ planogram: { ...visit.planogram, [rule.id]: value } })} />
                </div>
              ))}
            </div>
          </Card>
          <Card className="pe-card">
            <div className="requirement-head"><div><h3>Pontos extras qualificados</h3><p>Craft: mínimo {EXTRA_POINT_MIN_PACKS.craft} packs. Premium/Mainstream: {EXTRA_POINT_MIN_PACKS.premium} packs.</p></div><Beer size={24} /></div>
            <div className="pe-total-entry">
              <Field label="Total de pontos extras de cerveja"><input inputMode="numeric" type="number" min="0" value={visit.extraPoints.total ?? ''} placeholder="Não avaliado" onChange={(event) => patchVisit({ extraPoints: { ...visit.extraPoints, total: numberValue(event.target.value) } })} /></Field>
              <div className="pe-band-display"><span>Faixa aplicada</span><strong>{peBand ? `${peBand.min}${peBand.max === null ? '+' : `–${peBand.max}`}` : '—'}</strong><small>{peBand ? 'pontos extras' : 'Não avaliada'}</small></div>
            </div>
            {peBand?.min === 21 && <p className="band-note">Decisão provisória explícita: 21 entra na faixa contínua de 21+.</p>}
            <div className="pe-target-grid">
              {(['craft', 'premium', 'mainstream'] as Segment[]).map((segment) => {
                const target = peBand?.targets[segment] ?? null;
                const actual = visit.extraPoints.qualifying[segment];
                const met = target !== null && target > 0 && actual !== null && actual >= target;
                const status = actual === null ? 'Não avaliado' : target === null ? 'Sem faixa' : target === 0 ? 'Não aplicável' : met ? 'Meta atingida' : 'Abaixo da meta';
                return (
                  <div key={segment} className={`pe-target ${actual === null ? 'is-unknown' : met ? 'is-met' : 'is-below'}`}>
                    <div><span className={`segment segment--${segment}`}>{segmentNames[segment]}</span><strong>{actual ?? '—'}<small> / {target ?? '—'}</small></strong><em>{status}</em></div>
                    <Field label="PEs qualificados"><input inputMode="numeric" type="number" min="0" value={actual ?? ''} placeholder="—" onChange={(event) => patchVisit({ extraPoints: { ...visit.extraPoints, qualifying: { ...visit.extraPoints.qualifying, [segment]: numberValue(event.target.value) } } })} /></Field>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="cooler-card">
            <div className="requirement-head"><div><h3>Geladeira</h3><p>Prontidão do equipamento para o tour.</p></div><Snowflake size={26} /></div>
            <div className="check-row"><p>Equipamentos inspecionados?</p><BooleanChoice value={visit.cooler.inspected} onChange={(value) => patchVisit({ cooler: { ...visit.cooler, inspected: value } })} /></div>
            <div className="check-row"><p>Posicionamento está correto?</p><BooleanChoice value={visit.cooler.correctlyPositioned} onChange={(value) => patchVisit({ cooler: { ...visit.cooler, correctlyPositioned: value } })} /></div>
            <Field label="SOVI gelado (%)"><input type="number" min="0" max="100" value={visit.cooler.coldSovi ?? ''} onChange={(event) => patchVisit({ cooler: { ...visit.cooler, coldSovi: numberValue(event.target.value) } })} /></Field>
          </Card>
          <Card tone="amber">
            <h3>Precificação FDS · 5 pontos provisórios</h3>
            <p>Todos os produtos avaliados têm etiqueta/preço visível conforme o critério provisório?</p>
            <BooleanChoice value={visit.fdsPriceExecution} onChange={(value) => patchVisit({ fdsPriceExecution: value })} />
            <small>Não é calculado a partir da régua de preço. A fórmula oficial aguarda homologação.</small>
          </Card>
        </div>
      )}

      {current.id === 'prices' && (
        <div className="stack">
          <SectionTitle eyebrow="5 · Régua de preço" title="Um preço observado, duas possibilidades válidas" description="O valor deve ser exatamente o Regular OU o Promocional da combinação RJ/canal/SKU/agosto." />
          <Card>
            <div className="add-price">
              <select value={selectedPrice} onChange={(event) => setSelectedPrice(event.target.value)}>
                <option value="">Selecione um SKU para avaliar</option>
                {availablePrices.map((entry) => <option key={entry.id} value={entry.id}>{entry.segment} · {entry.brand} · {entry.sku}</option>)}
              </select>
              <button type="button" className="icon-button" onClick={addPrice} disabled={!selectedPrice}><Plus size={20} /> Adicionar</button>
            </div>
          </Card>
          {visit.priceObservations.length === 0 ? (
            <Card tone="amber"><p>Adicione pelo menos um SKU observado para calcular a conformidade.</p></Card>
          ) : visit.priceObservations.map((observation) => {
            const result = priceEvaluation.results.find((item) => item.observationId === observation.id);
            const entry = result?.entry ?? availablePrices.find((item) => item.id === observation.rulerEntryId);
            return (
              <Card key={observation.id} className="price-observation" tone={result?.status === 'outside' || result?.status === 'missing-ruler' ? 'red' : result?.status === 'regular' || result?.status === 'promotional' ? 'green' : result?.status === 'invalid' ? 'amber' : 'default'}>
                <div className="requirement-head">
                  <div><span className="segment">{entry?.segment ?? 'Sem régua'}</span><h3>{entry ? `${entry.brand} · ${entry.sku}` : observation.rulerEntryId}</h3>{entry && <p>Regular R$ {entry.regular.toFixed(2)} OU Promo R$ {entry.promotional.toFixed(2)}</p>}</div>
                  <button type="button" className="ghost-icon" aria-label="Remover item da régua" onClick={() => patchVisit({ priceObservations: visit.priceObservations.filter((item) => item.id !== observation.id) })}><Trash2 size={19} /></button>
                </div>
                <Field label="Preço observado (R$)">
                  <div className="price-input-row">
                    <input aria-label={`Preço observado de ${entry ? `${entry.brand} ${entry.sku}` : observation.rulerEntryId}`} inputMode="decimal" type="number" min="0" step="0.01" value={observation.observed ?? ''} placeholder="Não avaliado" onChange={(event) => patchVisit({ priceObservations: visit.priceObservations.map((item) => item.id === observation.id ? { ...item, observed: numberValue(event.target.value) } : item) })} />
                    {observation.observed !== null && <button type="button" className="clear-price" aria-label={`Limpar preço de ${entry?.brand ?? 'item'}`} onClick={() => setVisit((previous) => clearPriceObservation(previous, observation.id))}><Eraser size={17} /> Limpar preço</button>}
                  </div>
                </Field>
                {result?.status === 'regular' && <p className="status-line is-ok"><CheckCircle2 size={17} /> Conforme pelo preço regular</p>}
                {result?.status === 'promotional' && <p className="status-line is-ok"><CheckCircle2 size={17} /> Conforme pelo preço promocional</p>}
                {result?.status === 'outside' && <p className="status-line is-bad"><AlertTriangle size={17} /> Fora da régua</p>}
                {result?.status === 'missing-ruler' && <p className="status-line is-bad"><AlertTriangle size={17} /> Sem régua vigente para canal, UF e data</p>}
                {result?.status === 'invalid' && <p className="status-line is-warn"><AlertTriangle size={17} /> Valor inválido; corrija ou limpe</p>}
                {result?.status === 'unanswered' && <p className="status-line is-neutral"><Eraser size={17} /> Não avaliado · fora do denominador</p>}
              </Card>
            );
          })}
        </div>
      )}

      <div className="flow-actions">
        <button type="button" className="button button--secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => value - 1)}><ArrowLeft size={18} /> Voltar</button>
        <button type="button" className="button button--primary" onClick={next}>{stepIndex === steps.length - 1 ? 'Ver diagnóstico' : 'Continuar'} <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
