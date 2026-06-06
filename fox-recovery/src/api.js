const BASE = "https://tlwjbudrndrenlmffsld.supabase.co/functions/v1/cadastro";

async function call(method, jwt, body) {
  const headers = { "Content-Type": "application/json" };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const res = await fetch(BASE, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// Converte profile + postOp para o schema do banco
function toPayload(profile, postOp, onboardingComplete = false) {
  return {
    name: profile.name,
    phone: profile.phone || null,
    genero: profile.genero || null,
    age: profile.age ? Number(profile.age) : null,
    weight: profile.weight ? Number(profile.weight) : null,
    height: profile.height ? Number(profile.height) : null,
    state: profile.state || null,
    surgeon: profile.surgeon || null,
    selected_surgeries: profile.selectedSurgeries || [],
    prev_surgery: !!profile.prevSurgery,
    prev_surgery_desc: profile.prevSurgeryDesc || null,
    notes: profile.notes || null,
    op_date: postOp.opDate || null,
    op_time: postOp.opTime || null,
    drain_date: postOp.drain_date || null,
    klexane: !!postOp.klexane,
    klexane_start: postOp.klexane_start || null,
    klexane_end: postOp.klexane_end || null,
    meia: !!postOp.meia,
    meia_start: postOp.meia_start || null,
    malha: !!postOp.malha,
    malha_start: postOp.malha_start || null,
    dreno: !!postOp.dreno,
    dreno_retirada: postOp.dreno_retirada || null,
    placa: !!postOp.placa,
    placa_start: postOp.placa_start || null,
    eletroterapia: postOp.eletroterapia || [],
    onboarding_complete: onboardingComplete,
  };
}

// Converte linha do banco para os estados do app
export function fromPayload(row) {
  const profile = {
    name: row.name || "",
    phone: row.phone || "",
    genero: row.genero || "",
    age: row.age ? String(row.age) : "",
    weight: row.weight ? String(row.weight) : "",
    height: row.height ? String(row.height) : "",
    state: row.state || "",
    surgeon: row.surgeon || "",
    selectedSurgeries: row.selected_surgeries || [],
    prevSurgery: !!row.prev_surgery,
    prevSurgeryDesc: row.prev_surgery_desc || "",
    notes: row.notes || "",
  };
  const postOp = {
    opDate: row.op_date || "",
    opTime: row.op_time || "",
    drain_date: row.drain_date || "",
    klexane: !!row.klexane,
    klexane_start: row.klexane_start || "",
    klexane_end: row.klexane_end || "",
    meia: !!row.meia,
    meia_start: row.meia_start || "",
    malha: !!row.malha,
    malha_start: row.malha_start || "",
    dreno: !!row.dreno,
    dreno_retirada: row.dreno_retirada || "",
    placa: !!row.placa,
    placa_start: row.placa_start || "",
    eletroterapia: row.eletroterapia || [],
  };
  return {
    profile,
    postOp,
    id: row.id,
    onboardingComplete: !!row.onboarding_complete,
    email: row.email || "",
  };
}

// Buscar o próprio cadastro (usuário autenticado)
export async function buscarMeuCadastro(jwt) {
  return call("GET", jwt);
}

// Salvar onboarding completo
export async function salvarOnboarding(jwt, profile, postOp) {
  return call("PATCH", jwt, toPayload(profile, postOp, true));
}

// Atualizar dados sem marcar onboarding como completo
export async function atualizarCadastro(jwt, profile, postOp) {
  return call("PATCH", jwt, toPayload(profile, postOp, false));
}
