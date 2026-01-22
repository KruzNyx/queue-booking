import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // สำคัญมาก
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).end();
const email = req.headers["x-admin-email"];
if (!email) return res.status(401).json({ error: "No admin" });
 const { data: admin } = await sb
  .from("admin_permissions")
  .select("role")
  .eq("email", email)
  .eq("active", true)
  .single();
if (!admin) return res.status(403).json({ error: "Not admin" });
  const { date, isClosed } = req.body;

  const { error } = await sb
    .from("booking_day_lock")
    .upsert(
      {
        work_date: date,
        is_locked: !isClosed
      },
      { onConflict: "work_date" }
    );

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
}
