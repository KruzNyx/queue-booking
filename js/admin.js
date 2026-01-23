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
  <li>
    ${b.nickname}
    <button class="mini-btn danger"
      onclick="adminDeleteBooking('${b.student_id}','${date}','${slot}')">
      ยกเลิก
    </button>
  </li>
`).join("")}

        </ul>
      </div>`;
  });


  document.getElementById("adminTitle").textContent =
    "📆 วันที่ "+formatThaiDateAD(date);
  document.getElementById("adminBody").innerHTML = html || "<p>ไม่มีข้อมูล</p>";
  adminModal.style.display="block";
}
function closeAdminModal(){ adminModal.style.display="none"; }
