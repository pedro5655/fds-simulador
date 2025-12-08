# Simulador FDS - Heineken Brasil 🍻

> **Fotografia de Sucesso (FDS)** - Ferramenta de Simulação e Auditoria de Execução no Ponto de Venda.

Este projeto é uma **Web Application (SPA)** desenvolvida para auxiliar colaboradores e representantes da Heineken Brasil na execução perfeita em lojas. O aplicativo permite simular cenários, calcular Share de Gôndola (SOVI), auditar presença, preços e validade de produtos, e gerar relatórios PDF detalhados diretamente pelo celular.

---

## 🚀 Funcionalidades Principais

O aplicativo é dividido em 4 módulos principais:

### 1. 📊 Simulador de Share & FDS

- **Cálculo de Share**: Input rápido de cm lineares da concorrência e da Heineken por categoria (Premium, Mainstream, Craft, etc.).
- **Auditoria de Presença**: Checklist de produtos obrigatórios em gôndola e geladeira.
- **Auditoria de Pontos Extras**: Regras de pontuação baseadas na quantidade de pontos extras (Total Pés) e mix de produtos.
- **Scoring Automático**: Cálculo em tempo real da nota da loja (0 a 100), com feedback visual (Verde, Amarelo, Vermelho).
- **Relatório Completo**: Geração de PDF com duas páginas (Resumo Executivo + Detalhamento).

### 2. ⚠️ Controle de Rupturas

- **Gestão de Disponibilidade**: Identifique itens em falta (Ruptura), Baixo Volume ou Não Cadastrados.
- **Cálculo de Perda**: Visualização imediata de quantos pontos de auditoria estão sendo perdidos por indisponibilidade.
- **Ações Rápidas**: Interface otimizada para marcação rápida de status por SKU.

### 3. 📅 Controle de Validade

- **Monitoramento de Datas**: Registro de datas de vencimento e quantidade de produtos.
- **Status Visual**: Alertas automáticos para produtos Vencidos (Vermelho) ou Críticos (< 30 dias, Amarelo).
- **Relatório Específico**: PDF focado em prevenção de perdas por validade.

### 4. 🏷️ Régua de Preço

- **Auditoria de Preços**: Comparativo entre Preço Sugerido (Régua) vs. Preço Praticado na Loja.
- **Validação Automática**: O sistema destaca automaticamente divergências de preço.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com uma arquitetura **Single File** para máxima portabilidade e facilidade de uso, sem necessidade de build complexo.

- **[React](https://react.dev/)**: Biblioteca JavaScript para construção da interface (via CDN).
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de CSS utilitário para estilização rápida e responsiva (via CDN).
- **[Babel](https://babeljs.io/)**: Compilador JavaScript para interpretar JSX no navegador.
- **[html2canvas](https://html2canvas.hertzen.com/)**: Captura de telas para geração de imagens dos relatórios.
- **[jsPDF](https://github.com/parallax/jsPDF)**: Geração de arquivos PDF no cliente (Client-side).

---

## 📱 Mobile First

A interface foi desenhada pensando primeiramente na experiência em dispositivos móveis:

- Botões grandes e áreas de toque otimizadas.
- Fontes legíveis sem necessidade de zoom.
- Layouts responsivos que se adaptam a diferentes tamanhos de tela.
- Relatórios PDF formatados especificamente para serem lidos em telas de celular (Layout A4 com fontes ampliadas).

---

## 📦 Como Usar

Não é necessário instalar Node.js ou rodar comandos de build (`npm start`, etc) para utilizar a versão final em produção, pois o projeto roda diretamente no navegador.

### Opção 1: Uso Local Simples

1. Baixe o arquivo `index.html` e a pasta de imagens (se houver).
2. Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Safari do iPhone).
   > **Nota**: Funcionalidades que dependem de carregamento de scripts externos precisam de conexão com a internet.

### Opção 2: Desenvolvimento Local (Recomendado)

Para editar o código e testar sem problemas de CORS (segurança do navegador):

1. Tenha o [VS Code](https://code.visualstudio.com/) instalado.
2. Instale a extensão **"Live Server"**.
3. Clique com o botão direito no `index.html` e selecione **"Open with Live Server"**.

---

## 📄 Estrutura do Projeto

O código fonte está concentrado principalmente no `index.html` para facilitar o compartilhamento:

```
/
├── index.html       # Aplicação completa (Logica React + Estilos + HTML)
└── favicon.png      # Ícone da aplicação
```

---

## 👤 Autor

Desenvolvido por **Pedro Lameirão**.

---

_Este projeto é uma ferramenta de produtividade e não possui vínculo oficial direto com os sistemas centrais da companhia, servindo como calculadora de apoio tático._
