export type PlanogramAnswer = 'yes' | 'no' | 'unanswered';

export type VisitGuideDraft = {
  presenterName: string;
  companyTime: string;
  storeTime: string;
  colleagueName: string;
  otherEpis: string;
  segments: Record<'craft' | 'premium' | 'mainstream', {
    result: string;
    planogram: PlanogramAnswer;
    reason: string;
  }>;
  extras: {
    band: string;
    targetPremium: string;
    targetMainstream: string;
    targetCraft: string;
    actualPremium: string;
    actualMainstream: string;
    actualCraft: string;
  };
};

export type VisitGuideMoment = {
  id: 'reception' | 'safety' | 'craft' | 'premium' | 'mainstream' | 'extras' | 'cooler' | 'closing';
  phase: string;
  title: string;
  icon: 'handshake' | 'shield' | 'beer' | 'sparkles' | 'snowflake' | 'flag';
  show: string[];
  speech: string;
  reminder?: string;
  example?: string;
  editor?: 'reception' | 'safety' | 'segment' | 'extras';
};

export const VISIT_GUIDE_TARGETS = {
  craft: 53,
  premium: 57,
  mainstream: 25,
} as const;

export const createVisitGuideDraft = (): VisitGuideDraft => ({
  presenterName: '',
  companyTime: '',
  storeTime: '',
  colleagueName: '',
  otherEpis: '',
  segments: {
    craft: { result: '', planogram: 'unanswered', reason: '' },
    premium: { result: '', planogram: 'unanswered', reason: '' },
    mainstream: { result: '', planogram: 'unanswered', reason: '' },
  },
  extras: {
    band: '',
    targetPremium: '',
    targetMainstream: '',
    targetCraft: '',
    actualPremium: '',
    actualMainstream: '',
    actualCraft: '',
  },
});

const shown = (value: string, placeholder: string) => value.trim() || placeholder;

const planogramLine = (answer: PlanogramAnswer, reason: string) => {
  if (answer === 'yes') return 'Estamos seguindo o planograma da companhia.';
  if (answer === 'no') return `Não estamos seguindo integralmente por: ${shown(reason, '____')}.`;
  return '[Confirmar se seguimos o planograma; se não, registrar o motivo.]';
};

const segmentMoment = (
  segment: 'craft' | 'premium' | 'mainstream',
  label: string,
  draft: VisitGuideDraft,
): VisitGuideMoment => {
  const practice = draft.segments[segment];
  const target = VISIT_GUIDE_TARGETS[segment];

  const introSpeech =
    segment === 'craft'
      ? 'Aqui é o nosso espaço de Craft. Executamos as cervejas da mais escura para a mais clara.'
      : segment === 'premium'
        ? 'Aqui está a categoria Premium. Apresentamos o planograma e os principais destaques da execução.'
        : 'Na categoria Mainstream, mostramos a organização e a presença dos produtos.';

  return {
    id: segment,
    phase: label,
    title: `Apresente a seção ${label}`,
    icon: 'beer',
    show: [`Seção ${label}`, 'Ordem dos produtos', 'Planograma', 'Espaço executado'],
    speech: `${introSpeech} ${planogramLine(practice.planogram, practice.reason)} A meta da categoria é ${target}% e hoje estamos em ${shown(practice.result, 'X')}%.`,
    reminder: 'Use apenas o valor confirmado para esta loja. Se ainda não souber, mantenha X% no ensaio.',
    editor: 'segment',
  };
};

