/* =========================
   MODAL STATE
========================= */
let editingSlots = [];

/* =========================
   OPEN ADD MODAL
========================= */
function openAddModal(date) {
  isEditMode = false;
  isReadonlyMode = false;
  currentModalDate = date;

  selectedDates = [date];
  selectedWeekRange = getWeekRange(date);

  modal.style.display = "block";
  elModalTitle.textContent = "จองคิวใหม่";
  elModalDate.textContent = formatThaiDateAD(date);

  elStudentId.value = "";
  elStudentId.readOnly = false;
  elFullName.value = "";
  elNickname.value = "";
  elAmount.value = "";
  updateBookingSummary("", null);


  editingRole = isAdmin ? "admin" : "student";
  editingSlots = [];

          // const isAdminBooking = editingRole === "admin";
          // applySlotVisibility(editingSlots, isAdminBooking);

  document.querySelectorAll(".time-slots input").forEach(i => {
    i.checked = false;
    i.disabled = false;
  });

  document.getElementById("weekDayLabel").style.display = "block";
  document.getElementById("weekDaySelector").style.display = "flex";
  renderWeekDaySelector();

  delBtn.style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";

  document.querySelector(".modal-content")
    .classList.remove("booking-readonly");

  document.getElementById("readonlyNotice").style.display = "none";
  document.getElementById("weeklyInfo").textContent = "";
  document.getElementById("weeklyInfo").className = "info";

  updateTimeSlotAvailability(date);
}


// function openEditModal(studentId, date) {
//   isEditMode = true;
//   currentModalDate = date;
//   selectedDates = [date];
// selectedWeekRange = getWeekRange(date);

// document.getElementById("weekDayLabel").style.display = "block";
// document.getElementById("weekDaySelector").style.display = "flex";
// renderWeekDaySelector();

//   const records = allBookings.filter(
//     b => b.student_id === studentId && b.work_date === date
//   );
//   if (!records.length) return;

//   modal.style.display = "block";
//   elModalTitle.textContent = "รายละเอียดการจอง";
//   elModalDate.textContent = formatThaiDateAD(date);
  

//   elStudentId.value = records[0].student_id;
//   elFullName.value = records[0].full_name;
//   elNickname.value = records[0].nickname;
//   elAmount.value = formatNumberWithComma(String(records[0].amount || 0));

//   editingRole = records[0].role;
//   editingSlots = records.map(r => r.time_slot);

//   document.querySelectorAll(".time-slots input").forEach(i => {
//     i.checked = editingSlots.includes(i.value);
//   });

//   /* =========================
//      1. เช็คสิทธิ์เบื้องต้น (โหมดแก้ไขปกติ)
//   ========================= */
//   isReadonlyMode = !isAdmin && records[0].role === "admin";
//   const modalContent = document.querySelector(".modal-content");
//   const saveBtn = document.getElementById("saveBtn");
//   const notice = document.getElementById("readonlyNotice");

//   if (isReadonlyMode) {
//     // กรณีดูของที่แอดมินสร้าง
//     modalContent.classList.add("booking-readonly");
//     elFullName.readOnly = true;
//     elNickname.readOnly = true;
//     elAmount.readOnly = true;
//     document.querySelectorAll(".time-slots input").forEach(i => i.disabled = true);
//     saveBtn.style.display = "none";
//     delBtn.style.display = "none";
//     notice.style.display = "block";
//     notice.textContent = "คิวนี้สร้างโดยแอดมิน (อ่านอย่างเดียว)";
//   } else {
//     // กรณีดูของตัวเองในวันปกติ
//     modalContent.classList.remove("booking-readonly");
//     elFullName.readOnly = false;
//     elNickname.readOnly = false;
//     elAmount.readOnly = false;
//     document.querySelectorAll(".time-slots input").forEach(i => i.disabled = false);
//     saveBtn.style.display = "inline-block";
//     delBtn.style.display = "inline-block";
//     notice.style.display = "none";
//   }

