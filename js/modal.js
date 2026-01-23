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

/* =========================
   OPEN EDIT MODAL
========================= */
function openEditModal(studentId, date) {
  isEditMode = true;
  currentModalDate = date;

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
     EDIT = วันเดียว
  ========================= */
  selectedDates = [date];
  selectedWeekRange = null;
  document.getElementById("weekDayLabel").style.display = "none";
  document.getElementById("weekDaySelector").style.display = "none";

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
     🔐 PERMISSION
     นศ + booking แอดมิน = readonly
  ========================= */
/* =========================
   🔐 PERMISSION
   นศ + booking แอดมิน = readonly
========================= */
isReadonlyMode = !isAdmin && records[0].role === "admin";

const modalContent = document.querySelector(".modal-content");
const saveBtn = document.getElementById("saveBtn");
const notice = document.getElementById("readonlyNotice");

if (isReadonlyMode) {
  // ===== READONLY MODE =====
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
} else {
  // ===== EDIT MODE =====
  modalContent.classList.remove("booking-readonly");

  elFullName.readOnly = false;
  elNickname.readOnly = false;
  elAmount.readOnly = false;

  document.querySelectorAll(".time-slots input").forEach(i => {
    i.disabled = false;
  });

  saveBtn.style.display = "inline-block";
  delBtn.style.display = "block";
  notice.style.display = "none";
}


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
