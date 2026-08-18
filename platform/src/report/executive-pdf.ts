import { jsPDF } from 'jspdf';
import { PRICE_RULER_VERSION } from '@/domain/rules/price-ruler';
import { RULESET_VERSION } from '@/domain/rules/rule-config';
import type { Gap, VisitDraft, VisitEvaluation } from '@/domain/rules/types';

const green = '#007a4d';
const dark = '#12322a';
const muted = '#64716d';
const red = '#b42318';
const amber = '#b75b00';

export function buildExecutivePdf(visit: VisitDraft, evaluation: VisitEvaluation): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = width - margin * 2;
  let y = 0;

  const ensure = (needed: number) => {
    if (y + needed > height - 18) {
      doc.addPage();
      doc.setFillColor(dark);
      doc.rect(0, 0, width, 14, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor('#ffffff');
      doc.text('VISITA EM CENA · RELATÓRIO EXECUTIVO', margin, 8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#b9cbc5');
      doc.text(visit.identity.storeName || 'Loja não informada', width - margin, 8.5, { align: 'right' });
      y = 23;
    }
  };

  const text = (value: string, options: { size?: number; bold?: boolean; color?: string; indent?: number; gap?: number } = {}) => {
    const size = options.size ?? 9;
    const indent = options.indent ?? 0;
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(options.color ?? dark);
    const lines = doc.splitTextToSize(value, contentWidth - indent);
    const lineHeight = size * 0.42;
    ensure(lines.length * lineHeight + (options.gap ?? 2));
    doc.text(lines, margin + indent, y);
    y += lines.length * lineHeight + (options.gap ?? 2);
  };

  const section = (title: string, subtitle?: string) => {
    ensure(18);
    y += 3;
    doc.setFillColor(green);
    doc.roundedRect(margin, y, 4, 10, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(dark);
    doc.text(title, margin + 8, y + 4.5);
    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(muted);
      doc.text(subtitle, margin + 8, y + 9);
    }
    y += 15;
  };

  const gapItem = (gap: Gap, index: number) => {
    ensure(20);
    doc.setFillColor(gap.severity === 'critical' ? '#fff0ee' : '#fff8e8');
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(gap.severity === 'critical' ? red : amber);
    doc.text(`${index + 1}. ${gap.title}`, margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(dark);
    const detail = doc.splitTextToSize(gap.detail, contentWidth - 26);
    doc.text(detail.slice(0, 2), margin + 4, y + 9);
    if (gap.recoverablePoints > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(green);
      doc.text(`+${gap.recoverablePoints} pts`, width - margin - 4, y + 5, { align: 'right' });
    }
    y += 19;
  };

  doc.setFillColor(dark);
  doc.rect(0, 0, width, 45, 'F');
  doc.setFillColor('#16a66a');
  doc.circle(width - 18, 11, 21, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VISITA EM CENA · USO INTERNO', margin, 12);
  doc.setFontSize(23);
  doc.text('Relatório Executivo', margin, 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Diagnóstico de loja e preparação de visita · Rock in Rio 2026', margin, 32);
  doc.setFontSize(8);
  doc.text(`${visit.identity.storeName || 'Loja não informada'} | ${visit.identity.visitDate}`, margin, 39);
  y = 55;

  text(`Loja: ${visit.identity.storeName || '-'} (${visit.identity.storeCode || 'sem código'})`, { bold: true, size: 11, gap: 1 });
  text(`Promotor(a): ${visit.identity.collaborator || '-'} | Canal: ${visit.identity.channel.toUpperCase()} | Formato: ${visit.identity.format.toUpperCase()} | UF: ${visit.identity.uf}`, { color: muted, gap: 5 });

  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap * 2) / 3;
  const metrics = [
    ['FDS oficial', `${evaluation.fds.total}/100`, 'Configuração provisória', green],
    ['Preço conforme', evaluation.price.percentage === null ? 'Não medido' : `${evaluation.price.percentage}%`, `${evaluation.price.conformingCount}/${evaluation.price.observedCount} observados`, '#1769aa'],
    ['Prontidão', `${evaluation.readiness.score}%`, evaluation.readiness.label, amber],
  ];
  metrics.forEach(([label, value, caption, color], index) => {
    const x = margin + index * (cardWidth + cardGap);
    doc.setFillColor('#f3f6f5');
    doc.roundedRect(x, y, cardWidth, 29, 3, 3, 'F');
    doc.setTextColor(color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(label, x + 4, y + 7);
    doc.setFontSize(17);
    doc.text(value, x + 4, y + 17);
    doc.setTextColor(muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(caption, x + 4, y + 24);
  });
  y += 37;

  section('Composição FDS', 'A nota, o preço e a prontidão permanecem independentes.');
  const pillarRows = [
    ['Presença', evaluation.fds.pillars.presence, 40],
    ['Posicionamento', evaluation.fds.pillars.positioning, 35],
    ['Visibilidade', evaluation.fds.pillars.visibility, 20],
    ['Precificação FDS', evaluation.fds.pillars.pricing, 5],
  ] as const;
  pillarRows.forEach(([label, value, maximum]) => {
    ensure(8);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(label, margin, y + 3);
    doc.setFillColor('#e5ece9');
    doc.roundedRect(margin + 43, y, contentWidth - 58, 4, 2, 2, 'F');
    doc.setFillColor(green);
    doc.roundedRect(margin + 43, y, (contentWidth - 58) * (value / maximum), 4, 2, 2, 'F');
    doc.text(`${value}/${maximum}`, width - margin, y + 3, { align: 'right' });
    y += 8;
  });

  section('SOVI por segmento');
  (['craft', 'premium', 'mainstream'] as const).forEach((segment) => {
    const item = evaluation.fds.shares[segment];
    text(`${segment.toUpperCase()}: ${item.value === null ? 'não medido' : `${item.value}%`} | meta ${item.target}% | ${item.met ? 'atingida' : 'abaixo/pendente'}`, { bold: true, color: item.met ? green : red, gap: 1 });
  });

  section('Prioridades e ganhos recuperáveis', 'Ordenadas pelo impacto calculado.');
  const topGaps = evaluation.prioritizedGaps.filter((gap) => gap.metric !== 'readiness').slice(0, 6);
  if (!topGaps.length) text('Nenhuma lacuna prioritária registrada.');
  topGaps.forEach(gapItem);

  section('Rupturas e alternativas OR');
  const ruptures = evaluation.fds.gaps.filter((gap) => gap.id.startsWith('presence:'));
  if (!ruptures.length) text('Nenhuma perda de presença registrada nas colocações aplicáveis.');
  ruptures.slice(0, 12).forEach((gap) => text(`- ${gap.title}: ${gap.detail}`, { size: 8, gap: 1 }));
  if (ruptures.length > 12) text(`Mais ${ruptures.length - 12} lacuna(s) de presença no diagnóstico digital.`, { size: 8, color: muted });

  section('Régua de preço', 'Valores ausentes ficam fora do denominador e não são divergências.');
  const priceGaps = evaluation.price.gaps.filter((gap) => !gap.id.endsWith(':unanswered') && !gap.id.endsWith(':invalid'));
  const pricePending = evaluation.price.gaps.filter((gap) => gap.id.endsWith(':unanswered') || gap.id.endsWith(':invalid'));
  if (!priceGaps.length) text(evaluation.price.observedCount ? 'Nenhuma divergência confirmada entre os preços observados.' : 'Nenhum preço entrou no denominador de conformidade.');
  priceGaps.forEach((gap) => text(`- ${gap.title}: ${gap.detail}`, { size: 8, gap: 1 }));
  if (pricePending.length) {
    text(`Pendências de coleta (${pricePending.length})`, { bold: true, color: amber, size: 8, gap: 1 });
    pricePending.forEach((gap) => text(`- ${gap.title}: ${gap.detail}`, { size: 8, color: muted, gap: 1 }));
  }

  section('Plano de ação', 'Somente informações fornecidas pela equipe.');
  const plans = Object.entries(visit.actions).filter(([, plan]) => plan.cause || plan.action || plan.owner || plan.dueDate);
  if (!plans.length) text('Nenhum plano de ação informado. O sistema não inventou causas ou responsáveis.');
  plans.slice(0, 8).forEach(([gapId, plan], index) => {
    const gap = evaluation.prioritizedGaps.find((item) => item.id === gapId);
    ensure(27);
    text(`${index + 1}. ${gap?.title ?? gapId}`, { bold: true, size: 9, gap: 1 });
    text(`Causa: ${plan.cause || 'não informada'} | Ação: ${plan.action || 'não informada'} | Responsável: ${plan.owner || 'não informado'} | Prazo: ${plan.dueDate || 'não informado'}`, { size: 8, indent: 3, gap: 3 });
  });

  section('Guia de condução', 'Oito momentos genéricos; personalize os valores no ensaio antes da visita.');
  const route = [
    '1. Recepção: apresentação pessoal, tempo de companhia e condução do percurso.',
    '2. Segurança: apontar saídas de emergência, mostrar EPIs e iniciar a rota.',
    '3. Craft: mostrar seção, ordem, planograma e citar meta fixa de 53% com o valor confirmado da loja.',
    '4. Premium: mostrar seção, ordem, planograma e citar meta fixa de 57% com o valor confirmado da loja.',
    '5. Mainstream: mostrar seção, ordem, planograma e citar meta fixa de 25% com o valor confirmado da loja.',
    '6. Pontos extras: explicar faixa, meta e execução da loja; depois conduzir pelos pontos existentes.',
    '7. Geladeira: apresentar disponibilidade, organização e o trabalho realizado.',
    '8. Encerramento: retornar à porta, apresentar o QR de avaliação de segurança já disponível no celular e agradecer.',
  ];
  route.forEach((item) => text(item, { size: 8.5, gap: 1 }));

  section('Governança da avaliação');
  text(`Motor FDS: ${RULESET_VERSION.label} (${RULESET_VERSION.id}).`, { bold: true, size: 8, gap: 1 });
  text(`Régua: ${PRICE_RULER_VERSION.label} (${PRICE_RULER_VERSION.id}).`, { bold: true, size: 8, gap: 1 });
  text('Pendências conhecidas: matriz de atacado e fórmula parcial/binária aguardam homologação. Todos os pilares são limitados aos respectivos tetos.', { size: 8, color: muted });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor('#d9e3df');
    doc.line(margin, height - 12, width - margin, height - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(muted);
    doc.text(`Visita em Cena | ${visit.id}`, margin, height - 7);
    const pageLabel = `Página ${page} de ${pages}`;
    doc.text(pageLabel, width - margin - doc.getTextWidth(pageLabel), height - 7);
  }
  return doc;
}

export function downloadExecutivePdf(visit: VisitDraft, evaluation: VisitEvaluation): void {
  const safeStore = (visit.identity.storeName || 'loja')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
  buildExecutivePdf(visit, evaluation).save(`relatorio-executivo-${safeStore}.pdf`);
}
