function getSelectedTimeSlots(){
  return [...document.querySelectorAll(".time-slots input:checked")].map(c=>c.value);
}

async function saveBooking(){
async function saveBooking() {
  const amount = Number(elAmount.value.replace(/,/g, ""));
  const slots = getSelectedTimeSlots();

  if (!elStudentId.value || !elFullName.value || !slots.length || !amount) {
    alert("กรอกข้อมูลไม่ครบ");
    return;
  }

  if (!isAdmin) {
    const weeklyUsed = getWeeklyBookedHours(elStudentId.value, currentModalDate);
    const allowed = getAllowedHours(amount);
    const willUse = slots.length * selectedDates.length;

    if (weeklyUsed + willUse > allowed) {
      alert(`สัปดาห์นี้จองได้ไม่เกิน ${allowed} ชั่วโมง`);
      return;
    }
  }

  const res = await fetch("/api/booking/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: elStudentId.value,
      full_name: elFullName.value,
      nickname: elNickname.value,
      amount,
      dates: selectedDates,
      slots
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "เกิดข้อผิดพลาด");
    return;
  }

  closeModal();
  await loadBookings();
  renderCalendar();
}}

async function deleteBooking(){
  // if (!isAdmin && lockedDays[currentModalDate] === true) {
  if (!isAdmin && lockedDays[currentModalDate] === true) {
    alert("วันนี้ปิดการจอง ไม่สามารถยกเลิกได้");
    return;
  }

  if(!confirm("ยกเลิกการจองทั้งหมดของวันนี้?")) return;

  await fetch("/api/admin/delete-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-email": adminEmail
    },
    body: JSON.stringify({
      student_id: elStudentId.value,
      work_date: currentModalDate
    })
  });

  closeModal();
  location.reload();
}


function updateTimeSlotAvailability(date){
  const countMap = {};
  allBookings
    .filter(b => b.work_date === date)
    .forEach(b => countMap[b.time_slot] = (countMap[b.time_slot] || 0) + 1);

  document.querySelectorAll(".time-slots input").forEach(input=>{
    const label = document.querySelector(`label[for="${input.id}"]`);
    input.disabled = false;
    label.classList.remove("slot-full");

    if (isAdmin) return;

    // ล็อกเฉพาะ slot ที่เต็มจริง
    if ((countMap[input.value] || 0) >= MAX_PER_SLOT && !input.checked) {
      input.disabled = true;
      label.classList.add("slot-full");
    }
  });
}




// function updateTimeSlotAvailability(date){
//   const countMap = {};
//   allBookings
//     .filter(b => b.work_date === date)
//     .forEach(b => countMap[b.time_slot] = (countMap[b.time_slot] || 0) + 1);

//   document.querySelectorAll(".time-slots input").forEach(input=>{
//     const label = document.querySelector(`label[for="${input.id}"]`);

//     // reset ทุกครั้ง
//     input.disabled = false;
//     label.classList.remove("slot-full");

//     // if (isAdmin) return;

//     // const count = countMap[input.value] || 0;

//     // // slot เต็มจริง → ล็อก (ยกเว้น slot ของตัวเอง)
//     // if (count >= MAX_PER_SLOT && !input.checked) {
//     //   input.disabled = true;
//     //   label.classList.add("slot-full");
//     // }

//   });
// }


