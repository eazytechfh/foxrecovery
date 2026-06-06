import { useState } from "react";
import { criarCadastro, atualizarCadastro, buscarPorCpf, buscarPorEmail, fromPayload } from "./api.js";

const C = {
  bg: "#0a0a0a", surface: "#141414", card: "#1c1c1c", border: "#2a2a2a",
  orange: "#E8602C", orangeLight: "#ff7a45", orangeDim: "#3d1f10",
  text: "#f0ece4", muted: "#7a7570", success: "#4caf7d",
  warning: "#f0b429", danger: "#e05252", blue: "#60a5fa", purple: "#a78bfa",
  teal: "#2dd4bf",
};

// ─────────────────────────────────────────────────────────────
// DADOS ESTÁTICOS
// ─────────────────────────────────────────────────────────────
const SURGERIES = {
  corporal: [
    "Abdominoplastia Clássica (Dermolipectomia Abdominal)",
    "Abdominoplastia em Âncora",
    "Mini Abdominoplastia",
    "Dermolipectomia Abdominal Circunferencial (Body Lift)",
    "Lipoaspiração / Lipoescultura",
    "Lipoaspiração de Alta Definição (Lipo HD)",
    "Lipoenxertia (Lipofilling Corporal)",
    "Mamoplastia de Aumento (Prótese de Silicone)",
    "Mastopexia (Levantamento de Mama)",
    "Mastopexia com Prótese",
    "Mamoplastia Redutora",
    "Gluteoplastia com Prótese",
    "Gluteoplastia com Lipoenxertia (BBL)",
    "Coxoplastia / Lifting de Coxas (Dermolipectomia Crural)",
    "Prótese de Panturrilha",
    "Braquioplastia (Lifting de Braços / Dermolipectomia Braquial)",
    "Dermolipectomia de Dorso",
    "Lipoaspiração de Papada",
    "Necklift (Lifting de Pescoço)",
    "Ninfoplastia (Labioplastia)",
    "Hernioplastia Umbilical Estética",
    "Ginecomastia (Redução de Mama Masculina)",
    "Lipoaspiração Masculina",
    "Abdominoplastia Masculina",
    "Prótese Peitoral Masculina",
  ],
  facial: [
    "Rinoplastia",
    "Ritidoplastia / Lifting Facial",
    "Lifting de Têmporas",
    "Lifting de Sobrancelha (Browlift)",
    "Blefaroplastia Superior",
    "Blefaroplastia Inferior",
    "Blefaroplastia Superior e Inferior",
    "Otoplastia",
    "Mentoplastia (Cirurgia do Queixo)",
    "Bichectomia",
    "Lipofilling Facial",
    "Lipoaspiração de Papada",
    "Lifting de Pescoço Facial",
    "Lifting Facial Masculino",
  ],
};

const ALL_SURGERIES = [
  ...SURGERIES.corporal.map((s) => ({ label: s, cat: "corporal" })),
  ...SURGERIES.facial.filter((s) => !SURGERIES.corporal.includes(s)).map((s) => ({ label: s, cat: "facial" })),
];

const STATES_BR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const ELETROTERAPIA_OPTIONS = [
  { id: "laser_ilib", label: "Laser / ILIB", desc: "Fotobiomodulação — cicatrização, antiinflamatório, redução de fibrose e queloides" },
  { id: "ultrassom", label: "Ultrassom Terapêutico", desc: "Modo pulsado 3MHz — reparo tecidual, redução de fibrose e edema" },
  { id: "alta_freq", label: "Alta Frequência", desc: "Bactericida, antiedematosa, auxilia cicatrização" },
  { id: "led", label: "Fototerapia / LED de Baixa Intensidade", desc: "Regulação de fibroblastos, controle cicatricial, redução de edema" },
  { id: "microcorrente", label: "Microcorrente", desc: "Reparação celular, analgesia, regeneração tecidual" },
  { id: "endermologia", label: "Endermologia / Vacuoterapia", desc: "Mobilização tecidual, fibrose, modelagem pós-lipo" },
  { id: "radiofrequencia", label: "Radiofrequência", desc: "Neocolagênese, flacidez pós-cirúrgica (somente fase tardia, após liberação médica)" },
  { id: "ozonio", label: "Ozonioterapia", desc: "Ação bactericida, cicatrizante, complicações de tecido" },
];

