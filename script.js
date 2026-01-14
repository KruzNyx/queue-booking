/* ---------- Supabase ---------- */
const SB_URL = "https://vadyheyjiygkruehljly.supabase.co";
const SB_KEY = "sb_publishable_S1_LURvzKRzM_JgC4-x2vg_6L_XAN0X";
const sb = supabase.createClient(SB_URL, SB_KEY);

/* ---------- State ---------- */
const calendarEl = document.getElementById("calendar");
const modal = document.getElementById("modal");
const adminModal = document.getElementById("adminModal");

const elBookingId = document.getElementById("booking_id");
const elStudentId = document.getElementById("student_id");
const elFullName = document.getElementById("full_name");
const elNickname = document.getElementById("nickname");
const elModalTitle = document.getElementById("modalTitle");
const elModalDate = document.getElementById("modalDateDisplay");
const delBtn = document.getElementById("delBtn");

const monthSlicer = document.getElementById("monthSlicer");
const yearSlicer = document.getElementById("yearSlicer");

let currentViewDate = new Date();
let allBookings = [];

const isAdmin =
  new URLSearchParams(window.location.search).get("kaiwan") === "adminroleja";

/* ---------- Utils ---------- */
function groupByStudent(list) {
  const map = {};
  list.forEach(b => {
    if (!map[b.student_id]) {
      map[b.student_id] = {
        student_id: b.student_id,
        full_name: b.full_name,
        nickname: b.nickname,
        role: b.role,
        work_date: b.work_date,
        slots: []
      };
    }
    map[b.student_id].slots.push(b.time_slot);
  });
  return Object.values(map);
}

/* ---------- Init ---------- */
function initSlicers() {
  const months = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
                  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  months.forEach((m,i)=>monthSlicer.add(new Option(m,i)));

  const y = new Date().getFullYear();
  for(let i=y-1;i<=y+3;i++){
    yearSlicer.add(new Option(`พ.ศ. ${i+543}`, i));
  }
}

async function loadBookings() {
  const { data } = await sb
    .from("queue_booking")
    .select("*");
  allBookings = data || [];
}

/* ---------- Calendar ---------- */
function renderCalendar() {
  const y = currentViewDate.getFullYear();
  const m = currentViewDate.getMonth();
  monthSlicer.value = m;
  yearSlicer.value = y;

  const firstDay = new Date(y, m, 1).getDay();
  const totalDays = new Date(y, m + 1, 0).getDate();

  let html = `<thead><tr>`;
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d => html += `<th>${d}</th>`);
  html += `</tr></thead><tbody><tr>`;

  for (let i = 0; i < firstDay; i++) html += `<td></td>`;

for (let d = 1; d <= totalDays; d++) {
  const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const dayBookings = allBookings.filter(b => b.work_date === dateStr);
  const students = groupByStudent(dayBookings);

  let badges = "";
  students.forEach(s => {
    badges += `
      <span class="badge ${s.role}"
        onclick="event.stopPropagation(); openEditModal('${s.student_id}','${dateStr}')">
        ${s.nickname}${s.role === "admin" ? " " : ""}
      </span>`;
  });

  let adminBtn = "";
  if (isAdmin && dayBookings.length) {
    adminBtn = `
      <button class="mini-btn"
        onclick="event.stopPropagation(); openAdminDayView('${dateStr}')">
        ดูรายละเอียด
      </button>`;
  }

  // ✅ ตรวจสอบทุกช่องเต็มหรือไม่
  const countMap = {};
  dayBookings.forEach(b => {
    countMap[b.time_slot] = (countMap[b.time_slot] || 0) + 1;
  });

  let allFull = true;
  document.querySelectorAll(".time-slots input").forEach(input => {
    const count = countMap[input.value] || 0;
    if (count < MAX_PER_SLOT) allFull = false;
  });

  // ถ้าเต็มและไม่ใช่ admin ให้ปิดคลิกและเปลี่ยนสี td
  const tdClass = (!isAdmin && allFull) ? 'is-full' : '';

  html += `
  <td class="${tdClass}" onclick="${(!isAdmin && allFull)? '' : `openAddModal('${dateStr}')`}">
    <div class="date-row">
      <span class="date-num">${d}</span>
      ${adminBtn}  <!-- ปุ่ม mini-btn อยู่ข้างๆ เลขวันที่ -->
    </div>
    <div class="nickname-container">
      ${badges}
    </div>
  </td>`;


  if ((d + firstDay) % 7 === 0) html += `</tr><tr>`;
}

  calendarEl.innerHTML = html + `</tr></tbody>`;
}


/* ---------- Navigation ---------- */
function changeMonth(o){
  currentViewDate.setMonth(currentViewDate.getMonth()+o);
  renderCalendar();
}
function jumpToDate(){
  currentViewDate=new Date(yearSlicer.value,monthSlicer.value,1);
  renderCalendar();
}

/* ---------- Booking Modal ---------- */
function openAddModal(date){
  modal.style.display="block";
  elModalTitle.textContent="จองคิวใหม่";
  elModalDate.textContent="วันที่ "+date;
  elBookingId.value="";
  elStudentId.readOnly=false;
  elStudentId.value="";
  elFullName.value="";
  elNickname.value="";
  document.querySelectorAll(".time-slots input").forEach(c=>c.checked=false);
  delBtn.style.display="none";
  updateTimeSlotAvailability(date);
}