//   /* =========================
//      2. เช็ค "วันล็อก" (เงื่อนไขนี้จะ Override ทุกอย่างถ้าเป็นจริง)
//   ========================= */
//   const isLocked = isDateLocked(date); // ฟังก์ชันเช็คจากตาราง lockedDays

//   if (isLocked && !isAdmin) {
//     // ถ้านักศึกษาเปิดดูในวันที่ล็อก ให้ทำเหมือนโหมด Readonly ทุกประการ
//     modalContent.classList.add("booking-readonly");
//     elFullName.readOnly = true;
//     elNickname.readOnly = true;
//     elAmount.readOnly = true;
//     document.querySelectorAll(".time-slots input").forEach(i => i.disabled = true);
    
//     // ซ่อนปุ่ม บันทึก และ ลบ ทันที
//     saveBtn.style.display = "none";
//     delBtn.style.display = "none";
    
//     // แสดงข้อความเตือน
//     notice.style.display = "block";
//     notice.textContent = "วันนี้ถูกปิดการจองแล้ว ไม่สามารถแก้ไขหรือลบได้";
//   }

//   updateTimeSlotAvailability(date);
// }


function openEditModal(studentId, date) {
  isEditMode = true;
  currentModalDate = date;

  selectedDates = [date];
  selectedWeekRange = getWeekRange(date);

  document.getElementById("weekDayLabel").style.display = "block";
  document.getElementById("weekDaySelector").style.display = "flex";
  renderWeekDaySelector();

  const records = allBookings.filter(
    b => b.student_id === studentId && b.work_date === date
  );
  if (!records.length) return;

  /* =========================
     OPEN MODAL
  ========================= */
  modal.style.display = "block";
  elModalTitle.textContent = "รายละเอียดการจอง";
  elModalDate.textContent = formatThaiDateAD(date);

  /* =========================
     FILL DATA
  ========================= */
  elStudentId.value = records[0].student_id;
  elStudentId.readOnly = true;

  elFullName.value = records[0].full_name;
  elNickname.value = records[0].nickname;
  elAmount.value = formatNumberWithComma(
    String(records[0].amount || 0)
  );

  editingRole = records[0].role;
  editingSlots = records.map(r => r.time_slot);

  document.querySelectorAll(".time-slots input").forEach(i => {
    i.checked = editingSlots.includes(i.value);
  });




  /* =========================
     🔐 PERMISSION (EDIT MODE)
     admin เท่านั้นที่แก้ / ลบได้
  ========================= */
  const modalContent = document.querySelector(".modal-content");
  const saveBtn = document.getElementById("saveBtn");
  const notice = document.getElementById("readonlyNotice");

  if (!isAdmin) {
    // ===== USER ธรรมดา =====
    isReadonlyMode = true;

    modalContent.classList.add("booking-readonly");

    elFullName.readOnly = true;
    elNickname.readOnly = true;
    elAmount.readOnly = true;

    document.querySelectorAll(".time-slots input").forEach(i => {
      i.disabled = true;
    });

    saveBtn.style.display = "none";
    delBtn.style.display = "none";

    notice.style.display = "block";
    notice.textContent = "เฉพาะแอดมินเท่านั้นที่สามารถแก้ไขหรือลบการจองได้";
  } else {
    // ===== ADMIN =====
    isReadonlyMode = false;

    modalContent.classList.remove("booking-readonly");

    elFullName.readOnly = false;
    elNickname.readOnly = false;
    elAmount.readOnly = false;

    document.querySelectorAll(".time-slots input").forEach(i => {
      i.disabled = false;
    });

    saveBtn.style.display = "inline-block";
    delBtn.style.display = "inline-block";

    notice.style.display = "none";
  }

  /* =========================
     🔒 DAY LOCK (override)
  ========================= */
  const isLocked = isDateLocked(date);

  if (isLocked && !isAdmin) {
    modalContent.classList.add("booking-readonly");

    elFullName.readOnly = true;
    elNickname.readOnly = true;
    elAmount.readOnly = true;

    document.querySelectorAll(".time-slots input").forEach(i => {
      i.disabled = true;
    });

    saveBtn.style.display = "none";
    delBtn.style.display = "none";

    notice.style.display = "block";
    notice.textContent = "วันนี้ถูกปิดการจองแล้ว ไม่สามารถแก้ไขหรือลบได้";
  }


          // const isAdminBooking = editingRole === "admin";
          // applySlotVisibility(editingSlots, isAdminBooking);
  updateTimeSlotAvailability(date);
}




