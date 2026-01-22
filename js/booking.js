function getSelectedTimeSlots(){
  return [...document.querySelectorAll(".time-slots input:checked")].map(c=>c.value);
}

async function saveBooking(){
  const date = currentModalDate;

    // user กดแก้ไขวันปิดจองไม่ได้
    // if (!isAdmin && lockedDays[date] === true) {
    if (!isAdmin && lockedDays[date] === true) {
        alert("วันนี้ปิดการจอง ไม่สามารถแก้ไขได้");
        return;
    }
   
  // แสดงข้อมูล  
  const slots = getSelectedTimeSlots();
  const amount = Number(elAmount.value.replace(/,/g,""));

  // col ที่ต้องกรอกให้ครบ  
  if(!elStudentId.value||!elFullName.value||!slots.length||!amount)
    return alert("กรอกข้อมูลไม่ครบ");

  if (!isAdmin) {
  const weeklyUsed = getWeeklyBookedHours(elStudentId.value, date);
  const allowed = getAllowedHours(amount);

  const willUse = slots.length * selectedDates.length;

  if (weeklyUsed + willUse > allowed) {
  alert(
    `สัปดาห์นี้คุณจองได้ไม่เกิน ${allowed} ชั่วโมง\n` +
    `ตอนนี้ใช้ไปแล้ว ${weeklyUsed} ชั่วโมง`
  );
  return;
}

//   const willUse = slots.length;

//   if (weeklyUsed + willUse > allowed) {
//     alert(
//       `สัปดาห์นี้คุณจองได้ไม่เกิน ${allowed} ชั่วโมง\n` +
//       `ตอนนี้ใช้ไปแล้ว ${weeklyUsed} ชั่วโมง`
//     );
//     return;
//   }
 }

  // อัพเดท
  // await sb.rpc("book_queue",{
  //   p_date: date,
  //   p_student_id: elStudentId.value,
  //   p_full_name: elFullName.value,
  //   p_nickname: elNickname.value,
  //   p_time_slots: slots,
  //   p_amount: amount,
  //   p_role: editingRole
  // });

  for (const d of selectedDates) {

  await sb.from("queue_booking")
    .delete()
    .eq("student_id", elStudentId.value)
    .eq("work_date", d);

  await sb.rpc("book_queue",{
    p_date: d,
    p_student_id: elStudentId.value,
    p_full_name: elFullName.value,
    p_nickname: elNickname.value,
    p_time_slots: slots,
    p_amount: amount,
    p_role: editingRole
  });
}


  closeModal();
  location.reload();
}

async function deleteBooking(){
  // if (!isAdmin && lockedDays[currentModalDate] === true) {
  if (!isAdmin && lockedDays[currentModalDate] === true) {
    alert("วันนี้ปิดการจอง ไม่สามารถยกเลิกได้");
    return;
  }

  if(!confirm("ยกเลิกการจองทั้งหมดของวันนี้?")) return;

  await sb.from("queue_booking")
    .delete()
    .eq("student_id", elStudentId.value)
    .eq("work_date", currentModalDate);

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


