const SB_URL = "https://vadyheyjiygkruehljly.supabase.co";
const SB_KEY = "sb_publishable_S1_LURvzKRzM_JgC4-x2vg_6L_XAN0X";
const sb = supabase.createClient(SB_URL, SB_KEY);

const ALLOWED_YEAR = 2026;
const ALLOWED_MONTHS = [0, 1];  // 0= มกรา 11=ธันวา
const MAX_PER_SLOT = 3;

// const isAdmin =
//   new URLSearchParams(window.location.search).get("kaiwan") === "adminroleja";
let isAdmin = false;
async function adminLogin(username, password) {
  const { data, error } = await sb
    .from("admin_users")
    .select("id, username")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    isAdmin = false;
    return false;
  }

  // จำสถานะแอดมินไว้
  localStorage.setItem("admin_user", username);
  isAdmin = true;
  return true;
}

async function restoreAdminSession() {
  const username = localStorage.getItem("admin_user");
  if (!username) {
    isAdmin = false;
    return;
  }

  const { data } = await sb
    .from("admin_users")
    .select("username")
    .eq("username", username)
    .single();

  isAdmin = !!data;
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
