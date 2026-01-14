/* ---------- Supabase ---------- */
const SB_URL = "https://vadyheyjiygkruehljly.supabase.co";
const SB_KEY = "sb_publishable_S1_LURvzKRzM_JgC4-x2vg_6L_XAN0X";
const sb = supabase.createClient(SB_URL, SB_KEY);


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
let editingRole = "student";
let lockedDays = {};

const isAdmin =
  new URLSearchParams(window.location.search).get("kaiwan") === "adminroleja";


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

function initMonthSlicer(){
  const months = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
                  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  monthSlicer.innerHTML="";
  months.forEach((m,i)=>monthSlicer.add(new Option(m,i)));
}



async function loadBookings() {
  const { data } = await sb
    .from("queue_booking")
    .select("*");
  allBookings = data || [];
}

async function loadLockedDays(){
  const { data } = await sb
    .from("booking_day_lock")
    .select("work_date, is_locked");

  lockedDays = {};
  (data || []).forEach(d => {
    lockedDays[d.work_date] = d.is_locked;
  });
}


async function toggleDay(dateStr, isClosed) {
  const { error } = await sb
    .from("booking_day_lock")
    .upsert(
      {
        work_date: dateStr,
        is_locked: !isClosed
      },
      { onConflict: "work_date" }
    );

  if (error) {
    alert("เกิดข้อผิดพลาด");
    console.error(error);
    return;
  }

await loadLockedDays();
renderCalendar();
}


/****** Calendar ******/
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

    /****** badge ******/
    let badges = "";
    students.forEach(s => {
      badges += `
        <span class="badge ${s.role}"
          onclick="event.stopPropagation(); openEditModal('${s.student_id}','${dateStr}')">
          ${s.nickname}${s.role === "admin" ? " " : ""}
        </span>`;
    });

    /****** ปุ่มดูรายละเอียด (ที่เดิม) ******/
    let adminDetailBtn = "";
    if (isAdmin && dayBookings.length > 0) {
      adminDetailBtn = `
        <button class="mini-btn"
          onclick="event.stopPropagation(); openAdminDayView('${dateStr}')">
          ดูรายละเอียด
        </button>`;
    }

    /****** ปุ่มปิดการจอง (ที่เดิม) ******/
const isClosed = lockedDays[dateStr] === true;


let adminCloseBtn = "";
if (isAdmin) {
  adminCloseBtn = `
    <button class="mini-btn ${isClosed ? "btn-open" : "btn-close-booking"}"
      onclick="event.stopPropagation(); toggleDay('${dateStr}', ${isClosed})">
      ${isClosed ? "เปิดการจอง" : "ปิดการจอง"}
    </button>`;
}





    /******ตรวจ slot เต็ม ******/
    const countMap = {};
    dayBookings.forEach(b => {
      countMap[b.time_slot] = (countMap[b.time_slot] || 0) + 1;
    });

    let allFull = true;
    document.querySelectorAll(".time-slots input").forEach(input => {
      if ((countMap[input.value] || 0) < MAX_PER_SLOT) {
        allFull = false;
      }
    });

    /****** class + สิทธิ์คลิก ******/
const tdClass =
  (!isAdmin && isClosed) ? "is-locked" : "";

const canClick =
  isAdmin || !isClosed;



    html += `
      <td class="${tdClass}" ${canClick ? `onclick="openAddModal('${dateStr}')"` : ""}>

        
          <div class="date-row">
            <span class="date-num">${d}</span>
            ${adminDetailBtn}
            ${adminCloseBtn}
          </div>


        <div class="nickname-container">
          ${badges}
        </div></td>`;

    if ((d + firstDay) % 7 === 0) html += `</tr><tr>`;
  }

  calendarEl.innerHTML = html + `</tr></tbody>`;
}


function changeMonth(o){
  currentViewDate.setMonth(currentViewDate.getMonth()+o);
  renderCalendar();
}
function jumpToDate(){
  currentViewDate = new Date(
    Number(yearSlicer.value),
    Number(monthSlicer.value),
    1
  );
  renderCalendar();
}


/******หน้าจอง******/
function openAddModal(date){

  if (!isAdmin && lockedDays[date]) return;
  currentModalDate = date;

  modal.style.display="block";
  elModalTitle.textContent="จองคิวใหม่";
  elModalDate.textContent="วันที่ "+date;

  elBookingId.value = "";

  elStudentId.value = "";
  elStudentId.readOnly = false;
  elStudentId.disabled = false;

  elFullName.value = "";
  elFullName.readOnly = false;
  elFullName.disabled = false;

  elNickname.value = "";
  elNickname.readOnly = false;
  elNickname.disabled = false;

  elAmount.value = "";
  elAmount.readOnly = false;
  elAmount.disabled = false;


  editingRole = isAdmin ? "admin" : "student";

  document.querySelectorAll(".time-slots input").forEach(c=>{
    c.checked=false;
    c.disabled=false;
  });

  delBtn.style.display="none";
  document.getElementById("saveBtn").disabled = false;

  updateTimeSlotAvailability(date);
  
}


