const BASE = "https://tlwjbudrndrenlmffsld.supabase.co/functions/v1/cadastro";

async function call(method, params = {}) {
  let url = BASE;
  let body;

  if (method === "GET") {
    const qs = new URLSearchParams(params).toString();
    url = `${BASE}?${qs}`;
  } else {
    body = JSON.stringify(params);
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// Converte profile + postOp para o schema do banco
function toPayload(profile, postOp) {
  return {
    cpf: profile.cpf || null,
    email: profile.email || null,
    name: profile.name,
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
  };
}

// Converte resposta do banco de volta para os estados do app
export function fromPayload(row) {
  const profile = {
    cpf: row.cpf || "",
    email: row.email || "",
    name: row.name || "",
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
  return { profile, postOp, id: row.id };
}

export async function criarCadastro(profile, postOp) {
  return call("POST", toPayload(profile, postOp));
}

export async function atualizarCadastro(id, profile, postOp) {
  return call("PATCH", { id, ...toPayload(profile, postOp) });
}

export async function buscarPorCpf(cpf) {
  return call("GET", { cpf: cpf.replace(/\D/g, "") });
}

export async function buscarPorEmail(email) {
  return call("GET", { email });
}
