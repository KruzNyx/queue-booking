async function loginAdmin(){
  const email =
    document.getElementById("adminEmailInput").value.trim().toLowerCase();

  if (!email) {
    alert("⚠️ กรุณากรอกอีเมล");
    return;
  }
const res = await fetch("/api/admin-me", {
  headers: { "x-admin-email": email }
});
if (!res.ok) {
  alert("❌ อีเมลนี้ไม่มีสิทธิ์เป็นแอดมิน");
  return;
}
const data = await res.json();

  isAdmin = true;
  adminEmail = email;

alert(`✅ เข้าสู่โหมดแอดมิน (${data.role})`);

  await loadBookings();
  await loadLockedDays();
  renderCalendar();
}


async function adminDeleteBooking(studentId, date, slot){
  if (!isAdmin || !adminEmail) {
    alert("⛔ ยังไม่ได้เข้าสู่ระบบแอดมิน");
    return;
  }

  if (!confirm("ยืนยันยกเลิกคิวนี้?")) return;

  await fetch("/api/admin/delete-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-email": adminEmail
    },
    body: JSON.stringify({
      student_id: studentId,
      work_date: date,
      time_slot: slot
    })
  });

  await loadBookings();
  openAdminDayView(date);
  renderCalendar();
}


function openAdminDayView(date){
    if (!isAdmin) {
    alert("⛔ หน้านี้สำหรับแอดมินเท่านั้น");
    return;
  }
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
    ${isAdmin ? `
    <button class="mini-btn danger"
      onclick="adminDeleteBooking('${b.student_id}','${date}','${slot}')">
      ยกเลิก
    </button>
    ` : ""}
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
