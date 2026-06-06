import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetados automaticamente
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);

  try {
    // POST /cadastro — criar novo cadastro
    if (req.method === "POST") {
      const body = await req.json();

      // Verificar se já existe cadastro com mesmo CPF ou e-mail
      if (body.cpf || body.email) {
        let q = supabase.from("cadastros").select("id");
        if (body.cpf) q = q.eq("cpf", body.cpf.replace(/\D/g, ""));
        else q = q.eq("email", body.email.toLowerCase().trim());

        const { data: existing } = await q.maybeSingle();
        if (existing) {
          return json({ error: "CPF_OU_EMAIL_JA_CADASTRADO", id: existing.id }, 409);
        }
      }

      const payload = normalizar(body);
      const { data, error } = await supabase
        .from("cadastros")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return json({ id: data.id });
    }

    // GET /cadastro?cpf=xxx  ou  ?email=xxx — buscar cadastro
    if (req.method === "GET") {
      const cpf = url.searchParams.get("cpf");
      const email = url.searchParams.get("email");

      if (!cpf && !email) return json({ error: "Informe cpf ou email" }, 400);

      let q = supabase.from("cadastros").select("*");
      if (cpf) q = q.eq("cpf", cpf.replace(/\D/g, ""));
      else q = q.eq("email", email!.toLowerCase().trim());

      const { data, error } = await q
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return json({ error: "NAO_ENCONTRADO" }, 404);
      return json(data);
    }

    // PATCH /cadastro — atualizar cadastro existente
    if (req.method === "PATCH") {
      const body = await req.json();
      const { id, ...rest } = body;
      if (!id) return json({ error: "id obrigatório" }, 400);

      const payload = normalizar(rest);
      const { data, error } = await supabase
        .from("cadastros")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return json({ id: data.id });
    }

    return json({ error: "Método não permitido" }, 405);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
});

function normalizar(body: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...body };
  if (out.cpf) out.cpf = String(out.cpf).replace(/\D/g, "");
  if (out.email) out.email = String(out.email).toLowerCase().trim();
  // garantir arrays como JSON
  if (!Array.isArray(out.selected_surgeries)) out.selected_surgeries = [];
  if (!Array.isArray(out.eletroterapia)) out.eletroterapia = [];
  return out;
}