function openEditModal(studentId, date){
  const isLocked = lockedDays[date] === true;
  const isReadOnly = !isAdmin && isLocked;

  const records = allBookings.filter(
    b => b.student_id === studentId && b.work_date === date
  );
  if (!records.length) return;
  currentModalDate = date;

  modal.style.display = "block";
  elModalTitle.textContent = "รายละเอียดการจอง";
  elModalDate.textContent = "วันที่ " + date;

  elBookingId.value = records[0].id;
  elStudentId.value = records[0].student_id;
  elStudentId.readOnly = true;
  elStudentId.disabled = true;

  elFullName.value = records[0].full_name;
  elNickname.value = records[0].nickname;
  elAmount.value = formatNumberWithComma(String(records[0].amount || 0));

  //****** ล็อค input text
  elFullName.readOnly = isReadOnly;
  elFullName.disabled = isReadOnly;

  elNickname.readOnly = isReadOnly;
  elNickname.disabled = isReadOnly;

  elAmount.readOnly = isReadOnly;
  elAmount.disabled = isReadOnly;

  editingRole = records[0].role; // ใช้ role เดิม


  //**** ล็อค time slot
  const slots = records.map(r => r.time_slot);
  document.querySelectorAll(".time-slots input").forEach(c => {
    c.checked = slots.includes(c.value);
    c.disabled = isReadOnly;
  });

  //**** ล๊อคปุ่ม action
  delBtn.style.display = isReadOnly ? "none" : "block";
  document.getElementById("saveBtn").disabled = isReadOnly;

  updateTimeSlotAvailability(date);
}


function closeModal(){
  modal.style.display = "none";

  elBookingId.value = "";
  elStudentId.value = "";
  elStudentId.readOnly = false;

  elFullName.value = "";
  elFullName.readOnly = false;
  elFullName.disabled = false;

  elNickname.value = "";
  elNickname.readOnly = false;
  elNickname.disabled = false;

  elAmount.value = "";
  elAmount.readOnly = false;
  elAmount.disabled = false;

  document.querySelectorAll(".time-slots input").forEach(c => {
    c.checked = false;
    c.disabled = false;
  });

  delBtn.style.display = "none";
  document.getElementById("saveBtn").disabled = false;
}



/****** Admin View ******/
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


/* เรียงลำดับเวลา***/




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
  const date = currentModalDate;

  if (!isAdmin && lockedDays[date]) {
    alert("วันนี้ปิดการจอง ไม่สามารถแก้ไขได้");
    return;
  }
  const slots = getSelectedTimeSlots();

  const amountValue = elAmount.value.replace(/,/g, "");

  if (!elStudentId.value || !elFullName.value || !slots.length || !amountValue)
    return alert("กรอกข้อมูลไม่ครบ");


  await sb.from("queue_booking")
    .delete()
    .eq("student_id", elStudentId.value)
    .eq("work_date", date);

  //*** */ Call RPC ครั้งเดียว
  await sb.rpc("book_queue",{
    p_date: date,
    p_student_id: elStudentId.value,
    p_full_name: elFullName.value,
    p_nickname: elNickname.value,
    p_time_slots: slots,
    p_amount: Number(amountValue),
    p_role: editingRole

  });

closeModal();
location.reload();


}

async function deleteBooking(){
  if(!confirm("ยกเลิกการจองทั้งหมดของวันนี้?")) return;
  const date = currentModalDate;
  await sb.from("queue_booking")
    .delete()
    .eq("student_id",elStudentId.value)
    .eq("work_date",date);
closeModal();
location.reload();
}

window.onload = async () => {
  initMonthSlicer();
  initYearSlicer();
  await loadBookings();
  await loadLockedDays();
  renderCalendar();
};


async function loadBookingDetail(date) {
  const { data, error } = await sb
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
  loadBookingDetail(date);
  
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

    // dmin 
    if (isAdmin) {
      input.disabled = false;
      label.classList.remove("slot-full");
      return;
    }

    // นศ 5 คน
    if (count >= MAX_PER_SLOT && !input.checked) {
      input.disabled = true;
      label.classList.add("slot-full");
    } else {
      input.disabled = false;
      label.classList.remove("slot-full");
    }
  });
}

function formatNumberWithComma(value) {
  if (!value) return "";

  // delete all ยกเว้นเลข .
  value = value.replace(/[^0-9.]/g, "");

  // แยกทศนิยม
  const parts = value.split(".");
  let integer = parts[0];
  let decimal = parts[1]?.slice(0, 2); // จำกัด 2 ตำแหน่ง

  // ใส่ comma
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimal !== undefined ? `${integer}.${decimal}` : integer;
}

const elAmount = document.getElementById("amount");
elAmount.addEventListener("input", () => {
  const cursor = elAmount.selectionStart;
  const raw = elAmount.value;

  elAmount.value = formatNumberWithComma(raw);

  // กัน cursor 
  elAmount.setSelectionRange(elAmount.value.length, elAmount.value.length);
});


function initYearSlicer() {
  yearSlicer.innerHTML="";
  const y = new Date().getFullYear();
  for (let i = y - 1; i <= y + 3; i++) {
    yearSlicer.add(new Option(i, i)); // แสดง = ค่า = ค.ศ.
  }
}

