import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    student_id,
    full_name,
    nickname,
    amount,
    dates,
    slots
  } = req.body;

  if (!student_id || !dates?.length || !slots?.length)
    return res.status(400).json({ error: "missing data" });

  const results = [];

  for (const d of dates) {
    const { data, error } = await sb.rpc("book_queue", {
      p_date: d,
      p_student_id: student_id,
      p_full_name: full_name,
      p_nickname: nickname,
      p_time_slots: slots,
      p_amount: amount
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    results.push({ date: d, result: data });
  }

  res.json({ success: true, results });
}
