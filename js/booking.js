function getSelectedTimeSlots(){
  return [...document.querySelectorAll(".time-slots input:checked")]
    .map(c => c.value);
}

async function saveBooking(){
  if (isReadonlyMode) {
    alert("นศไม่มีสิทธิ์แก้ไขการจองนี้");
    return;
  }

  const date = currentModalDate;

  // validate student id
  if (
    editingRole === "student" &&
    !/^[0-9]{9}$/.test(elStudentId.value.trim())
  ) {
    alert("กรุณากรอกรหัสนศให้ครบ 9 ตัว");
    elStudentId.focus();
    return;
  }

  if (!isAdmin && lockedDays[date] === true) {
    alert("วันนี้ปิดการจอง");
    return;
  }

  const slots = getSelectedTimeSlots();
  const amount = Number(elAmount.value.replace(/,/g,""));

  if (!elStudentId.value || !elFullName.value || !slots.length || !amount) {
    alert("กรอกข้อมูลไม่ครบ");
    return;
  }

  for (const d of selectedDates) {

    // edit → ลบของตัวเองก่อน
    // if (isEditMode) {
    //   await sb.from("queue_booking")
    //     .delete()
    //     .eq("student_id", elStudentId.value)
    //     .eq("work_date", d);
    // }

  const client = isAdmin ? sbAdmin : sb;

if (isEditMode) {
  await client
    .from("queue_booking")
    .delete()
    .eq("student_id", elStudentId.value)
    .eq("work_date", d);
}


    const { data, error } = await sb.rpc("book_queue", {
      p_date: d,
      p_student_id: elStudentId.value,
      p_full_name: elFullName.value,
      p_nickname: elNickname.value,
      p_time_slots: slots,
      p_amount: amount,
      p_role: editingRole
    });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (data?.error === "DAY_LOCKED") {
      alert("วันนี้ปิดการจอง");
      return;
    }
  }
updateBookingSummary("", null);

  closeModal();
  await loadBookings();
  renderCalendar();
}

async function deleteBooking(){
  // if (isReadonlyMode) {
  //   alert("นศไม่มีสิทธิ์ลบการจองนี้");
  //   return;
  // }
  if (!isAdmin) {
    alert("นศไม่สามารถลบการจองได้ หากอยากยกเลิกการจองติดต่อพี่แอนหรือพี่ไข่หวานค่ะ");
    return;
  }

  if (!confirm("ยกเลิกการจองของนศคนนี้?")) return;

  // เลือก Client ตามสิทธิ์ (สำคัญมาก: sbAdmin จะส่ง x-admin header ไปให้ Policy ข้อ 2 ทำงาน)
  const client = isAdmin ? sbAdmin : sb;

  const slotsToDelete = (editingSlots && editingSlots.length > 0) 
    ? editingSlots 
    : getSelectedTimeSlots();

  const { error } = await client
    .from("queue_booking")
    .delete()
    .eq("student_id", elStudentId.value) // ระบุรหัส นศ. เพื่อความปลอดภัย
    .eq("work_date", currentModalDate)
    .in("time_slot", slotsToDelete);

  if (error) {
    console.error(error);
    alert("ลบไม่สำเร็จ: " + error.message);
    return;
  }

  alert("ยกเลิกการจองเรียบร้อยแล้ว");
  closeModal();
  await loadBookings();
  renderCalendar();
}

function updateTimeSlotAvailability(date){
  const countMap = {};
  allBookings
    .filter(b => b.work_date === date)
    .forEach(b => {
      countMap[b.time_slot] = (countMap[b.time_slot] || 0) + 1;
    });

  document.querySelectorAll(".time-slots input").forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`);

    if (isReadonlyMode) {
      input.disabled = true;
      return;
    }

    input.disabled = false;
    label.classList.remove("slot-full");

    if (isAdmin) return;

    if ((countMap[input.value] || 0) >= MAX_PER_SLOT && !input.checked) {
      input.disabled = true;
      label.classList.add("slot-full");
    }
  });
}

function markStudentExistingSlots(studentId, date) {
  const { start, end } = getWeekRange(date);

  const bookedSlots = allBookings.filter(b =>
    b.student_id === studentId &&
    b.work_date >= start &&
    b.work_date <= end
  );

  document.querySelectorAll(".time-slots input").forEach(input => {
    if (input.checked) return;

    const hit = bookedSlots.find(b => b.time_slot === input.value);
    if (!hit) return;

    input.disabled = true;

    const label = document.querySelector(`label[for="${input.id}"]`);
    label.classList.add("slot-booked-self");
    label.title = `จองแล้ว (${formatThaiDateAD(hit.work_date)})`;
  });
}