const SB_URL = "https://vadyheyjiygkruehljly.supabase.co";
const SB_KEY = "sb_publishable_S1_LURvzKRzM_JgC4-x2vg_6L_XAN0X";
const sb = supabase.createClient(SB_URL, SB_KEY);

const ALLOWED_YEAR = 2026;
const ALLOWED_MONTHS = [ 1];  // 0 = มกรา
const MAX_PER_SLOT = 3;

const sbAdmin = supabase.createClient(SB_URL, SB_KEY, {
  global: {
    headers: { "x-admin": "true" }
  }
});

// ADMIN STATE
let isAdmin = false;

// ADMIN LOGIN
async function adminLogin(username, password) {
  const { data, error } = await sb.rpc("admin_login", {
    p_username: username,
    p_password: password
  });

  if (error || data !== true) {
    isAdmin = false;
    return false;
  }

  sessionStorage.setItem("admin_user", username);
  isAdmin = true;
  return true;
}

// RESTORE ADMIN SESSION
async function restoreAdminSession() {
  const username = sessionStorage.getItem("admin_user");
  if (!username) {
    isAdmin = false;
    return;
  }

  const { data } = await sb.rpc("is_admin", {
    p_username: username
  });

  isAdmin = data === true;
}

function afterAdminLogin() {
  isAdmin = true;

  // ปุ่ม admin
  document.body.classList.add('admin-mode');
  document.getElementById("adminLoginBtn").style.display = "none";
  document.getElementById("adminLogoutBtn").style.display = "inline-block";

  // ⭐ โชว์ช่วงเวลา admin-only (17.00–20.00)
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = ""; 
  });
}

// WEEKLY RULES
const WEEKLY_HOUR_RULES = [
  { min: 0,      max: 14999, maxHours: 3 },
  { min: 15000,  max: 19999, maxHours: 3 },
  { min: 20000,  max: 24999, maxHours: 4 },
  { min: 25000,  max: 31999, maxHours: 4 },
  { min: 32000,  max: 39999, maxHours: 5 },
  { min: 40000,  max: 49999, maxHours: 5 },
  { min: 50000,  maxHours: 6 },
];


function handleLogout() {
  if (confirm("ยืนยันการออกจากระบบแอดมิน?")) {
    sessionStorage.removeItem("admin_user");
    isAdmin = false;
    // alert("ออกจากระบบแล้ว");
    location.reload();
  }
}