// ─────────────────────────────────────────────────────────────
// CONTEÚDO DO GUIA
// ─────────────────────────────────────────────────────────────
const GUIDE_SECTIONS = [
  {
    id: "malha",
    icon: "🩱",
    title: "Como escolher a malha cirúrgica",
    color: C.orange,
    who: "equipe_pos",
    items: [
      { subtitle: "O que é e para que serve", text: "A malha cirúrgica é uma roupa compressiva de uso contínuo após cirurgias corporais. Ela molda, sustenta os tecidos, reduz edema e previne seromas e fibroses. Não é a mesma coisa que uma cinta comum de farmácia." },
      { subtitle: "Características que deve ter", text: "• Compressão graduada de média a alta (20–40 mmHg para pós-op de lipoaspiração e abdominoplastia)\n• Tecido respirável (poliamida + elastano de alta qualidade)\n• Fechamento com colchetes (não zíper) para ajuste progressivo conforme redução do edema\n• Sem costuras internas salientes que causem marcas\n• Com abertura perineal (facilita ida ao banheiro)\n• Modelagem específica para o tipo de cirurgia: macaquinho, calça, corselet ou short" },
      { subtitle: "Como escolher o modelo correto", text: "• Abdominoplastia/Lipo abdominal: macaquinho ou corselet com apoio abdominal reforçado\n• Lipo de coxas/gluteoplastia: short ou calça modeladora\n• Mamoplastia: modelador de busto com aba para fixar o implante\n• BBL: short com abertura glútea (para não comprimir o enxerto)\n• Ginecomastia: colete ou faixa compressiva torácica específica masculina\n• Braquioplastia: manga compressiva" },
      { subtitle: "Tamanho correto", text: "O tamanho deve ser aferido ANTES da cirurgia, com medidas de cintura, quadril e busto. Uma malha muito apertada pode causar necrose; muito folgada não comprime adequadamente. Siga a tabela do fabricante." },
      { subtitle: "Cuidados com a malha", text: "Lavar à mão com sabão neutro em água fria. Nunca torcer — pressionar levemente. Secar à sombra. Ter pelo menos 2 unidades para revezamento. Não usar amaciante (perde elasticidade)." },
    ],
  },
  {
    id: "placa",
    icon: "🟧",
    title: "Como escolher a placa de compressão",
    color: C.warning,
    who: "equipe_pos",
    items: [
      { subtitle: "O que é e para que serve", text: "A placa (ou almofada de contenção) é usada por dentro da malha, na região operada. Distribui a pressão de forma homogênea, impede dobras, previne seromas, hematomas e fibrose, e modela os tecidos durante a cicatrização. Inicia somente após retirada do dreno." },
      { subtitle: "Tipos disponíveis", text: "• Espuma viscoelástica (espuma fina e densa): ideal para abdômen, flancos e dorso. Distribui pressão uniforme.\n• Espuma com silicone na face interna: aderência suave à pele, indicada em peles mais sensíveis\n• Placa semi-rígida (polietileno expandido): maior firmeza, indicada em áreas de maior risco de dobra\n• Placa anatômica pré-moldada: formato adaptado à região (ex: placa em meia-lua para flanco)" },
      { subtitle: "Por cirurgia", text: "• Abdominoplastia: placa frontal abdominal + placas laterais de flanco\n• Lipoaspiração abdominal: placa frontal (espuma ou semi-rígida)\n• Lipo de dorso/costas: placa de dorso\n• Lipo de braços: manga com placa interna\n• Lipo de coxas: placa interna de coxa\n• Ginecomastia: placa de tórax masculino" },
      { subtitle: "Não indicada para", text: "BBL (não comprimir glúteo com enxerto), prótese de silicone (mama, glúteo) — seguir orientação do cirurgião." },
      { subtitle: "Características que deve ter", text: "• Hipoalergênica, sem látex\n• Lavável\n• Não pode comprimir excessivamente (reduz circulação)\n• Deve cobrir toda a área operada uniformemente" },
    ],
  },
  {
    id: "ferida",
    icon: "🩹",
    title: "Cuidado das feridas operatórias",
    color: C.success,
    who: "casa",
    items: [
      { subtitle: "Competência de cada um", text: "🏥 Equipe médica: prescreve o protocolo de curativo, retira pontos, trata complicações\n💆 Equipe de pós-op: orienta e acompanha evolução, identifica alterações\n🏠 Em casa: higiene e curativo conforme protocolo recebido" },
      { subtitle: "Higiene da ferida em casa (sem cola cirúrgica)", text: "1. Lave as mãos antes de qualquer contato\n2. Retire o curativo devagar, nunca puxe bruscamente\n3. Limpe com soro fisiológico 0,9% (não álcool, não água oxigenada, não iodo diretamente)\n4. Seque com gaze estéril em movimentos gentis — nunca esfregar\n5. Aplique a pomada prescrita com gaze ou cotonete limpo\n6. Cubra com gaze e micropore ou curativo impermeável conforme orientação\n7. Frequência: conforme prescrição (geralmente 1x ao dia ou a cada 2 dias)" },
      { subtitle: "Com cola cirúrgica (Dermabond/Prineo)", text: "• A cola forma uma barreira impermeável — não requer curativo externo\n• Pode tomar banho normalmente, sem esfregar a região\n• NÃO remova a cola por conta própria (ela sai sozinha em 10–20 dias)\n• NÃO aplicar pomadas ou cremes sobre a cola ativa\n• Não expor à sol ou calor intenso sobre a cola\n• Retorno à equipe médica para retirada quando necessário (tipo Prineo)" },
      { subtitle: "Umbigo — cuidados específicos", text: "• Limpe o interior com cotonete úmido em soro fisiológico\n• Seque bem (umidade acumula bactéria)\n• Se o médico não prescreveu gaze, não insira gaze no umbigo sem orientação\n• Sinais de alerta: vermelhidão, secreção, odor ou crosta escura → contate a equipe" },
    ],
  },
  {
    id: "pomada",
    icon: "💊",
    title: "Pomadas para cicatrização",
    color: C.teal,
    who: "medico",
    items: [
      { subtitle: "Regra geral", text: "A pomada ideal é sempre a prescrita pelo cirurgião. As informações abaixo são educativas — nunca substitua ou adicione pomadas sem orientação médica." },
      { subtitle: "Fase 1: Ferida aberta / recém-suturada", text: "• Dexpantenol (Bepantol, Probentol): hidratação, regeneração do epitélio, ideal para feridas limpas e sem infecção\n• Neomicina + Bacitracina (Nebacetin, Cicatrisan): antibiótico tópico, indicado quando há risco ou sinal de infecção superficial. Uso por tempo limitado (resistência bacteriana)\n• Sulfadiazina de prata: queimaduras, áreas com risco de infecção mais grave, uso sob prescrição" },
      { subtitle: "Fase 2: Após fechamento completo (cicatriz madura)", text: "• Gel de silicone (Kelo-cote, Cicacare): aplicar 2x ao dia por 3–6 meses. Evidência científica forte para prevenção de queloides e cicatrizes hipertróficas\n• Centela asiática (Cica-care, Bepantol Cicatriz): anti-inflamatória, regeneradora, boa para cicatrizes em formação\n• Ácido hialurônico / hidratantes pós-cicatrização: após retirada dos pontos, para elasticidade" },
      { subtitle: "Quando NÃO usar pomada", text: "• Sobre cola cirúrgica ativa\n• Em feridas com sinais de infecção sem orientação médica (pode selar bactérias)\n• Produtos perfumados, álcool ou iodo diretamente sobre sutura" },
      { subtitle: "O que ter em casa", text: "✓ Soro fisiológico 0,9% (frasco ou ampola)\n✓ Gaze estéril\n✓ Micropore ou curativo impermeável\n✓ Cotonetes estéreis\n✓ Pomada prescrita pelo cirurgião\n✓ Termômetro digital" },
    ],
  },
  {
    id: "complicacoes",
    icon: "🚨",
    title: "Identificar e agir: complicações",
    color: C.danger,
    who: "medico",
    items: [
      { subtitle: "Deiscência (abertura de ponto / sutura)", text: "O que é: separação das bordas da ferida, parcial ou total.\nComo identificar: abertura visível na cicatriz, exposição de tecido interno, bordas separadas.\nO que fazer em casa: NÃO tente fechar com esparadrapo. Cubra com gaze estéril e soro fisiológico (curativo úmido). Não exponha ao ar livre.\nQuando procurar médico: SEMPRE — toda deiscência precisa de avaliação. Nas primeiras 24h pode ser refechada; após isso, cicatrização por segunda intenção com acompanhamento profissional." },
      { subtitle: "Seroma (acúmulo de líquido)", text: "O que é: acúmulo de líquido seroso (plasma) no espaço cirúrgico.\nComo identificar: inchaço localizado e delimitado, sensação de 'líquido andando', aumento de volume que não regride, flutuação ao toque suave.\nO que fazer em casa: NUNCA puncionar ou drenar em casa. Compressão suave com malha ajuda a conter.\nQuando procurar médico: Sempre que suspeitar. Tratamento: punção guiada, compressão ou drenagem por profissional. Pequenos seromas podem regredir espontaneamente com compressão adequada." },
      { subtitle: "Necrose (morte do tecido)", text: "O que é: isquemia que leva à morte celular da pele ou tecido subcutâneo.\nComo identificar: escurecimento progressivo da pele (cinza → roxo → preto), área com consistência diferente ao redor, odor característico, delimitação clara entre tecido vivo e morto, pele fria na área.\nO que fazer em casa: NÃO arrancar, cortar ou tentar limpar. Cobrir com gaze estéril.\nQuando procurar médico: URGENTE. Necrose é emergência cirúrgica — o tratamento é sempre médico (desbridamento, curativo especializado, possível nova cirurgia)." },
      { subtitle: "Hematoma (acúmulo de sangue)", text: "O que é: coleção de sangue no espaço cirúrgico.\nComo identificar: inchaço rígido (não flutua), calor local, equimose intensa, dor progressiva, aumento de volume rápido nas primeiras 48–72h.\nO que fazer em casa: Gelo (nunca diretamente) nas primeiras 48h, repouso, malha bem ajustada.\nQuando procurar médico: Se crescimento rápido, dor intensa ou febre — avaliação imediata." },
      { subtitle: "Infecção da ferida", text: "Como identificar: vermelhidão crescente além da ferida, calor, dor pulsátil, secreção purulenta (amarela/esverdeada), odor, febre >37,8°C.\nO que fazer em casa: NÃO aplicar pomada antibiótica sem orientação. Cubra e contate a equipe.\nQuando procurar médico: Toda secreção com odor ou mudança de cor = avaliação urgente." },
    ],
  },
  {
    id: "taping",
    icon: "🩻",
    title: "Taping / Kinesio Tape no pós-op",
    color: C.blue,
    who: "equipe_pos",
    items: [
      { subtitle: "O que é", text: "Fita elástica adesiva terapêutica (kinesio tape) aplicada sobre a pele na região operada. Cria um espaço entre pele e músculo, facilitando a drenagem linfática de forma passiva e contínua." },
      { subtitle: "Benefícios científicos (revisão de literatura)", text: "• Redução de edema (inchaço) e equimoses (hematomas/roxos)\n• Facilitação da drenagem linfática\n• Redução da fibrose pós-operatória\n• Analgesia (controle da dor)\n• Melhora da qualidade cicatricial\n• Pode ser aplicado desde o intraoperatório ou nas primeiras 24h" },
      { subtitle: "Quem aplica", text: "Fisioterapeuta dermatofuncional com capacitação específica. A tensão, o corte e o padrão (fan/polvo para edema, web/basket para fibrose, hashtag para equimoses) variam conforme o objetivo." },
      { subtitle: "Quanto tempo fica", text: "De 3 a 7 dias por aplicação. Pode permanecer no banho — não esfregar, apenas pressionar para secar. Após retirada, descansar a pele por 1 dia antes de reaplicar." },
      { subtitle: "Como cuidar em casa", text: "• Não arrancar de uma vez — retirar devagar, dobrando sobre si mesma, de baixo para cima\n• Se ocorrer coceira, irritação ou bolhas: retirar e avisar a equipe\n• Não reaplique em casa sem treinamento\n• Após retirada, hidrate a pele com creme neutro antes da próxima aplicação" },
      { subtitle: "Não substitui", text: "A malha compressiva, a drenagem linfática manual, ou qualquer outro recurso do protocolo. É complementar." },
    ],
  },
  {
    id: "casa",
    icon: "🏠",
    title: "O que ter e fazer em casa",
    color: C.success,
    who: "casa",
    items: [
      { subtitle: "Kit mínimo em casa", text: "✓ Soro fisiológico 0,9% (ampolas ou frasco)\n✓ Gaze estéril (pacote)\n✓ Micropore ou curativo impermeável\n✓ Cotonetes estéreis\n✓ Pomada prescrita pelo cirurgião\n✓ Termômetro digital\n✓ Bolsa de gelo reutilizável (para as primeiras 48h)\n✓ Malha cirúrgica reserva (mínimo 2 unidades)\n✓ Travesseiro extra (para posicionamento)\n✓ Cadeira de banho ou banco antiderrapante\n✓ Lanche leve disponível (comer antes de levantar)" },
      { subtitle: "O que pode ser feito em casa", text: "✓ Higiene da ferida conforme protocolo recebido\n✓ Colocação e ajuste da malha\n✓ Monitoramento de sinais vitais (temperatura, coloração da pele)\n✓ Cuidados posturais e de mobilidade\n✓ Hidratação e alimentação equilibrada\n✓ Cuidado com o tape (não arrancar)\n✓ Registro de volume do dreno (se houver)" },
      { subtitle: "O que NÃO fazer em casa", text: "✗ Puncionar ou drenar coleções\n✗ Retirar pontos ou cola cirúrgica\n✗ Aplicar calor (bolsa quente) nas primeiras semanas\n✗ Fumar (vasoconstrição compromete cicatrização — risco 2–3x maior de complicações)\n✗ Fazer esforço físico sem liberação\n✗ Expor a cicatriz ao sol sem protetor FPS 50+\n✗ Tomar medicamentos não prescritos" },
      { subtitle: "Alimentação que ajuda a cicatrizar", text: "• Proteínas: frango, ovos, peixe, leguminosas (síntese de colágeno)\n• Vitamina C: laranja, kiwi, acerola (cofator do colágeno)\n• Zinco: sementes, carnes (regeneração tecidual)\n• Água: mínimo 2L/dia (fluidez linfática e cicatrização)\n• Evitar: açúcar em excesso, álcool, sódio exagerado (aumentam edema)" },
    ],
  },
  {
    id: "quando_medico",
    icon: "🏥",
    title: "Quando procurar o médico",
    color: C.danger,
    who: "medico",
    items: [
      { subtitle: "URGENTE — vá imediatamente ou ligue para a equipe", text: "🔴 Febre acima de 37,8°C que não cede com antitérmico\n🔴 Falta de ar, dor no peito ou palpitações\n🔴 Perna vermelha, quente ou inchada de forma assimétrica (suspeita de TVP)\n🔴 Sangramento ativo que não para\n🔴 Área com escurecimento progressivo (suspeita de necrose)\n🔴 Deiscência ampla (abertura de sutura)\n🔴 Inchaço rápido e rígido (hematoma)\n🔴 Secreção purulenta com odor" },
      { subtitle: "AGENDAR consulta de retorno nos próximos dias", text: "🟡 Dor progressiva que não melhora com a medicação\n🟡 Coceira intensa, bolhas ou reação alérgica à malha ou tape\n🟡 Inchaço localizado e flutuante que não regride (seroma)\n🟡 Marcas ou dobras persistentes na cicatriz\n🟡 Febre baixa persistente (37–37,5°C por mais de 2 dias)\n🟡 Dormência ou alteração de sensibilidade fora do esperado" },
      { subtitle: "Competência de cada profissional", text: "👨‍⚕️ Cirurgião: diagnóstico de complicações, prescrições, retorno cirúrgico, liberações\n💆 Profissional de pós-op (você!): drenagem linfática, eletroterapia, orientações, acompanhamento da evolução, acionamento da equipe médica quando necessário\n🏠 Paciente em casa: higiene, curativo conforme protocolo, observação e reporte" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const fmtDate = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const fmtCpf = (v) => v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const hasCorporal = (sel) => sel.some((s) => ALL_SURGERIES.find((a) => a.label === s)?.cat === "corporal");
const hasFacial = (sel) => sel.some((s) => ALL_SURGERIES.find((a) => a.label === s)?.cat === "facial");

function getSleepTips(selectedSurgeries) {
  const labels = selectedSurgeries.map((s) => s.toLowerCase());
  const has = (kw) => labels.some((l) => l.includes(kw));
  const tips = [];
  if (has("abdominoplastia") || has("dermolipectomia abdominal") || has("body lift") || has("mini abdominoplastia")) tips.push({ title: "Abdominoplastia / Dermolipectomia", icon: "🛏", items: ["Posição em V: barriga para cima, tronco elevado ~30° E joelhos dobrados com travesseiro sob as pernas. Nunca esticar o abdômen.", "Primeiros 7 dias: pernas dobradas — não tracionar os pontos.", "Ao levantar: vire para o lado, use os braços. Nunca force o abdômen."] });
  if (has("bbl") || has("lipoenxertia glútea")) tips.push({ title: "BBL / Gluteoplastia com Lipoenxertia", icon: "🚫", items: ["PROIBIDO sentar ou deitar sobre os glúteos por 6 semanas.", "Dormir de bruços ou de lado.", "Almofada BBL ao sentar quando liberado.", "Apoiar peso nas coxas — nunca nos glúteos."] });
  if (has("gluteoplastia com prótese")) tips.push({ title: "Gluteoplastia com Prótese", icon: "🚫", items: ["Igual BBL: proibido sentar sobre os glúteos por ~6 semanas.", "Dormir de bruços ou de lado."] });
  if (has("mamoplastia") || has("mastopexia") || has("prótese de silicone")) tips.push({ title: "Mamoplastia / Mastopexia / Prótese", icon: "🛏", items: ["Barriga para cima, tronco elevado com 2 travesseiros sob as costas.", "Dormir de lado: liberação somente após 30–60 dias.", "PROIBIDO de bruços por pelo menos 60 dias.", "Travesseiro entre os braços para evitar movimentos bruscos."] });
  if (has("rinoplastia") || has("ritidoplastia") || has("lifting") || has("blefaroplastia") || has("otoplastia") || has("mentoplastia") || has("bichectomia")) tips.push({ title: "Cirurgias Faciais", icon: "💆", items: ["Cabeça sempre mais alta que o corpo (travesseiro extra ou cama articulada).", "Barriga para cima — nenhuma pressão no rosto.", "Travesseiros laterais para impedir virada da cabeça.", "Compressas frias (nunca geladas) nas primeiras 48h."] });
  if (has("braquioplastia") || (has("lipo") && has("braço"))) tips.push({ title: "Braquioplastia / Lipo de Braços", icon: "💪", items: ["Barriga para cima, braços elevados acima do nível do coração com travesseiros."] });
  if (has("coxoplastia") || has("crural") || (has("lipo") && has("coxa"))) tips.push({ title: "Coxoplastia / Lipo de Coxas", icon: "🦵", items: ["Barriga para cima, pernas levemente elevadas.", "Evitar cruzar as pernas."] });
  if (has("ginecomastia")) tips.push({ title: "Ginecomastia", icon: "👨", items: ["Barriga para cima, leve elevação do tronco.", "Colete compressivo masculino específico.", "Evitar pressão direta sobre o peitoral."] });
  return tips;
}

function calcProtocol(selectedSurgeries, opDate, items) {
  if (!opDate) return [];
  const start = new Date(opDate);
  const timeline = [];
  if (hasCorporal(selectedSurgeries)) {
    timeline.push({ label: "Malha Cirúrgica", start: fmtDate(start), end: fmtDate(addDays(start, 180)), detail: "180 dias. Desmame a partir do 150º dia — redução gradual de 2h por semana.", color: C.orange });
  }
  if (hasFacial(selectedSurgeries)) {
    timeline.push({ label: "Curativo / Bandagem Facial", start: fmtDate(start), end: fmtDate(addDays(start, 7)), detail: "Manter 7 dias ou conforme orientação do cirurgião.", color: C.orange });
  }
  if (items.dreno && items.dreno_retirada) {
    const drR = new Date(items.dreno_retirada);
    timeline.push({ label: "Retirada do Dreno", start: fmtDate(drR), end: "—", detail: "Conforme médico (drenagem < 50ml/dia). Placa inicia após esta data.", color: C.blue });
    if (items.placa) timeline.push({ label: "Placa de Compressão", start: fmtDate(drR), end: fmtDate(addDays(drR, 90)), detail: "Inicia na retirada do dreno. 90 dias. Desmame no 75º dia.", color: C.warning });
  } else if (!items.dreno && items.placa && items.placa_start) {
    const ps = new Date(items.placa_start);
    timeline.push({ label: "Placa de Compressão", start: fmtDate(ps), end: fmtDate(addDays(ps, 90)), detail: "90 dias. Desmame no 75º dia.", color: C.warning });
  }
  if (items.klexane_start) {
    const ks = new Date(items.klexane_start);
    timeline.push({ label: "Klexane", start: fmtDate(ks), end: fmtDate(addDays(ks, 10)), detail: "Uso médio 10 dias. A meia compressiva geralmente acompanha o mesmo período. Sempre conforme prescrição.", color: C.danger });
  }
  if (items.meia_start) {
    timeline.push({ label: "Meia Compressiva", start: fmtDate(new Date(items.meia_start)), end: "Conforme prescrição", detail: "Geralmente acompanha o Klexane. Sempre sob orientação médica.", color: C.success });
  }
  if (items.drain_date) {
    timeline.push({ label: "1ª Drenagem Linfática", start: fmtDate(new Date(items.drain_date)), end: "—", detail: "Mínimo 10 sessões. Frequência e intervalo definidos de paciente a paciente.", color: C.purple });
  }
  return timeline;
}

// ─────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────
function Tag({ color, children }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{children}</span>;
}
function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</label>
      <input {...props} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", ...(props.style || {}) }}
        onFocus={(e) => (e.target.style.borderColor = C.orange)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
    </div>
  );
}
function Select({ label, options, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</label>
      <select {...props} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: props.value ? C.text : C.muted, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", cursor: "pointer" }}>
        <option value="">Selecione...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Toggle({ label, value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}>
      <span style={{ fontSize: 14, color: C.text }}>{label}</span>
      <div style={{ width: 44, height: 24, borderRadius: 12, background: value ? C.orange : C.border, position: "relative", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
      </div>
    </div>
  );
}
function Card({ children, style }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, ...style }}>{children}</div>;
}
function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Playfair Display', serif" }}>{children}</h2>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>{sub}</p>}
    </div>
  );
}
function Btn({ children, onClick, secondary, small, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: secondary ? "transparent" : C.orange, border: secondary ? `1px solid ${C.border}` : "none", color: secondary ? C.muted : "#fff", borderRadius: 8, padding: small ? "8px 16px" : "12px 24px", fontSize: small ? 13 : 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, letterSpacing: 0.5 }}>
      {children}
    </button>
  );
}
function SurgeryPicker({ selected, onChange }) {
  const toggle = (label) => selected.includes(label) ? onChange(selected.filter((s) => s !== label)) : onChange([...selected, label]);
  const Sec = ({ title, items, icon }) => (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: "0 0 8px", fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{icon} {title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map(({ label }) => { const active = selected.includes(label); return <div key={label} onClick={() => toggle(label)} style={{ padding: "5px 10px", borderRadius: 20, border: `1px solid ${active ? C.orange : C.border}`, background: active ? C.orangeDim : C.surface, color: active ? C.orange : C.muted, fontSize: 12, fontWeight: active ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>{label}</div>; })}</div></div>);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>Procedimento(s) — selecione todos</label>
      <Card style={{ padding: 16 }}>
        <Sec title="Corporal (inclui masculinas)" icon="🫀" items={ALL_SURGERIES.filter((s) => s.cat === "corporal")} />
        <Sec title="Facial" icon="💆" items={ALL_SURGERIES.filter((s) => s.cat === "facial")} />
        {selected.length > 0 && <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}><p style={{ margin: "0 0 6px", fontSize: 11, color: C.orange, fontWeight: 700 }}>SELECIONADO ({selected.length})</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{selected.map((s) => <Tag key={s} color={C.orange}>{s}</Tag>)}</div></div>}
      </Card>
    </div>
  );
}
function EletroterapiaPicker({ selected, onChange }) {
  const toggle = (id) => selected.includes(id) ? onChange(selected.filter((s) => s !== id)) : onChange([...selected, id]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>Eletroterapia / Recursos Complementares</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ELETROTERAPIA_OPTIONS.map(({ id, label, desc }) => { const active = selected.includes(id); return (
          <div key={id} onClick={() => toggle(id)} style={{ background: active ? C.orangeDim : C.surface, border: `1px solid ${active ? C.orange : C.border}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: active ? C.orange : C.text, fontSize: 13 }}>{label}</span>
              <span style={{ fontSize: 16 }}>{active ? "✅" : "⬜"}</span>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{desc}</p>
          </div>
        ); })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GUIA COMPONENT
// ─────────────────────────────────────────────────────────────
function GuideSection({ section }) {
  const [open, setOpen] = useState(false);
  const whoLabel = { medico: { label: "Equipe Médica", color: C.danger }, equipe_pos: { label: "Equipe Pós-op", color: C.orange }, casa: { label: "Em Casa", color: C.success } };
  const who = whoLabel[section.who] || whoLabel.casa;
  return (
    <div style={{ background: C.card, border: `1px solid ${open ? section.color : C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>{section.icon}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 14 }}>{section.title}</p>
            <span style={{ fontSize: 10, background: who.color + "22", color: who.color, border: `1px solid ${who.color}44`, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>{who.label}</span>
          </div>
        </div>
        <span style={{ color: C.muted, fontSize: 18 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ height: 1, background: C.border, marginBottom: 16 }} />
          {section.items.map((item, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: section.color, fontSize: 13 }}>{item.subtitle}</p>
              <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-line" }}>{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TELAS
// ─────────────────────────────────────────────────────────────
function BuscarScreen({ onFound, onBack }) {
  const [campo, setCampo] = useState("cpf");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function buscar() {
    setErro("");
    const v = valor.trim();
    if (!v) return;
    setLoading(true);
    try {
      const row = campo === "cpf" ? await buscarPorCpf(v) : await buscarPorEmail(v);
      const parsed = fromPayload(row);
      onFound(parsed);
    } catch (e) {
      if (e?.error === "NAO_ENCONTRADO") setErro("Cadastro não encontrado. Verifique os dados.");
      else setErro("Erro ao buscar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <SectionTitle sub="Acesse seu acompanhamento">Já tenho cadastro</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["cpf", "email"].map((op) => (
            <div key={op} onClick={() => { setCampo(op); setValor(""); setErro(""); }}
              style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8, cursor: "pointer", border: `1px solid ${campo === op ? C.orange : C.border}`, background: campo === op ? C.orangeDim : C.surface, color: campo === op ? C.orange : C.muted, fontWeight: campo === op ? 700 : 400, fontSize: 13 }}>
              {op === "cpf" ? "CPF" : "E-mail"}
            </div>
          ))}
        </div>
        {campo === "cpf"
          ? <Input label="Seu CPF" value={valor} onChange={(e) => setValor(fmtCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
          : <Input label="Seu e-mail" type="email" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="seu@email.com" />}
        {erro && <p style={{ margin: 0, fontSize: 13, color: C.danger }}>{erro}</p>}
        <Btn onClick={buscar} disabled={loading || !valor.trim()}>
          {loading ? "Buscando..." : "Acessar meu cadastro →"}
        </Btn>
        <Btn secondary onClick={onBack}>← Voltar</Btn>
      </div>
    </div>
  );
}

function SplashScreen({ onStart, onBuscar }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", marginBottom: 24, boxShadow: `0 0 40px ${C.orange}55` }}><img src={"data:image/jpeg;base64,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"} alt="Fox Recovery" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display', serif" }}>Fox Recovery</h1>
      <p style={{ color: C.orange, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", margin: "8px 0 0", fontWeight: 700 }}>Método Fox Pós-Operatório</p>
      <p style={{ color: C.muted, fontSize: 14, marginTop: 20, maxWidth: 280, lineHeight: 1.6 }}>Seu guia personalizado para uma recuperação segura, informada e acompanhada.</p>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
        <Btn onClick={onStart}>Começar meu cadastro</Btn>
        <Btn secondary onClick={onBuscar}>Já tenho cadastro</Btn>
      </div>
      <p style={{ color: C.muted, fontSize: 11, marginTop: 40 }}>by Rafaella Lima · Consultório Fox</p>
    </div>
  );
}

function ProfileStep({ data, onChange, onNext }) {
  const valid = data.name && data.age && data.weight && data.height && data.state && data.selectedSurgeries?.length > 0;
  return (
    <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <SectionTitle sub="Passo 1 de 3 · Identificação">Seu Perfil</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Nome completo" value={data.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Como podemos te chamar?" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="CPF" value={data.cpf} onChange={(e) => onChange("cpf", fmtCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
          <Input label="E-mail" type="email" value={data.email} onChange={(e) => onChange("email", e.target.value)} placeholder="seu@email.com" />
        </div>
        <Input label="Sexo biológico / Gênero (opcional)" value={data.genero} onChange={(e) => onChange("genero", e.target.value)} placeholder="Ex: Feminino, Masculino, Prefiro não informar" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Idade" type="number" value={data.age} onChange={(e) => onChange("age", e.target.value)} />
          <Select label="Estado" options={STATES_BR} value={data.state} onChange={(e) => onChange("state", e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Peso (kg)" type="number" value={data.weight} onChange={(e) => onChange("weight", e.target.value)} />
          <Input label="Altura (cm)" type="number" value={data.height} onChange={(e) => onChange("height", e.target.value)} />
        </div>
        <Input label="Nome do Cirurgião(ã)" value={data.surgeon} onChange={(e) => onChange("surgeon", e.target.value)} placeholder="Dr(a). ..." />
        <SurgeryPicker selected={data.selectedSurgeries || []} onChange={(v) => onChange("selectedSurgeries", v)} />
        <Toggle label="Já realizou cirurgia prévia?" value={data.prevSurgery} onChange={(v) => onChange("prevSurgery", v)} />
        {data.prevSurgery && <Input label="Qual procedimento anterior?" value={data.prevSurgeryDesc} onChange={(e) => onChange("prevSurgeryDesc", e.target.value)} />}
        <Input label="Observações / alergias / comorbidades" value={data.notes} onChange={(e) => onChange("notes", e.target.value)} placeholder="Opcional" />
      </div>
      <div style={{ marginTop: 28 }}><Btn onClick={onNext} disabled={!valid}>Próximo →</Btn></div>
    </div>
  );
}

function PostOpStep({ profile, data, onChange, onNext, onBack, cadastroId }) {
  const [saving, setSaving] = useState(false);
  const [saveErro, setSaveErro] = useState("");
  const surgeries = profile.selectedSurgeries || [];
  const isCorporal = hasCorporal(surgeries);
  const placaVisivel = isCorporal && (!data.dreno || !!data.dreno_retirada);

  async function handleSalvar() {
    setSaveErro("");
    setSaving(true);
    try {
      if (cadastroId) {
        await atualizarCadastro(cadastroId, profile, data);
        onNext(cadastroId);
      } else {
        const res = await criarCadastro(profile, data);
        onNext(res.id);
      }
    } catch (e) {
      if (e?.error === "CPF_OU_EMAIL_JA_CADASTRADO") {
        setSaveErro("CPF ou e-mail já cadastrado. Use 'Já tenho cadastro' para acessar.");
      } else {
        setSaveErro("Erro ao salvar. Verifique sua conexão e tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <SectionTitle sub="Passo 2 de 3 · Acompanhamento">Dados do Pós-Op</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Data da cirurgia" type="date" value={data.opDate} onChange={(e) => onChange("opDate", e.target.value)} />
          <Input label="Horário" type="time" value={data.opTime} onChange={(e) => onChange("opTime", e.target.value)} />
        </div>
        <Card>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: C.muted, fontWeight: 600 }}>Drenagem Linfática</p>
          <Input label="Data da 1ª sessão" type="date" value={data.drain_date} onChange={(e) => onChange("drain_date", e.target.value)} />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted }}>ⓘ Mínimo 10 sessões. Frequência e intervalo definidos caso a caso.</p>
        </Card>
        <Card>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: C.muted, fontWeight: 600 }}>Klexane</p>
          <Toggle label="Fez uso de Klexane?" value={data.klexane} onChange={(v) => onChange("klexane", v)} />
          {data.klexane && <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><Input label="Início" type="date" value={data.klexane_start} onChange={(e) => onChange("klexane_start", e.target.value)} /><Input label="Término (se já encerrou)" type="date" value={data.klexane_end} onChange={(e) => onChange("klexane_end", e.target.value)} /></div>}
        </Card>
        <Card>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: C.muted, fontWeight: 600 }}>Meia Compressiva</p>
          <Toggle label="Usa meia compressiva?" value={data.meia} onChange={(v) => onChange("meia", v)} />
          {data.meia && <div style={{ marginTop: 12 }}><Input label="Data de início" type="date" value={data.meia_start} onChange={(e) => onChange("meia_start", e.target.value)} /><p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted }}>ⓘ Geralmente acompanha o período do Klexane. Sempre sob orientação médica.</p></div>}
        </Card>
        {isCorporal && (<>
          <Card>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: C.muted, fontWeight: 600 }}>Malha Cirúrgica</p>
            <Toggle label="Usa malha cirúrgica?" value={data.malha} onChange={(v) => onChange("malha", v)} />
            {data.malha && <div style={{ marginTop: 12 }}><Input label="Data de início" type="date" value={data.malha_start} onChange={(e) => onChange("malha_start", e.target.value)} /></div>}
          </Card>
          <Card style={{ borderLeft: `3px solid ${C.blue}` }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: C.muted, fontWeight: 600 }}>Dreno Cirúrgico</p>
            <Toggle label="Fez uso de dreno?" value={data.dreno} onChange={(v) => { onChange("dreno", v); if (!v) onChange("dreno_retirada", ""); }} />
            {data.dreno && <div style={{ marginTop: 12 }}><Input label="Data de retirada do dreno (médico — < 50ml/dia)" type="date" value={data.dreno_retirada} onChange={(e) => onChange("dreno_retirada", e.target.value)} />{!data.dreno_retirada && <p style={{ margin: "8px 0 0", fontSize: 12, color: C.blue }}>ⓘ A placa só é calculada após a retirada do dreno.</p>}</div>}
          </Card>
          {placaVisivel && (
            <Card>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: C.muted, fontWeight: 600 }}>Placa de Compressão{data.dreno && data.dreno_retirada && <span style={{ marginLeft: 8, fontSize: 11, color: C.blue }}>· vinculada ao dreno</span>}</p>
              <Toggle label="Usa placa?" value={data.placa} onChange={(v) => onChange("placa", v)} />
              {data.placa && !data.dreno && <div style={{ marginTop: 12 }}><Input label="Data de início" type="date" value={data.placa_start} onChange={(e) => onChange("placa_start", e.target.value)} /></div>}
              {data.placa && data.dreno && data.dreno_retirada && <p style={{ margin: "10px 0 0", fontSize: 12, color: C.muted }}>Início automático: <strong style={{ color: C.orange }}>{new Date(data.dreno_retirada).toLocaleDateString("pt-BR")}</strong></p>}
            </Card>
          )}
        </>)}
        <EletroterapiaPicker selected={data.eletroterapia || []} onChange={(v) => onChange("eletroterapia", v)} />
      </div>
      {saveErro && <p style={{ margin: "16px 0 0", fontSize: 13, color: C.danger }}>{saveErro}</p>}
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Btn secondary onClick={onBack} small>← Voltar</Btn>
        <Btn onClick={handleSalvar} disabled={!data.opDate || saving}>
          {saving ? "Salvando..." : "Gerar meu protocolo →"}
        </Btn>
      </div>
    </div>
  );
}