function openEditModal(studentId, date){
  const records = allBookings.filter(
    b => b.student_id===studentId && b.work_date===date
  );
  if(!records.length) return;

  modal.style.display="block";
  elModalTitle.textContent="รายละเอียดการจอง";
  elModalDate.textContent="วันที่ "+date;

  elBookingId.value = records[0].student_id;
  elStudentId.value = records[0].student_id;
  elStudentId.readOnly = true;
  elFullName.value = records[0].full_name;
  elNickname.value = records[0].nickname;

  const slots = records.map(r=>r.time_slot);
  document.querySelectorAll(".time-slots input").forEach(c=>{
    c.checked = slots.includes(c.value);
  });

  delBtn.style.display="block";
  updateTimeSlotAvailability(date);
}

function closeModal(){ modal.style.display="none"; }

/* ---------- Admin Day View ---------- */
function openAdminDayView(date){
  const list = allBookings.filter(b => b.work_date === date);
  const grouped = {};

  list.forEach(b=>{
    if(!grouped[b.time_slot]) grouped[b.time_slot]=[];
    grouped[b.time_slot].push(b);
  });

  let html = "";
  Object.keys(grouped)
  .sort((a,b)=>{
    const toMin = t => {
      const [h,m] = t.split(".").map(Number);
      return h*60 + m;
    };
    return toMin(a.split("-")[0]) - toMin(b.split("-")[0]);
  })
  .forEach(slot=>{
/* เรียงลำดับเวลา*/




    html+=`
      <div style="margin-bottom:10px">
        <strong>${slot}</strong>
        <ul>
          ${grouped[slot].map(b=>`
            <li>${b.nickname}${b.role==="admin"?" (Admin)":""}</li>
          `).join("")}
        </ul>
      </div>`;
  });

  document.getElementById("adminTitle").textContent =
    "📆 วันที่ " + formatThaiDate(date);
  document.getElementById("adminBody").innerHTML = html || "<p>ไม่มีข้อมูล</p>";
  adminModal.style.display="block";
}

function formatThaiDate(dateStr){
  const d = new Date(dateStr);
  const m = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
             "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`;
}

function closeAdminModal(){ adminModal.style.display="none"; }

/* ---------- CRUD ---------- */
function getSelectedTimeSlots(){
  return [...document.querySelectorAll(".time-slots input:checked")].map(c=>c.value);
}

async function saveBooking(){
  const date = elModalDate.textContent.replace("วันที่ ","");
  const slots = getSelectedTimeSlots();
  if(!elStudentId.value || !elFullName.value || !slots.length)
    return alert("กรอกข้อมูลไม่ครบ");

  await sb.from("queue_booking")
    .delete()
    .eq("student_id",elStudentId.value)
    .eq("work_date",date);

  await sb.rpc("book_queue",{
    p_date:date,
    p_student_id:elStudentId.value,
    p_full_name:elFullName.value,
    p_nickname:elNickname.value,
    p_time_slots:slots,
    p_role:isAdmin?"admin":"student"
  });

  closeModal();
  await loadBookings();
  renderCalendar();
}

async function deleteBooking(){
  if(!confirm("ยกเลิกการจองทั้งหมดของวันนี้?")) return;
  const date = elModalDate.textContent.replace("วันที่ ","");
  await sb.from("queue_booking")
    .delete()
    .eq("student_id",elStudentId.value)
    .eq("work_date",date);
  closeModal();
  await loadBookings();
  renderCalendar();
}

/* ---------- Start ---------- */
window.onload = async ()=>{
  initSlicers();
  await loadBookings();
  renderCalendar();
};


async function loadBookingDetail(date) {
  const { data, error } = await supabase
    .from("queue_booking")
    .select("time_slot, full_name, nickname, student_id")
    .eq("work_date", date)
    .order("time_slot");

  const box = document.getElementById("bookingDetail");
  const content = document.getElementById("bookingDetailContent");

  if (error || !data || data.length === 0) {
    box.style.display = "block";
    content.innerHTML = "<p>ยังไม่มีการจอง</p>";
    return;
  }

  // จัดกลุ่มตามช่วงเวลา
  const grouped = {};
  data.forEach(b => {
    if (!grouped[b.time_slot]) grouped[b.time_slot] = [];
    grouped[b.time_slot].push(b);
  });

  let html = "";
  Object.keys(grouped).forEach(slot => {
    html += `<div class="slot-group">
      <div class="slot-title">⏰ ${slot}</div>
    `;

    grouped[slot].forEach(u => {
      html += `<div class="slot-user">
        • ${u.full_name}${u.nickname ? ` (${u.nickname})` : ""} – ${u.student_id}
      </div>`;
    });

    html += `</div>`;
  });

  box.style.display = "block";
  content.innerHTML = html;
}


function selectDate(date) {
  selectedDate = date;
  renderCalendar();
  loadBookingDetail(date); // 👈 เพิ่มบรรทัดนี้
}

const studentInput = document.getElementById("student_id");

studentInput.addEventListener("input", () => {
  studentInput.value = studentInput.value
    .replace(/\D/g, "")
    .slice(0, 9);
});

const MAX_PER_SLOT = 5;

function updateTimeSlotAvailability(date) {
  const countMap = {};

  allBookings
    .filter(b => b.work_date === date)
    .forEach(b => {
      countMap[b.time_slot] = (countMap[b.time_slot] || 0) + 1;
    });

  document.querySelectorAll(".time-slots input").forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    const count = countMap[input.value] || 0;

    // 👑 admin เลือกได้เสมอ
    if (isAdmin) {
      input.disabled = false;
      label.classList.remove("slot-full");
      return;
    }

    // 👤 student จำกัด 5 คน
    if (count >= MAX_PER_SLOT && !input.checked) {
      input.disabled = true;
      label.classList.add("slot-full");
    } else {
      input.disabled = false;
      label.classList.remove("slot-full");
    }
  });
}




