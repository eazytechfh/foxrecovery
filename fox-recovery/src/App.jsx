import { useState, useEffect } from "react";
import supabase from "./supabaseClient.js";
import { buscarMeuCadastro, salvarOnboarding, fromPayload } from "./api.js";

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
// TELAS DE AUTH
// ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <span style={{ fontSize: 40 }}>🦊</span>
      <p style={{ color: C.muted, fontSize: 14 }}>Carregando...</p>
    </div>
  );
}

function SplashScreen({ onLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <span style={{ fontSize: 64, marginBottom: 16 }}>🦊</span>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display', serif" }}>Fox Recovery</h1>
      <p style={{ color: C.orange, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", margin: "8px 0 0", fontWeight: 700 }}>Método Fox Pós-Operatório</p>
      <p style={{ color: C.muted, fontSize: 14, marginTop: 20, maxWidth: 280, lineHeight: 1.6 }}>
        Acesse seu protocolo personalizado de recuperação pós-operatória.
      </p>
      <div style={{ marginTop: 40, width: "100%", maxWidth: 320 }}>
        <Btn onClick={onLogin}>Acessar minha conta →</Btn>
      </div>
      <p style={{ color: C.muted, fontSize: 11, marginTop: 40 }}>by Rafaella Lima · Consultório Fox</p>
    </div>
  );
}

function LoginScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    setErro("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw error;
    } catch {
      setErro("E-mail ou senha incorretos. Verifique e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 36 }}>🦊</span>
          <h2 style={{ margin: "8px 0 4px", fontSize: 22, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display', serif" }}>Bem-vinda de volta</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Entre com os dados enviados por e-mail</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          {erro && <p style={{ margin: 0, fontSize: 13, color: C.danger }}>{erro}</p>}
          <Btn onClick={handleLogin} disabled={loading || !email || !senha}>{loading ? "Entrando..." : "Entrar →"}</Btn>
          <Btn secondary onClick={onBack} small>← Voltar</Btn>
        </div>
      </div>
    </div>
  );
}

function PrimeiroAcessoScreen() {
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  async function handleCriarSenha() {
    setErro("");
    if (senha.length < 8) { setErro("A senha deve ter pelo menos 8 caracteres."); return; }
    if (senha !== confirma) { setErro("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setOk(true);
    } catch {
      setErro("Erro ao criar senha. Tente novamente ou solicite um novo link.");
    } finally {
      setLoading(false);
    }
  }

  if (ok) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <span style={{ fontSize: 48 }}>✅</span>
      <h2 style={{ margin: "16px 0 8px", color: C.text, fontFamily: "'Playfair Display', serif" }}>Senha criada!</h2>
      <p style={{ color: C.muted, fontSize: 14 }}>Redirecionando para o seu cadastro...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 36 }}>🔐</span>
          <h2 style={{ margin: "8px 0 4px", fontSize: 22, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display', serif" }}>Crie sua senha</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Escolha uma senha para acessar seu protocolo</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Nova senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres" />
          <Input label="Confirmar senha" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} placeholder="Repita a senha" />
          {erro && <p style={{ margin: 0, fontSize: 13, color: C.danger }}>{erro}</p>}
          <Btn onClick={handleCriarSenha} disabled={loading || !senha || !confirma}>{loading ? "Salvando..." : "Criar senha e continuar →"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APP — orquestração por estado de autenticação
// ─────────────────────────────────────────────────────────────
const PROFILE_INIT = { name: "", phone: "", age: "", weight: "", height: "", state: "", surgeon: "", genero: "", selectedSurgeries: [], prevSurgery: false, prevSurgeryDesc: "", notes: "" };
const POSTOP_INIT  = { opDate: "", opTime: "", drain_date: "", klexane: false, klexane_start: "", klexane_end: "", meia: false, meia_start: "", malha: false, malha_start: "", dreno: false, dreno_retirada: "", placa: false, placa_start: "", eletroterapia: [] };

export default function FoxRecoveryApp() {
  const [screen, setScreen] = useState(null); // null = carregando
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(PROFILE_INIT);
  const [postOp, setPostOp]   = useState(POSTOP_INIT);

  const up = (setter) => (k, v) => setter((p) => ({ ...p, [k]: v }));

  // Detectar link de convite/recuperação na URL
  const isPrimeiroAcesso = typeof window !== "undefined" &&
    (window.location.hash.includes("type=invite") || window.location.hash.includes("type=recovery"));

  useEffect(() => {
    // Escutar mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess);
      if (sess) {
        // Verificar se é primeiro acesso (convite)
        if (isPrimeiroAcesso && event === "SIGNED_IN") {
          setScreen("primeiro-acesso");
          return;
        }
        // Buscar cadastro do usuário
        try {
          const row = await buscarMeuCadastro(sess.access_token);
          const parsed = fromPayload(row);
          setProfile(parsed.profile);
          setPostOp(parsed.postOp);
          setScreen(parsed.onboardingComplete ? "dashboard" : "onboarding-profile");
        } catch {
          // Sem cadastro ainda (não deveria ocorrer, mas fallback seguro)
          setScreen("onboarding-profile");
        }
      } else {
        if (!isPrimeiroAcesso) setScreen("splash");
      }
    });

    // Checar sessão inicial
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s && !isPrimeiroAcesso) setScreen("splash");
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ainda detectando — mostrar loading
  if (screen === null) return <LoadingScreen />;

  // Telas de onboarding (após login, cadastro incompleto)
  const isOnboarding = screen === "onboarding-profile" || screen === "onboarding-postop";
  const onboardingStep = screen === "onboarding-profile" ? 1 : 2;

  async function handleSalvarOnboarding() {
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      await salvarOnboarding(s.access_token, profile, postOp);
      setScreen("dashboard");
    } catch (e) {
      alert("Erro ao salvar. Tente novamente.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Barra de progresso do onboarding */}
      {isOnboarding && (
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "12px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>🦊</span>
            <div style={{ flex: 1, height: 4, background: C.surface, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: C.orange, width: `${(onboardingStep / 2) * 100}%`, transition: "width 0.3s", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, color: C.muted }}>{onboardingStep}/2</span>
          </div>
        </div>
      )}

      {screen === "splash"          && <SplashScreen onLogin={() => setScreen("login")} />}
      {screen === "login"           && <LoginScreen onBack={() => setScreen("splash")} />}
      {screen === "primeiro-acesso" && <PrimeiroAcessoScreen />}
      {screen === "onboarding-profile" && (
        <ProfileStep data={profile} onChange={up(setProfile)} onNext={() => setScreen("onboarding-postop")} />
      )}
      {screen === "onboarding-postop" && (
        <PostOpStep
          profile={profile} data={postOp} onChange={up(setPostOp)}
          onNext={handleSalvarOnboarding}
          onBack={() => setScreen("onboarding-profile")}
          cadastroId={null}
        />
      )}
      {screen === "dashboard" && <Dashboard profile={profile} postOp={postOp} />}
    </div>
  );
}
