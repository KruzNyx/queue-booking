function openAddModal(date){  
  // if (!isAdmin && lockedDays[date]) return;
  if (!isAdmin && (lockedDays[date] || isDayFullyBooked(date))) return;
  currentModalDate = date;
  selectedWeekRange = getWeekRange(date);
  selectedDates = [date]; 

  modal.style.display="block";
  elModalTitle.textContent="จองคิวใหม่";
  elModalDate.textContent=formatThaiDateAD(date);
document.getElementById("weekDaySelector").style.display = "flex";

  renderWeekDaySelector();

  // clean  
  elBookingId.value="";
  elStudentId.value="";
  elStudentId.readOnly=false;
  elFullName.value="";
  elNickname.value="";
  elAmount.value="";

  //คนจอง
  editingRole = isAdmin ? "admin" : "student";

  document.querySelectorAll(".time-slots input").forEach(c=>{
    c.checked=false;
    c.disabled=false;
  });

  delBtn.style.display="none";
  updateTimeSlotAvailability(date);
}

function openEditModal(studentId, date){
// if (!isAdmin && isDayFullyBooked(date)) return;
    //ดึงdata from sb
  const records = allBookings.filter(
    b=>b.student_id===studentId && b.work_date===date
  );

  selectedDates = [date];
selectedWeekRange = null;
document.getElementById("weekDaySelector").style.display = "none";


  if(!records.length) return;

  currentModalDate = date;
  modal.style.display="block";

  //fill in data
  elModalTitle.textContent="รายละเอียดการจอง";
  elModalDate.textContent=formatThaiDateAD(date);

  elStudentId.value=records[0].student_id;
  elStudentId.readOnly=true;

  elFullName.value=records[0].full_name;
  elNickname.value=records[0].nickname;
  elAmount.value=formatNumberWithComma(String(records[0].amount||0));

  editingRole = records[0].role;

  const slots = records.map(r=>r.time_slot);
  document.querySelectorAll(".time-slots input").forEach(c=>{
    c.checked = slots.includes(c.value);
  });

    const isReadonly = !isAdmin && lockedDays[date] === true;
if (isEditMode) {
  document.getElementById("weekDaySelector").style.display = "none";
}


  document.querySelectorAll("input, select, textarea").forEach(el=>{
    el.disabled = isReadonly;
  });

  delBtn.style.display = isReadonly ? "none" : "block";

  updateTimeSlotAvailability(date);
if (!isAdmin) {
  const countMap = {};
  allBookings
    .filter(b=>b.work_date===date)
    .forEach(b=>countMap[b.time_slot]=(countMap[b.time_slot]||0)+1);


  document.querySelectorAll(".time-slots input").forEach(input=>{
    const count = countMap[input.value] || 0;

    // slot นี้เต็ม และไม่ใช่ slot ของตัวเอง → ล็อก
    if (count >= MAX_PER_SLOT && !input.checked) {
      input.disabled = true;
    }
  });
}


}

function closeModal(){
  modal.style.display="none";

  document.querySelectorAll("input, select, textarea").forEach(el=>{
    el.disabled = false;
  });

  document.querySelectorAll(".time-slots label")
    .forEach(l=>l.classList.remove("slot-full"));
}

function renderWeekDaySelector() {
  const el = document.getElementById("weekDaySelector");
  el.innerHTML = "";
  if (!selectedWeekRange) return;
  //   el.innerHTML += `<small class="hint"> "หัวข้อ"  // </small>`;
  let d = new Date(selectedWeekRange.start);
  const end = new Date(selectedWeekRange.end);

  while (d <= end) {
    const dateStr = d.toISOString().slice(0,10);

    // ข้าม เสาร์–อาทิตย์
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

