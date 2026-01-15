const SB_URL = "https://vadyheyjiygkruehljly.supabase.co";
const SB_KEY = "sb_publishable_S1_LURvzKRzM_JgC4-x2vg_6L_XAN0X";
const sb = supabase.createClient(SB_URL, SB_KEY);

const ALLOWED_YEAR = 2026;
const ALLOWED_MONTHS = [0, 1];  // 0= มกรา 11=ธันวา
const MAX_PER_SLOT = 3;

const isAdmin =
  new URLSearchParams(window.location.search).get("kaiwan") === "adminroleja";
