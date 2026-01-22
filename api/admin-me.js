import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const email = req.headers["x-admin-email"];

  if (!email) {
    return res.status(401).json({ isAdmin: false });
  }

  const { data } = await supabase
    .from("admin_permissions")
    .select("role")
    .eq("email", email)
    .eq("active", true)
    .single();

  if (!data) {
    return res.status(403).json({ isAdmin: false });
  }

  res.json({
    isAdmin: true,
    role: data.role
  });
}