function Dashboard({ profile, postOp }) {
  const [tab, setTab] = useState("protocolo");
  const surgeries = profile.selectedSurgeries || [];
  const items = { dreno: postOp.dreno, dreno_retirada: postOp.dreno_retirada, placa: postOp.placa, placa_start: postOp.placa_start, klexane_start: postOp.klexane ? postOp.klexane_start : null, meia_start: postOp.meia ? postOp.meia_start : null, drain_date: postOp.drain_date };
  const timeline = calcProtocol(surgeries, postOp.opDate, items);
  const sleepTips = getSleepTips(surgeries);
  const today = new Date();
  const opDate = postOp.opDate ? new Date(postOp.opDate) : null;
  const daysPost = opDate ? Math.floor((today - opDate) / 86400000) : null;
  const weeksPost = daysPost !== null ? Math.floor(daysPost / 7) : null;
  const corporal = hasCorporal(surgeries);
  const facial = hasFacial(surgeries);
  const combined = corporal && facial;
  const categoryLabel = combined ? "Combinada" : corporal ? "Corporal" : "Facial";
  const surgeryLabel = surgeries.length > 1 ? `${surgeries[0].split("(")[0].trim()} +${surgeries.length - 1}` : surgeries[0]?.split("(")[0].trim() || "—";
  const eletroSel = (postOp.eletroterapia || []).map((id) => ELETROTERAPIA_OPTIONS.find((e) => e.id === id)).filter(Boolean);

  const bathTips = ["Abra a malha devagar ainda deitada(o). Aguarde alguns segundos.", "Coma algo leve antes de se levantar.", "Levante devagar com ajuda de alguém.", "Vá até o banheiro pausadamente. Sente-se antes de entrar no box.", "Tome banho sentada(o), água morna (nunca quente), com ajuda.", "Seque-se com cuidado. Nunca esfregue pontos ou drenos.", "Sente-se novamente antes de colocar a malha.", "Nunca faça o banho sozinha(o) nas primeiras semanas."];

  const TABS = [{ id: "protocolo", label: "Protocolo" }, { id: "orientacoes", label: "Orientações" }, { id: "guia", label: "Guia Completo" }];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.orangeDim} 0%, #1a0e07 100%)`, border: `1px solid ${C.orange}44`, borderRadius: 16, padding: 20, margin: 24, marginBottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: C.orange, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase" }}>Olá, {profile.name?.split(" ")[0]} 👋</p>
            <h2 style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display', serif" }}>{surgeryLabel}</h2>
          </div>
          <Tag color={combined ? C.warning : C.orange}>{categoryLabel}</Tag>
        </div>
        {surgeries.length > 1 && <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>{surgeries.map((s) => <Tag key={s} color={C.muted}>{s.split("(")[0].trim()}</Tag>)}</div>}
        {daysPost !== null && <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ label: "Dias de\nRecuperação", value: daysPost }, { label: "Semanas", value: weeksPost }].map((s) => (
            <div key={s.label} style={{ background: "#ffffff0a", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.muted, whiteSpace: "pre", lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "16px 24px 0", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
        {TABS.map((t) => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", borderRadius: "8px 8px 0 0", background: tab === t.id ? C.card : "transparent", border: tab === t.id ? `1px solid ${C.border}` : "1px solid transparent", borderBottom: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? C.orange : C.muted }}>
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab: Protocolo */}
      {tab === "protocolo" && (
        <div style={{ padding: 24 }}>
          <SectionTitle sub="Calculado com base nos seus dados">Seu Protocolo</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {timeline.length === 0 ? <Card><p style={{ color: C.muted, fontSize: 14 }}>Nenhum protocolo calculado. Verifique os dados.</p></Card>
              : timeline.map((item, i) => (
                <Card key={i} style={{ borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{item.label}</span>
                    <Tag color={item.color}>{item.start}{item.end !== "—" ? ` → ${item.end}` : ""}</Tag>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{item.detail}</p>
                </Card>
              ))}
          </div>
          {eletroSel.length > 0 && (<>
            <SectionTitle sub="Recursos terapêuticos prescritos">Eletroterapia</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {eletroSel.map((e) => <Card key={e.id} style={{ borderLeft: `3px solid ${C.purple}` }}><p style={{ margin: "0 0 4px", fontWeight: 700, color: C.text, fontSize: 14 }}>⚡ {e.label}</p><p style={{ margin: 0, fontSize: 12, color: C.muted }}>{e.desc}</p></Card>)}
            </div>
          </>)}
        </div>
      )}

      {/* Tab: Orientações */}
      {tab === "orientacoes" && (
        <div style={{ padding: 24 }}>
          {sleepTips.length > 0 && (<>
            <SectionTitle sub="Posicionamento específico para suas cirurgias">Como Repousar</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {sleepTips.map((tip) => (
                <Card key={tip.title} style={{ borderLeft: `3px solid ${C.orange}` }}>
                  <p style={{ margin: "0 0 10px", fontWeight: 700, color: C.orange, fontSize: 13 }}>{tip.icon} {tip.title}</p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>{tip.items.map((t, i) => <li key={i} style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 2 }}>{t}</li>)}</ul>
                </Card>
              ))}
            </div>
          </>)}
          <SectionTitle sub="Nunca faça sozinha(o)">Rotina do Banho</SectionTitle>
          <Card style={{ borderLeft: `3px solid ${C.success}`, marginBottom: 24 }}>
            <p style={{ margin: "0 0 10px", fontWeight: 700, color: C.success, fontSize: 13 }}>🚿 Passo a passo</p>
            <ol style={{ margin: 0, paddingLeft: 20 }}>{bathTips.map((t, i) => <li key={i} style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 2 }}>{t}</li>)}</ol>
            <p style={{ margin: "10px 0 0", fontSize: 11, color: C.muted }}>⚠️ Água quente aumenta o edema e compromete a cicatrização.</p>
          </Card>
          <Card style={{ borderLeft: `3px solid ${C.danger}` }}>
            <p style={{ margin: "0 0 10px", fontWeight: 700, color: C.danger, fontSize: 13 }}>⚠️ Sinais de Alerta — contate o cirurgião imediatamente</p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {["Febre acima de 37,8°C","Secreção com odor ou coloração suspeita","Vermelhidão excessiva além da cicatriz","Escurecimento de pele (suspeita de necrose)","Dor intensa e progressiva","Inchaço rígido de crescimento rápido","Sangramento ativo","Falta de ar ou dor no peito"].map((t, i) => <li key={i} style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{t}</li>)}
            </ul>
          </Card>
        </div>
      )}

      {/* Tab: Guia Completo */}
      {tab === "guia" && (
        <div style={{ padding: 24 }}>
          <SectionTitle sub="Toque para expandir cada seção">Guia Completo Fox Recovery</SectionTitle>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: C.muted, margin: "0 0 16px", lineHeight: 1.6 }}>
              Este guia é baseado em evidências científicas e dividido por responsabilidade:
              {" "}<span style={{ color: C.danger, fontWeight: 700 }}>Médica</span> ·{" "}
              <span style={{ color: C.orange, fontWeight: 700 }}>Equipe Pós-op</span> ·{" "}
              <span style={{ color: C.success, fontWeight: 700 }}>Em Casa</span>
            </p>
          </div>
          {GUIDE_SECTIONS.map((sec) => <GuideSection key={sec.id} section={sec} />)}
        </div>
      )}

      <div style={{ padding: "0 24px 32px", textAlign: "center" }}>
        <p style={{ color: C.muted, fontSize: 11 }}>🦊 Fox Recovery · by Rafaella Lima<br /><span style={{ color: C.orange }}>@rafalimaestetica</span></p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────
const PROFILE_INIT = { name: "", cpf: "", email: "", age: "", weight: "", height: "", state: "", surgeon: "", genero: "", selectedSurgeries: [], prevSurgery: false, prevSurgeryDesc: "", notes: "" };
const POSTOP_INIT = { opDate: "", opTime: "", drain_date: "", klexane: false, klexane_start: "", klexane_end: "", meia: false, meia_start: "", malha: false, malha_start: "", dreno: false, dreno_retirada: "", placa: false, placa_start: "", eletroterapia: [] };

export default function FoxRecoveryApp() {
  const [screen, setScreen] = useState("splash");
  const [profile, setProfile] = useState(PROFILE_INIT);
  const [postOp, setPostOp] = useState(POSTOP_INIT);
  const [cadastroId, setCadastroId] = useState(null);

  const up = (setter) => (k, v) => setter((p) => ({ ...p, [k]: v }));

  function onFound({ profile: p, postOp: po, id }) {
    setProfile(p);
    setPostOp(po);
    setCadastroId(id);
    setScreen("dashboard");
  }

  function onSaved(id) {
    setCadastroId(id);
    setScreen("dashboard");
  }

  const steps = ["splash", "profile", "postop", "dashboard"];
  const stepIdx = steps.indexOf(screen);
  const showProgress = !["splash", "buscar"].includes(screen);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      {showProgress && (
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "12px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>🦊</span>
            <div style={{ flex: 1, height: 4, background: C.surface, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: C.orange, width: `${((stepIdx - 1) / 2) * 100}%`, transition: "width 0.3s", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, color: C.muted }}>{stepIdx}/3</span>
          </div>
        </div>
      )}
      {screen === "splash" && <SplashScreen onStart={() => setScreen("profile")} onBuscar={() => setScreen("buscar")} />}
      {screen === "buscar" && <BuscarScreen onFound={onFound} onBack={() => setScreen("splash")} />}
      {screen === "profile" && <ProfileStep data={profile} onChange={up(setProfile)} onNext={() => setScreen("postop")} />}
      {screen === "postop" && <PostOpStep profile={profile} data={postOp} onChange={up(setPostOp)} onNext={onSaved} onBack={() => setScreen("profile")} cadastroId={cadastroId} />}
      {screen === "dashboard" && <Dashboard profile={profile} postOp={postOp} />}
    </div>
  );
}
