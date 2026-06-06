import { createClient } from "@supabase/supabase-js";

// A anon key é segura no frontend — ela só permite o que as políticas RLS
// autorizam. O service_role key (que tem poder de admin) fica apenas nos
// Edge Functions no servidor.
const supabase = createClient(
  "https://tlwjbudrndrenlmffsld.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsd2pidWRybmRyZW5sbWZmc2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ0NDMsImV4cCI6MjA5NjM1MDQ0M30.VyX3xamzrFM9hLHG6iOjoDWEDS5CorzQMKPZq_wrqeM"
);

export default supabase;
