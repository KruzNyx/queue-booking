function openAdminDayView(date){
  const list = allBookings.filter(b=>b.work_date===date);
  
  // list นศ ตามเวลาที่ลง
  const grouped = {};
  list.forEach(b=>{
    if(!grouped[b.time_slot]) grouped[b.time_slot]=[];
    grouped[b.time_slot].push(b);
  });

  let html="";
  Object.keys(grouped).sort().forEach(slot=>{
    html+=`
      <div><strong>${slot}</strong>
        <ul>
          ${grouped[slot].map(b=>`<li>${b.nickname}</li>`).join("")}
        </ul>
      </div>`;
  });

  document.getElementById("adminTitle").textContent =
    "📆 วันที่ "+formatThaiDate(date);
  document.getElementById("adminBody").innerHTML = html || "<p>ไม่มีข้อมูล</p>";
  adminModal.style.display="block";
}
function closeAdminModal(){ adminModal.style.display="none"; }
