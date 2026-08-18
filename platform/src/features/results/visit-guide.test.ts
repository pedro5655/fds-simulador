import { describe, expect, it } from 'vitest';
import { buildVisitGuide, createVisitGuideDraft, VISIT_GUIDE_TARGETS } from './visit-guide';

describe('guia independente do Modo Visita', () => {
  it('mantém exatamente os oito momentos na sequência aprovada', () => {
    const moments = buildVisitGuide(createVisitGuideDraft());

    expect(moments).toHaveLength(8);
    expect(moments.map((moment) => moment.id)).toEqual([
      'reception',
      'safety',
      'craft',
      'premium',
      'mainstream',
      'extras',
      'cooler',
      'closing',
    ]);
  });

  it('não inclui maturidade nem certificado no conteúdo do roteiro', () => {
    const content = JSON.stringify(buildVisitGuide(createVisitGuideDraft())).toLowerCase();

    expect(content).not.toContain('maturidade');
    expect(content).not.toContain('certificado');
  });

  it('usa as metas fixas 53, 57 e 25 com resultado manual X', () => {
    const moments = buildVisitGuide(createVisitGuideDraft());

    expect(VISIT_GUIDE_TARGETS).toEqual({ craft: 53, premium: 57, mainstream: 25 });
    expect(moments.find((moment) => moment.id === 'craft')?.speech).toContain('meta da categoria é 53%');
    expect(moments.find((moment) => moment.id === 'premium')?.speech).toContain('meta da categoria é 57%');
    expect(moments.find((moment) => moment.id === 'mainstream')?.speech).toContain('meta da categoria é 25%');
    expect(moments.filter((moment) => ['craft', 'premium', 'mainstream'].includes(moment.id)).every((moment) => moment.speech.includes('X%'))).toBe(true);
  });

  it('menciona o QR somente no encerramento', () => {
    const moments = buildVisitGuide(createVisitGuideDraft());
    const withQr = moments.filter((moment) => `${moment.speech} ${moment.reminder ?? ''}`.toLowerCase().includes('qr'));

    expect(withQr.map((moment) => moment.id)).toEqual(['closing']);
  });

  it('é construído apenas com o rascunho manual do ensaio', () => {
    const draft = createVisitGuideDraft();
    draft.presenterName = 'Ana';
    draft.segments.craft.result = '55';
    draft.segments.craft.planogram = 'no';
    draft.segments.craft.reason = 'ajuste de espaço informado pela loja';
    const moments = buildVisitGuide(draft);

    expect(moments[0].speech).toContain('Ana');
    expect(moments.find((moment) => moment.id === 'craft')?.speech).toContain('55%');
    expect(moments.find((moment) => moment.id === 'craft')?.speech).toContain('ajuste de espaço informado pela loja');
  });

  it('aplica a regra "mais escura para a mais clara" unicamente em Craft', () => {
    const moments = buildVisitGuide(createVisitGuideDraft());
    const phrase = 'mais escura para a mais clara';
    const matches = moments.filter((m) => m.speech.includes(phrase));

    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('craft');

    const premium = moments.find((m) => m.id === 'premium')?.speech;
    const mainstream = moments.find((m) => m.id === 'mainstream')?.speech;
    expect(premium).not.toContain(phrase);
    expect(mainstream).not.toContain(phrase);
    expect(premium).toContain('categoria Premium');
    expect(mainstream).toContain('categoria Mainstream');
  });
});

