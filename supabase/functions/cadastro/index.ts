import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// Verifica o JWT e retorna o user autenticado
async function getUser(req: Request, admin: ReturnType<typeof createClient>) {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  const token = auth.replace("Bearer ", "");
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);

  try {
    // GET /cadastro — buscar cadastro do usuário autenticado
    if (req.method === "GET") {
      const user = await getUser(req, admin);
      if (!user) return json({ error: "Não autenticado" }, 401);

      const { data, error } = await admin
        .from("cadastros")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return json({ error: "NAO_ENCONTRADO" }, 404);
      return json(data);
    }

    // PATCH /cadastro — atualizar cadastro (onboarding ou edição)
    if (req.method === "PATCH") {
      const user = await getUser(req, admin);
      if (!user) return json({ error: "Não autenticado" }, 401);

      const body = await req.json();
      const payload = normalizar(body);

      // Garante que o usuário só atualiza o próprio registro
      const { data, error } = await admin
        .from("cadastros")
        .update(payload)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return json({ id: data.id, onboarding_complete: data.onboarding_complete });
    }

    return json({ error: "Método não permitido" }, 405);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
});

function normalizar(body: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...body };
  // Remover campos que não devem ser sobrescritos pelo cliente
  delete out.id;
  delete out.user_id;
  delete out.created_at;
  if (out.email) out.email = String(out.email).toLowerCase().trim();
  if (!Array.isArray(out.selected_surgeries)) out.selected_surgeries = [];
  if (!Array.isArray(out.eletroterapia)) out.eletroterapia = [];
  return out;
}
