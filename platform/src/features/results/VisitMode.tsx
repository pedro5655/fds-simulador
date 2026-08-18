import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Beer,
  Check,
  FileText,
  Flag,
  Handshake,
  Play,
  RotateCcw,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Store,
  TriangleAlert,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import {
  buildVisitGuide,
  createVisitGuideDraft,
  type PlanogramAnswer,
  type VisitGuideDraft,
  type VisitGuideMoment,
} from './visit-guide';

const momentIcons: Record<VisitGuideMoment['icon'], LucideIcon> = {
  handshake: Handshake,
  shield: ShieldCheck,
  beer: Beer,
  sparkles: Sparkles,
  snowflake: Snowflake,
  flag: Flag,
};

const patchSegment = (
  draft: VisitGuideDraft,
  segment: 'craft' | 'premium' | 'mainstream',
  patch: Partial<VisitGuideDraft['segments']['craft']>,
) => ({
  ...draft,
  segments: {
    ...draft.segments,
    [segment]: { ...draft.segments[segment], ...patch },
  },
});

export function VisitMode() {
  const [draft, setDraft] = useState(createVisitGuideDraft);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [rehearsal, setRehearsal] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const firstStageRender = useRef(true);
  const moments = useMemo(() => buildVisitGuide(draft), [draft]);
  const current = moments[activeIndex];
  const completed = moments.filter((moment) => done[moment.id]).length;
  const Icon = momentIcons[current.icon];

  const goTo = (index: number) => {
    const nextIndex = Math.max(0, Math.min(moments.length - 1, index));
    setDirection(nextIndex < activeIndex ? 'back' : 'forward');
    setActiveIndex(nextIndex);
  };
  const toggleCurrent = () => setDone((previous) => ({ ...previous, [current.id]: !previous[current.id] }));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && videoModalOpen) {
        setVideoModalOpen(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select')) return;
      if (event.key === 'ArrowRight') {
        setDirection('forward');
        setActiveIndex((index) => Math.min(moments.length - 1, index + 1));
      }
      if (event.key === 'ArrowLeft') {
        setDirection('back');
        setActiveIndex((index) => Math.max(0, index - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moments.length, videoModalOpen]);

  useEffect(() => {
    if (firstStageRender.current) {
      firstStageRender.current = false;
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stageRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [activeIndex]);

  const segment = current.id === 'craft' || current.id === 'premium' || current.id === 'mainstream'
    ? current.id
    : null;

  const setPlanogram = (value: PlanogramAnswer) => {
    if (!segment) return;
    setDraft((previous) => patchSegment(previous, segment, { planogram: value }));
  };

  return (
    <div className="visit-experience visit-guide">
      <header className="visit-command">
        <div className="visit-command__title">
          <span>Modo Visita</span>
          <strong>{rehearsal ? 'Ensaio do percurso' : 'Guia de condução'}</strong>
        </div>
        <div className="visit-command__progress">
          <div><span>Momento {activeIndex + 1} de {moments.length} · {completed} {completed === 1 ? 'etapa concluída' : 'etapas concluídas'}</span><strong>{Math.round(((activeIndex + 1) / moments.length) * 100)}%</strong></div>
          <ProgressBar value={((activeIndex + 1) / moments.length) * 100} />
        </div>
        <div className="visit-command__actions">
          <button
            type="button"
            className="training-video-btn"
            onClick={() => setVideoModalOpen(true)}
            aria-haspopup="dialog"
          >
            <Play size={15} /> Vídeo de Treinamento
          </button>
          <button
            type="button"
            className={rehearsal ? 'rehearsal-toggle is-active' : 'rehearsal-toggle'}
            aria-pressed={rehearsal}
            onClick={() => setRehearsal((value) => !value)}
          >
            <RotateCcw size={15} /> {rehearsal ? 'Ensaio ativo' : 'Ensaiar antes'}
          </button>
        </div>
      </header>

      <div className="guide-separation-note">
        <span>Guia independente</span>
        <p>Placeholders e anotações manuais para treinar a fala. Não altera nem reproduz o diagnóstico da loja.</p>
      </div>

      <div className="visit-workspace">
        <nav className="visit-timeline" aria-label="Oito momentos da visita">
          {moments.map((moment, index) => {
            const MomentIcon = momentIcons[moment.icon];
            return (
              <button key={moment.id} type="button" aria-current={index === activeIndex ? 'step' : undefined} className={index === activeIndex ? 'is-active' : done[moment.id] ? 'is-done' : ''} onClick={() => goTo(index)}>
                <span>{done[moment.id] ? <Check size={15} /> : <MomentIcon size={15} />}</span>
                <div><small>{String(index + 1).padStart(2, '0')}</small><strong>{moment.phase}</strong></div>
              </button>
            );
          })}
        </nav>

        <section ref={stageRef} className={`visit-stage visit-stage--${direction}`} aria-live="polite" key={current.id}>
          <div className="visit-stage__topline"><span>Momento {String(activeIndex + 1).padStart(2, '0')} / 08</span><span>{rehearsal ? 'Ensaio · não registra visita real' : 'Roteiro de apresentação'}</span></div>
          <div className="visit-moment">
            <div className="visit-moment__intro">
              <span className="visit-moment__number" aria-hidden="true">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="visit-moment__icon"><Icon size={29} /></span>
              <div><span>{current.phase}</span><h1>{current.title}</h1></div>
            </div>

            <section className="suggested-speech">
              <div className="moment-label"><Volume2 size={17} /> Fala sugerida</div>
              <blockquote>“{current.speech}”</blockquote>
            </section>

            <section className="show-this">
              <div className="moment-label"><Store size={16} /> O que fazer e mostrar</div>
              <div className="guide-chips">{current.show.map((item) => <span key={item}>{item}</span>)}</div>
            </section>

            {current.example && <aside className="guide-example"><strong>Exemplo — ajuste à loja</strong><p>{current.example}</p></aside>}
            {current.reminder && <aside className="guide-reminder"><TriangleAlert size={18} /><p>{current.reminder}</p></aside>}

            {current.editor && (
              <details className="guide-editor" open={rehearsal}>
                <summary>Personalizar esta fala</summary>
                <p>Campos do ensaio. Não alteram a avaliação nem são salvos no rascunho.</p>
                {current.editor === 'reception' && (
                  <div className="guide-editor__grid">
                    <label>Meu nome<input value={draft.presenterName} placeholder="Ex.: Ana" onChange={(event) => setDraft((previous) => ({ ...previous, presenterName: event.target.value }))} /></label>
                    <label>Tempo de companhia<input value={draft.companyTime} placeholder="Ex.: 2 anos" onChange={(event) => setDraft((previous) => ({ ...previous, companyTime: event.target.value }))} /></label>
                    <label>Tempo atendendo a loja<input value={draft.storeTime} placeholder="Ex.: 8 meses" onChange={(event) => setDraft((previous) => ({ ...previous, storeTime: event.target.value }))} /></label>
                    <label>Colega que conduzirá (opcional)<input value={draft.colleagueName} placeholder="Deixe vazio se você conduzirá" onChange={(event) => setDraft((previous) => ({ ...previous, colleagueName: event.target.value }))} /></label>
                  </div>
                )}
                {current.editor === 'safety' && <label>Outros EPIs<input value={draft.otherEpis} placeholder="Ex.: bota de segurança" onChange={(event) => setDraft((previous) => ({ ...previous, otherEpis: event.target.value }))} /></label>}
                {current.editor === 'segment' && segment && (
                  <div className="guide-editor__grid">
                    <label>Resultado da loja (%)<input inputMode="decimal" value={draft.segments[segment].result} placeholder="X" onChange={(event) => setDraft((previous) => patchSegment(previous, segment, { result: event.target.value }))} /></label>
                    <fieldset className="guide-planogram"><legend>Segue o planograma?</legend><div>
                      <button type="button" aria-pressed={draft.segments[segment].planogram === 'yes'} onClick={() => setPlanogram('yes')}>Sim</button>
                      <button type="button" aria-pressed={draft.segments[segment].planogram === 'no'} onClick={() => setPlanogram('no')}>Não</button>
                      <button type="button" aria-pressed={draft.segments[segment].planogram === 'unanswered'} onClick={() => setPlanogram('unanswered')}>Não informado</button>
                    </div></fieldset>
                    {draft.segments[segment].planogram === 'no' && <label className="guide-editor__wide">Motivo informado<input value={draft.segments[segment].reason} placeholder="Não invente: registre o motivo real" onChange={(event) => setDraft((previous) => patchSegment(previous, segment, { reason: event.target.value }))} /></label>}
                  </div>
                )}
                {current.editor === 'extras' && (
                  <div className="guide-editor__grid guide-editor__grid--extras">
                    <label>Faixa da loja<input value={draft.extras.band} placeholder="Ex.: 11 a 15" onChange={(event) => setDraft((previous) => ({ ...previous, extras: { ...previous.extras, band: event.target.value } }))} /></label>
                    <label>Meta Premium<input inputMode="numeric" value={draft.extras.targetPremium} placeholder="X" onChange={(event) => setDraft((previous) => ({ ...previous, extras: { ...previous.extras, targetPremium: event.target.value } }))} /></label>
                    <label>Meta Mainstream<input inputMode="numeric" value={draft.extras.targetMainstream} placeholder="X" onChange={(event) => setDraft((previous) => ({ ...previous, extras: { ...previous.extras, targetMainstream: event.target.value } }))} /></label>
                    <label>Meta Craft<input inputMode="numeric" value={draft.extras.targetCraft} placeholder="X" onChange={(event) => setDraft((previous) => ({ ...previous, extras: { ...previous.extras, targetCraft: event.target.value } }))} /></label>
                    <label>Execução Premium<input inputMode="numeric" value={draft.extras.actualPremium} placeholder="X" onChange={(event) => setDraft((previous) => ({ ...previous, extras: { ...previous.extras, actualPremium: event.target.value } }))} /></label>
                    <label>Execução Mainstream<input inputMode="numeric" value={draft.extras.actualMainstream} placeholder="X" onChange={(event) => setDraft((previous) => ({ ...previous, extras: { ...previous.extras, actualMainstream: event.target.value } }))} /></label>
                    <label>Execução Craft<input inputMode="numeric" value={draft.extras.actualCraft} placeholder="X" onChange={(event) => setDraft((previous) => ({ ...previous, extras: { ...previous.extras, actualCraft: event.target.value } }))} /></label>
                  </div>
                )}
              </details>
            )}
          </div>

          <div className="visit-controls">
            <button type="button" className="visit-control visit-control--back" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)}><ArrowLeft size={18} /> Anterior</button>
            <button type="button" className={done[current.id] ? 'visit-complete is-done' : 'visit-complete'} onClick={toggleCurrent}>{done[current.id] ? <Check size={19} /> : <Store size={19} />}{done[current.id] ? 'Etapa concluída' : 'Marcar como concluída'}</button>
            <button type="button" className="visit-control visit-control--next" disabled={activeIndex === moments.length - 1} onClick={() => goTo(activeIndex + 1)}>Próximo <ArrowRight size={18} /></button>
          </div>
        </section>
      </div>

      <details className="safety-dock">
        <summary><ShieldCheck size={19} /><span>Segurança sempre acessível</span><strong>Observar</strong></summary>
        <div>
          <p><strong>Risco real.</strong> Alerte no momento em que for observado.</p>
          <p><strong>Empilhadeira.</strong> Mantenha a distância segura indicada pela operação.</p>
          <p><strong>Piso molhado ou avaria.</strong> Pare, sinalize e comunique.</p>
          <p><strong>Outro risco.</strong> Não presuma; descreva apenas o que estiver presente.</p>
        </div>
      </details>

      {videoModalOpen && (
        <div
          className="training-video-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVideoModalOpen(false);
          }}
        >
          <div
            className="training-video-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
          >
            <header className="training-video-modal__header">
              <div>
                <span className="training-video-modal__eyebrow">Treinamento · 8 Momentos</span>
                <h2 id="video-modal-title">Rotina de Condução em Loja</h2>
              </div>
              <button
                type="button"
                className="training-video-modal__close"
                aria-label="Fechar vídeo de treinamento"
                onClick={() => setVideoModalOpen(false)}
              >
                <X size={20} />
              </button>
            </header>

            <div className="training-video-modal__body">
              <div className="training-video-container">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/training/rotina-visita-poster.jpg"
                  className="training-video-player"
                  aria-label="Vídeo de treinamento da rotina de visita com Pedro"
                >
                  <source src="/training/rotina-visita.mp4" type="video/mp4" />
                  <track
                    src="/training/rotina-visita.pt-BR.vtt"
                    kind="subtitles"
                    srcLang="pt-BR"
                    label="Português (Brasil)"
                    default
                  />
                  Seu navegador não suporta reprodução de vídeo HTML5.
                </video>
              </div>

              <div className="training-video-info">
                <div className="training-video-notice">
                  <strong>Exemplo ilustrativo de rotina</strong>
                  <p>
                    Este vídeo demonstra a postura e condução sugerida nos 8 momentos.
                    As metas e dados apresentados são pedagógicos e não alteram a avaliação da loja.
                  </p>
                </div>

                <details className="training-video-transcript">
                  <summary>
                    <FileText size={16} /> Ver transcrição dos 8 momentos
                  </summary>
                  <div className="training-video-transcript__content">
                    <div className="transcript-moment">
                      <strong>01. Recepção e Apresentação</strong>
                      <p>“Olá, meu nome é Pedro. Tenho cinco anos de companhia e atendo esta loja há um ano. Eu conduzirei a visita de vocês pela loja.”</p>
                    </div>
                    <div className="transcript-moment">
                      <strong>02. Segurança antes de começar</strong>
                      <p>“Antes de começarmos, gostaria de sinalizar as saídas de emergência. Aproveitando que estamos falando de segurança, quero mostrar também os EPIs que utilizo: luvas e óculos de proteção.”</p>
                    </div>
                    <div className="transcript-moment">
                      <strong>03. Seção Craft</strong>
                      <p>“Aqui é o nosso espaço de Craft. Executamos as cervejas da mais escura para a mais clara, seguindo o planograma da companhia. Nossa meta na categoria é 53% e hoje estamos em X%.”</p>
                    </div>
                    <div className="transcript-moment">
                      <strong>04. Seção Premium</strong>
                      <p>“Aqui está a categoria Premium. Apresentamos o planograma e os principais destaques da execução. Nossa meta é 57% e hoje estamos em X%.”</p>
                    </div>
                    <div className="transcript-moment">
                      <strong>05. Seção Mainstream</strong>
                      <p>“Na categoria Mainstream, mostramos a organização e a presença dos produtos. Nossa meta é 25% e hoje estamos em X%.”</p>
                    </div>
                    <div className="transcript-moment">
                      <strong>06. Pontos Extras</strong>
                      <p>“Neste exemplo, a loja está na faixa de 11 a 15 pontos extras. A meta é três Premium, dois Mainstream e um Craft. Hoje estamos executando X em cada categoria.”</p>
                    </div>
                    <div className="transcript-moment">
                      <strong>07. Geladeira</strong>
                      <p>“Agora apresentamos a geladeira: organização, disponibilidade e qualidade da execução. É o momento de destacar o cuidado aplicado no ponto de venda.”</p>
                    </div>
                    <div className="transcript-moment">
                      <strong>08. Retorno à porta e QR Code</strong>
                      <p>“Agora, convido vocês a escanear o QR Code no meu celular para uma avaliação rápida sobre a segurança durante a visita. Agradeço pela presença e lembro: os nossos cuidados não terminam na loja. Segurança é sempre em primeiro lugar.”</p>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
