function isWeekend(dateStr) {
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

//รวมการจากตามชื่อนศ
function groupByStudent(list) {
  const map = {};
  list.forEach(b => {
    if (!map[b.student_id]) {
      map[b.student_id] = {
        student_id: b.student_id,
        full_name: b.full_name,
        nickname: b.nickname,
        role: b.role,
        is_noshow: b.is_noshow,
        slots: []
      };
    }
    map[b.student_id].slots.push(b.time_slot);
  });
  return Object.values(map);
}

//hsort thai date
function formatThaiDate(dateStr){
  const d = new Date(dateStr);
  const m = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`;
}

//long thai date
function formatThaiDateAD(dateStr) {
  const d = new Date(dateStr);
  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  return `วันที่ ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}


function formatNumberWithComma(value) {
  if (!value) return "";
  value = value.replace(/[^0-9.]/g, "");
  const parts = value.split(".");
  let integer = parts[0];
  let decimal = parts[1]?.slice(0, 2);
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal !== undefined ? `${integer}.${decimal}` : integer;
}


function isDayFullyBooked(dateStr){
  const countMap = {};
  allBookings
    .filter(b => b.work_date === dateStr)
    .forEach(b => {
      countMap[b.time_slot] = (countMap[b.time_slot] || 0) + 1;
    });

  const allSlots = [...document.querySelectorAll(".time-slots input")]
    .map(i => i.value);

  return allSlots.length > 0 && allSlots.every(
    slot => (countMap[slot] || 0) >= MAX_PER_SLOT
  );
}

function getWeekRange(dateStr){
  const d = new Date(dateStr);
  const day = d.getDay() || 7; // จ.-ศ.
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const fmt = d =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  return { start: fmt(monday), end: fmt(friday) };
}

function getWeeklyBookedHours(studentId, date){
  const { start, end } = getWeekRange(date);
  return allBookings.filter(b =>
    b.student_id === studentId &&
    b.work_date >= start &&
    b.work_date <= end
  ).length;
}

function getCurrentEditingSlots(studentId, date){
  return allBookings.filter(
    b => b.student_id === studentId && b.work_date === date
  ).length;
}


function getAllowedHours(amount){
  const rule = WEEKLY_HOUR_RULES.find(r =>
    amount >= r.min && (r.max === undefined || amount <= r.max)
  );
  return rule ? rule.maxHours : 0;
}



// 🔒 default lock rule
function isDateLocked(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  // 1. ถ้ามีข้อมูลที่แอดมิน "ตั้งใจ" เซ็ตไว้ในฐานข้อมูล (Override ทุกกฎ)
  if (lockedDays[dateStr] !== undefined) {
    return lockedDays[dateStr] === true;
  }

  // 2. ถ้าไม่มีการตั้งค่าพิเศษ และเป็น "วันย้อนหลัง" -> ปิดอัตโนมัติ
  if (targetDate < today) {
    return true; 
  }

  // 3. ถ้าเป็นวันในอนาคตที่ยังไม่ถูกตั้งค่า -> ปิดเฉพาะวันหยุด
  return isWeekend(dateStr);
}


// // 🔒 default lock rule
// function isDateLocked(dateStr) {
//   // admin เคยตั้งค่าไว้ → ใช้ค่านั้น
//   if (lockedDays[dateStr] !== undefined) {
//     return lockedDays[dateStr] === true;
//   }

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
  
//   const targetDate = new Date(dateStr);
//   targetDate.setHours(0, 0, 0, 0);

//   if (targetDate < today) {
//     return true; // ปิดอัตโนมัติเพราะผ่านมาแล้ว
//   }

//   // ❗ ถ้าไม่มี record → weekend = ปิด
//   return isWeekend(dateStr);
// }






// function updateBookingSummary(studentId, date) {
//   const summary = document.getElementById("bookingSummary");
//   if (!summary) return;

//   // ❌ ยังไม่พร้อม → ซ่อน
//   if (!studentId || !date) {
//     summary.style.display = "none";
//     return;
//   }

//   const used = getWeeklyBookedHours(studentId, date);
//   const amount = Number(elAmount.value.replace(/,/g, "")) || 0;
//   const max = getAllowedHours(amount);

//   document.getElementById("usedHours").textContent = used;
//   document.getElementById("maxHours").textContent = max;

//   summary.style.display = "inline-flex";

//   // reset state
//   summary.classList.remove("near-limit", "full");

//   if (max > 0) {
//     const ratio = used / max;
//     if (ratio >= 1) {
//       summary.classList.add("full");
//     } else if (ratio >= 0.8) {
//       summary.classList.add("near-limit");
//     }
//   }
// }

function updateBookingSummary(studentId, date) {
  const summary = document.getElementById("bookingSummary");
  if (!summary) return;

  // reset
  if (!studentId || !date) {
    summary.style.display = "none";
    setWeeklyFullUI(false);
    return;
  }

  const used = getWeeklyBookedHours(studentId, date);
  const amount = Number(elAmount.value.replace(/,/g, "")) || 0;
  const max = getAllowedHours(amount);

  document.getElementById("usedHours").textContent = used;
  document.getElementById("maxHours").textContent = max;

  summary.style.display = "inline-flex";
  summary.classList.remove("near-limit", "full");

  if (max > 0) {
    const ratio = used / max;

    if (ratio >= 1 && !isAdmin) {
      summary.classList.add("full");
      setWeeklyFullUI(true);
      return;
    }

    if (ratio >= 0.8) {
      summary.classList.add("near-limit");
    }
  }

  setWeeklyFullUI(false);
}



function openBookingModal(date) {
  currentModalDate = date;

  // reset
  elStudentId.value = "";
  elFullName.value = "";
  elNickname.value = "";
  elAmount.value = "";
  document.getElementById("booking_id").value = "";

  updateBookingSummary("", null); // ซ่อนก่อน

  document.getElementById("bookingModal").style.display = "block";
}


function setWeeklyFullUI(isFull) {
  const saveBtn = document.getElementById("saveBtn");

  // time slots
  document.querySelectorAll(".time-slots input").forEach(i => {
    i.disabled = isFull;
  });

  // text inputs
  [elFullName, elNickname, elAmount].forEach(el => {
    el.readOnly = isFull;
    el.classList.toggle("readonly", isFull);
  });

  // save button
  if (isFull) {
    saveBtn.disabled = true;
    saveBtn.textContent = "ชั่วโมงทำงานสัปดาห์นี้เต็มแล้ว";
    saveBtn.classList.add("disabled");
  } else {
    saveBtn.disabled = false;
    saveBtn.textContent = "บันทึก";
    saveBtn.classList.remove("disabled");
  }
}


// const ADMIN_SLOTS = [
//   "17.00-18.00",
//   "18.00-19.00",
//   "19.00-20.00",
//   "20.00-21.00"
// ];