/* =========================
   CLOSE MODAL
========================= */
function closeModal() {
  modal.style.display = "none";

  updateBookingSummary("", null); // ซ่อน summary + reset UI
  selectedWeekRange = null;
  selectedDates = [];
}


/* =========================
   WEEK DAY SELECTOR
========================= */
function renderWeekDaySelector() {
  const el = document.getElementById("weekDaySelector");
  el.innerHTML = "";
  if (!selectedWeekRange) return;

  let d = new Date(selectedWeekRange.start);
  const end = new Date(selectedWeekRange.end);

  while (d <= end) {
    const dateStr = d.toISOString().slice(0, 10);

    if (d.getDay() !== 0 && d.getDay() !== 6) {
      const checked = selectedDates.includes(dateStr);
      const isFirst = dateStr === currentModalDate;

      el.innerHTML += `
        <label class="week-day ${isFirst ? "first-day" : ""}">
          <input type="checkbox"
            ${checked ? "checked" : ""}
            ${isFirst ? "checked disabled" : ""}
            onchange="toggleModalWeekDate('${dateStr}', this.checked)">
          ${d.toLocaleDateString("th-TH", {
            weekday: "short",
            day: "numeric"
          })}
        </label>
      `;
    }
    d.setDate(d.getDate() + 1);
  }
}

function toggleModalWeekDate(dateStr, checked) {
  if (dateStr === currentModalDate) return;

  if (checked) {
    if (!selectedDates.includes(dateStr)) {
      selectedDates.push(dateStr);
    }
  } else {
    selectedDates = selectedDates.filter(d => d !== dateStr);
  }
}

// function applySlotVisibility(editingSlots = [], isAdminBooking = false) {
//   document.querySelectorAll(".time-slots input").forEach(input => {
//     const slot = input.value;
//     const wrapper = input.closest(".admin-only");
//     const label = document.querySelector(`label[for="${input.id}"]`);
//     const isAdminSlot = ADMIN_SLOTS.includes(slot);
//     const isSelected = editingSlots.includes(slot);

//     // ===== ADMIN =====
//     if (isAdmin) {
//       if (wrapper) wrapper.style.display = "";
//       input.disabled = false;
//       return;
//     }

//     // ===== STUDENT =====

//     // slot ปกติ 8.30–17.00 → แสดงปกติ
//     if (!isAdminSlot) {
//       input.disabled = false;
//       return;
//     }

//     // ===== slot พิเศษ =====

//     // ❌ ถ้า booking นี้ไม่ใช่ของ admin → ซ่อนหมด
//     if (!isAdminBooking) {
//       if (wrapper) wrapper.style.display = "none";
//       return;
//     }

//     // ✅ booking ของ admin
//     if (isSelected) {
//       // 👉 แสดงเฉพาะ slot ที่แอดมินเลือก
//       if (wrapper) wrapper.style.display = "";
//       input.checked = true;
//       input.disabled = true;
//       label.classList.add("slot-admin-readonly");
//     } else {
//       // 👉 slot พิเศษอื่น ซ่อน
//       if (wrapper) wrapper.style.display = "none";
//     }
//   });
// }