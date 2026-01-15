function getSelectedTimeSlots(){
  return [...document.querySelectorAll(".time-slots input:checked")].map(c=>c.value);
}

async function saveBooking(){
  const date = currentModalDate;

    // user กดแก้ไขวันปิดจองไม่ได้
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

  // ลบการจองเพิ่มเติมของวันนั้น ?  
  await sb.from("queue_booking")
    .delete()
    .eq("student_id", elStudentId.value)
    .eq("work_date", date);

  // อัพเดท
  await sb.rpc("book_queue",{
    p_date: date,
    p_student_id: elStudentId.value,
    p_full_name: elFullName.value,
    p_nickname: elNickname.value,
    p_time_slots: slots,
    p_amount: amount,
    p_role: editingRole
  });

  closeModal();
  location.reload();
}

async function deleteBooking(){
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
  allBookings.filter(b=>b.work_date===date)
    .forEach(b=>countMap[b.time_slot]=(countMap[b.time_slot]||0)+1);

  document.querySelectorAll(".time-slots input").forEach(input=>{
    const label=document.querySelector(`label[for="${input.id}"]`);
    const count=countMap[input.value]||0;

    if(isAdmin){
      input.disabled=false;
      label.classList.remove("slot-full");
      return;
    }

    // ล๊อคถ้า slot เต็ฒ
    if(count>=MAX_PER_SLOT && !input.checked){
      input.disabled=true;
      label.classList.add("slot-full");
    }else{
      input.disabled=false;
      label.classList.remove("slot-full");
    }
  });
}
