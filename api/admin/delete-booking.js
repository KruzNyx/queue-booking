import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase env");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = req.headers["x-admin-email"];
  if (!email) {
    return res.status(401).json({ error: "No admin email" });
  }

  // ✅ ตรวจสิทธิ admin
  const { data: admin } = await supabase
    .from("admin_permissions")
    .select("role")
    .eq("email", email)
    .eq("active", true)
    .single();

  if (!admin) {
    return res.status(403).json({ error: "Not admin" });
  }

  const { student_id, work_date, time_slot } = req.body;

  if (!student_id || !work_date || !time_slot) {
    return res.status(400).json({ error: "Missing data" });
  }

  // ✅ ลบคิว (server-only)
  const { error } = await supabase
    .from("queue_booking")
    .delete()
    .eq("student_id", student_id)
    .eq("work_date", work_date)
    .eq("time_slot", time_slot);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ success: true });
}
