# 🦊 Fox Recovery

**Aplicativo de Acompanhamento Pós-Operatório · Método Fox**  
by Rafaella Lima · [@rafalimaestetica](https://instagram.com/rafalimaestetica)  
Consultório Fox · Campo Grande, RJ

---

## Sobre o Projeto

O **Fox Recovery** é um aplicativo web progressivo (PWA-ready) para acompanhamento personalizado de pacientes em pós-operatório de cirurgia plástica.

Inspirado nos aplicativos de gestação (semana a semana) e nos apps de ciclo menstrual, o Fox Recovery gera um protocolo individualizado com base nas cirurgias realizadas e nos dados cadastrados pela paciente.

---

## Funcionalidades

- **Cadastro completo de perfil** — nome, cirurgias (corporais, faciais ou combinadas), cirurgião, dados antropométricos, histórico
- **Dados do pós-op** — data da cirurgia, drenagem linfática, Klexane, meia compressiva, malha cirúrgica, dreno (com retirada vinculada à placa), eletroterapia
- **Protocolo calculado automaticamente** — malha 180 dias com desmame, placa 90 dias vinculada ao dreno, Klexane, meia
- **3 abas no dashboard:**
  - 📋 Protocolo — timeline com datas calculadas
  - 🛏 Orientações — posição de repouso por cirurgia, banho passo a passo, sinais de alerta
  - 📚 Guia Completo — 7 seções expansíveis com embasamento científico
- **Guia Completo inclui:**
  - Como escolher a malha cirúrgica ideal
  - Como escolher a placa por tipo de cirurgia
  - Cuidado das feridas em casa (com/sem cola cirúrgica, umbigo)
  - Pomadas por fase (ferida aberta vs cicatriz madura)
  - Identificar e agir: deiscência, seroma, necrose, hematoma, infecção
  - Taping / Kinesio Tape — benefícios, cuidados, quanto tempo
  - O que ter e fazer em casa (kit mínimo, alimentação, proibições)
  - Quando procurar o médico (urgente vs retorno)
- **Unissex** — inclui cirurgias masculinas (ginecomastia, prótese peitoral, lifting masculino)
- **Identidade visual Fox Recovery** — dark mode, tons laranja e preto, fontes Playfair Display + DM Sans

---

## Tecnologias

- **React 18** com hooks
- **Vite 5** para build
- CSS-in-JS (inline styles) — sem dependências externas de UI
- Totalmente responsivo (mobile-first)

---

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Build para produção
npm run build

# 4. Preview do build
npm run preview
```

---

## Deploy recomendado

- **Vercel** — arrastar a pasta ou conectar o repositório
- **Netlify** — conectar o repositório, build command: `npm run build`, publish dir: `dist`
- **GitHub Pages** — usar `gh-pages` com `vite build`

---

## Estrutura do projeto

```
fox-recovery/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          ← componente principal (toda a lógica e UI)
│   ├── main.jsx         ← entry point React
│   └── index.css        ← reset global
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Próximas versões planejadas

- [ ] Notificações diárias de protocolo
- [ ] Diário de sintomas semana a semana
- [ ] Calculadora de IMC e evolução de medidas
- [ ] Contador de sessões de drenagem
- [ ] Integração com agendamento do consultório
- [ ] Modo offline (PWA completo)
- [ ] Versão multilíngue (PT/EN/ES)

---

## Licença

Projeto proprietário · © 2025 Rafaella Lima · Todos os direitos reservados.  
Proibida a reprodução ou distribuição sem autorização.

---

> *"Uma recuperação bem acompanhada é parte do resultado."*  
> — Rafaella Lima, Especialista em Pós-Operatório Estético
