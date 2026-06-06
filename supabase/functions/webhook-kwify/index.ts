import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  // Verificação de segurança: n8n deve enviar o secret no header
  const secret = req.headers.get("x-webhook-secret");
  const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
  if (expectedSecret && secret !== expectedSecret) {
    return json({ error: "Não autorizado" }, 401);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const { name, email, phone } = body;

    if (!email) return json({ error: "E-mail obrigatório" }, 400);

    const appUrl = Deno.env.get("APP_URL") ?? "https://foxrecovery.vercel.app";

    // Gerar link de convite (cria o usuário no Auth + retorna o link)
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "invite",
      email: email.toLowerCase().trim(),
      options: {
        redirectTo: `${appUrl}/primeiro-acesso`,
        data: { name, phone },
      },
    });

    if (linkError) {
      // Usuário já existe — gerar link de recuperação de senha
      const { data: existingUser } = await admin.auth.admin.listUsers();
      const user = existingUser?.users?.find(
        (u) => u.email === email.toLowerCase().trim()
      );

      if (user) {
        const { data: resetData, error: resetError } = await admin.auth.admin.generateLink({
          type: "recovery",
          email: email.toLowerCase().trim(),
          options: { redirectTo: `${appUrl}/primeiro-acesso` },
        });
        if (resetError) throw resetError;

        return json({
          ok: true,
          tipo: "recuperacao",
          invite_link: resetData.properties.action_link,
          user_id: user.id,
        });
      }
      throw linkError;
    }

    const userId = linkData.user.id;
    const inviteLink = linkData.properties.action_link;

    // Criar ou atualizar o registro em cadastros
    await admin.from("cadastros").upsert(
      {
        user_id: userId,
        name: name ?? "",
        email: email.toLowerCase().trim(),
        phone: phone ?? null,
        onboarding_complete: false,
        selected_surgeries: [],
        eletroterapia: [],
      },
      { onConflict: "user_id" }
    );

    return json({
      ok: true,
      tipo: "convite",
      invite_link: inviteLink,
      user_id: userId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("webhook-kwify error:", msg);
    return json({ error: msg }, 500);
  }
});
