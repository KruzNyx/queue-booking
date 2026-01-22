const SB_URL = "https://vadyheyjiygkruehljly.supabase.co";
const SB_KEY = "sb_publishable_S1_LURvzKRzM_JgC4-x2vg_6L_XAN0X";
const sb = supabase.createClient(SB_URL, SB_KEY);

const ALLOWED_YEAR = 2026;
const ALLOWED_MONTHS = [0, 1];  // 0= มกรา 11=ธันวา
const MAX_PER_SLOT = 3;

// const isAdmin =
//   new URLSearchParams(window.location.search).get("kaiwan") === "adminroleja";
async function checkAdmin() {
  const email = prompt("กรอกอีเมล (admin หรือ student ก็ได้)");
  if (!email) {
    alert("ยังไม่ได้กรอกอีเมล ใช้โหมด student");
  }

  if (email) {
    const res = await fetch("/api/admin-me", {
      headers: { "x-admin-email": email }
    });

    if (res.ok) {
      const data = await res.json();
      console.log("admin check:", data);

      if (data.isAdmin) {
        isAdmin = true;
        adminEmail = email;
        alert("✅ เข้าสู่โหมดแอดมิน");
      } else {
        alert("👩‍🎓 โหมดนักศึกษา (ดูตารางอย่างเดียว)");
      }
    }
  }

  // 🔥 สำคัญ: โหลดข้อมูล + render เสมอ
  await loadBookings();
  await loadLockedDays();
  renderCalendar();
}

const WEEKLY_HOUR_RULES = [
  { min: 8000,  max: 14999, maxHours: 3 },
  { min: 15000, max: 19999, maxHours: 3 },
  { min: 20000, max: 24999, maxHours: 4 },
  { min: 25000, max: 31999, maxHours: 4 },
  { min: 32000, max: 39999, maxHours: 5 },
  { min: 40000, max: 49999, maxHours: 5 },
  { min: 50000, maxHours: 6 },

];
