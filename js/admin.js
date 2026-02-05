async function adminDeleteBooking(studentId, date, slot) {
  if (!isAdmin) return;

  if (!confirm("ยืนยันยกเลิกคิวนี้?")) return;

  await sbAdmin
    .from("queue_booking")
    .delete()
    .eq("student_id", studentId)
    .eq("work_date", date)
    .eq("time_slot", slot);

  await loadBookings();
  openAdminDayView(date);
  renderCalendar();
}



function openAdminDayView(date){
  const list = allBookings.filter(b=>b.work_date===date);

  // list นศ ตามเวลาที่ลง
  const grouped = {};
  list.forEach(b=>{
    if(!grouped[b.time_slot]) grouped[b.time_slot]=[];
    grouped[b.time_slot].push(b);
  });

  let html="";
  Object.keys(grouped).sort((a, b) => {
    const toMin = t => {
      const [h, m] = t.split("-")[0].split(".").map(Number);
      return h * 60 + m;
    };
    return toMin(a) - toMin(b);
  }).forEach(slot => {
    html += `
      <div><strong>${slot}</strong>
        <ul>
          ${grouped[slot].map(b => `
<li class="admin-li ${b.is_noshow ? 'noshow-item' : ''}">
  <span class="student-name">${b.nickname}</span>
  
  <div class="admin-inline-btns">


    <button class="micro-btn danger"
      onclick="adminDeleteBooking('${b.student_id}','${date}','${slot}')">
      ยกเลิก
    </button>
  </div>
</li>
`).join("")}

        </ul>
      </div>`;
  });


  document.getElementById("adminTitle").textContent =
    formatThaiDateAD(date);
  document.getElementById("adminBody").innerHTML = html || "<p>ไม่มีข้อมูล</p>";
  adminModal.style.display="block";
}
function closeAdminModal(){ adminModal.style.display="none"; }


async function adminMarkNoShow(bookingId){
  const { data, error } = await sbAdmin
    .from("queue_booking")
    .update({ is_noshow: true })
    .eq("id", bookingId)
    .select();

  console.log("update data:", data);
  console.log("update error:", error);

  await loadBookings();
  openAdminDayView(currentModalDate);
}

function toggleNoShowMode() {
  isMarkNoShowMode = !isMarkNoShowMode;
  renderCalendar();
}

async function toggleNoShow(studentId, dateStr) {
  if (!isAdmin) return;

  // เอา booking ทุก slot ของนศในวันนั้น
  const bookings = allBookings.filter(b =>
    b.student_id === studentId &&
    b.work_date === dateStr
  );

  if (!bookings.length) return;

  // ถ้ายังมีอันไหนไม่ noshow → กดแล้วให้เป็น noshow ทั้งหมด
  const shouldMarkNoShow =
    !bookings.every(b => b.is_noshow === true);

  const { error } = await sbAdmin
    .from("queue_booking")
    .update({ is_noshow: shouldMarkNoShow })
    .eq("student_id", studentId)
    .eq("work_date", dateStr);

  if (error) {
    console.error(error);
    alert("เปลี่ยนสถานะ no-show ไม่สำเร็จ");
    return;
  }

  await loadBookings();
  renderCalendar();
}