export function buildVisitGuide(draft: VisitGuideDraft): VisitGuideMoment[] {
  const colleague = draft.colleagueName.trim();
  const conductor = colleague
    ? `${colleague} conduzirá a visita de vocês pela loja.`
    : 'Eu conduzirei a visita de vocês pela loja.';
  const extras = draft.extras;

  return [
    {
      id: 'reception',
      phase: 'Recepção',
      title: 'Apresente-se e assuma a condução',
      icon: 'handshake',
      show: ['Receber na entrada', 'Apresentar-se', 'Apresentar colega', 'Explicar o percurso'],
      speech: `Olá, meu nome é ${shown(draft.presenterName, '[nome]')}. Tenho ${shown(draft.companyTime, '[X anos]')} de companhia e atendo esta loja há ${shown(draft.storeTime, '[X tempo]')}. ${conductor}`,
      reminder: 'Se houver um colega, diga o nome dele. Caso contrário, assuma a condução em primeira pessoa.',
      editor: 'reception',
    },
    {
      id: 'safety',
      phase: 'Segurança',
      title: 'Antes de começar, mostre o cuidado',
      icon: 'shield',
      show: ['Apontar as saídas', 'Mostrar os EPIs', 'Confirmar rota segura', 'Iniciar o percurso'],
      speech: `Antes de começarmos, gostaria de sinalizar as saídas de emergência da loja. Aproveitando que estamos falando de segurança, quero mostrar também os EPIs que utilizo: luvas, óculos e ${shown(draft.otherEpis, '[outros EPIs]')}.`,
      reminder: 'Durante o percurso, alerte somente riscos reais observados: empilhadeira e distância segura, piso molhado, avaria ou outro risco presente.',
      editor: 'safety',
    },
    segmentMoment('craft', 'Craft', draft),
    segmentMoment('premium', 'Premium', draft),
    segmentMoment('mainstream', 'Mainstream', draft),
    {
      id: 'extras',
      phase: 'Pontos extras',
      title: 'Explique a faixa e conduza pelos pontos',
      icon: 'sparkles',
      show: ['Dizer a faixa da loja', 'Comparar meta e execução', 'Mostrar os pontos existentes', 'Valorizar o trabalho'],
      speech: `Esta é uma loja na faixa de ${shown(extras.band, '[faixa da loja]')} pontos extras. Para essa faixa, nossa meta é ${shown(extras.targetPremium, '[X]')} Premium, ${shown(extras.targetMainstream, '[X]')} Mainstream e ${shown(extras.targetCraft, '[X]')} Craft. Hoje estamos executando ${shown(extras.actualPremium, '[X]')} Premium, ${shown(extras.actualMainstream, '[X]')} Mainstream e ${shown(extras.actualCraft, '[X]')} Craft. Agora vou conduzi-los pelos pontos extras existentes.`,
      reminder: 'Cada loja tem sua individualidade. Ajuste faixa, metas e execução antes da visita.',
      example: 'Exemplo de ensaio: faixa de 11 a 15 pontos extras · meta de 3 Premium, 2 Mainstream e 1 Craft.',
      editor: 'extras',
    },
    {
      id: 'cooler',
      phase: 'Geladeira',
      title: 'Mostre disponibilidade e organização',
      icon: 'snowflake',
      show: ['Abrir a visão da geladeira', 'Mostrar organização', 'Destacar disponibilidade', 'Valorizar a execução'],
      speech: 'Aqui apresentamos a execução da geladeira: a organização dos itens, a disponibilidade de produto gelado e o cuidado diário para manter este espaço pronto para o shopper.',
      reminder: 'Fale do trabalho realizado. Ruptura e régua de preço permanecem no diagnóstico e no relatório.',
    },
    {
      id: 'closing',
      phase: 'Encerramento',
      title: 'Volte à porta, apresente o QR e agradeça',
      icon: 'flag',
      show: ['Retornar à porta', 'Apresentar o QR no celular', 'Aguardar a avaliação', 'Agradecer a visita'],
      speech: 'Agora gostaria de convidá-los a escanear este QR Code no meu celular. Ele abrirá uma avaliação rápida sobre a segurança durante a visita. Depois da avaliação: gostaria de agradecer pela visita e lembrar que os nossos cuidados não terminam na loja. Segurança é sempre em primeiro lugar.',
      reminder: 'O QR já deve estar disponível no celular. As perguntas verificam orientações de segurança, EPIs, saídas e conhecimento dos riscos da loja. Este guia não gera link nem QR.',
    },
  ];
}
