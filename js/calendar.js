function initMonthSlicer(){
  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  monthSlicer.innerHTML = "";
  ALLOWED_MONTHS.forEach(m => monthSlicer.add(new Option(months[m], m)));
}

function initYearSlicer() {
  yearSlicer.innerHTML = "";
  yearSlicer.add(new Option(ALLOWED_YEAR, ALLOWED_YEAR));
}

async function loadBookings() {
  const { data } = await sb.from("queue_booking").select("*");
  allBookings = data || [];
}

async function loadLockedDays(){
  const { data } = await sb.from("booking_day_lock").select("*");
  lockedDays = {};
  (data || []).forEach(d => lockedDays[d.work_date] = d.is_locked);
}

// เปิด-ปิดวัน
// async function toggleDay(dateStr, isClosed) {
//   await sb.from("booking_day_lock")
//     .upsert({ work_date: dateStr, is_locked: !isClosed }, { onConflict: "work_date" });
//   await loadLockedDays();
//   renderCalendar();
// }
async function toggleDay(dateStr, isClosed) {
  if (!isAdmin) return;

  await sbAdmin
    .from("booking_day_lock")
    .upsert(
      { work_date: dateStr, is_locked: !isClosed },
      { onConflict: "work_date" }
    );

  await loadLockedDays();
  renderCalendar();
}



function renderCalendar() {
  console.log("renderCalendar called");
  const y = currentViewDate.getFullYear();
  const m = currentViewDate.getMonth();

  monthSlicer.value = m;
  yearSlicer.value = y;

  const firstDay = new Date(y, m, 1).getDay();
  const totalDays = new Date(y, m + 1, 0).getDate();



  let html = `<thead><tr>`;
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d => html += `<th>${d}</th>`);
  html += `</tr></thead><tbody><tr>`;

  // ช่องว่างก่อนวันแรก (วันของเดือนก่อนหน้า)
  for (let i=0;i<firstDay;i++) html += `<td class="is-out-month"></td>`;
  

  for (let d=1; d<=totalDays; d++) {
    const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const dayBookings = allBookings.filter(b=>b.work_date===dateStr);
    const students = groupByStudent(dayBookings);

    const isFullDay = isDayFullyBooked(dateStr);
    const isClosed = isDateLocked(dateStr);


let isOutOfWeek = false;
let isInWeek = false;

if (!isAdmin && selectedWeekRange) {
  isOutOfWeek =
    dateStr < selectedWeekRange.start ||
    dateStr > selectedWeekRange.end;

  isInWeek = !isOutOfWeek;
}


    // const isClosed = lockedDays[dateStr] ?? (!isAdmin && (isWeekend(dateStr) || isFullDay));
    // ชื่อเล่นนศที่จอง
    const canEdit = isAdmin || !isDayFullyBooked(dateStr);
    let badges = "";
    students.forEach(s=>{

// badges += `<span class="badge ${s.role}"
//   onclick="event.stopPropagation(); openEditModal('${s.student_id}','${dateStr}')">
//   ${s.nickname}
// </span>`;

badges += `<span class="badge ${s.role} ${s.is_noshow ? "badge-noshow" : ""}"
  onclick="event.stopPropagation();
    ${isMarkNoShowMode
      ? `toggleNoShow('${s.student_id}','${dateStr}')`
      : `openEditModal('${s.student_id}','${dateStr}')`}
  ">
  ${s.nickname}
</span>`;



    //   badges += `<span class="badge ${s.role}"
    //     ${canEdit
    //         ? 'onclick="event.stopPropagation(); openEditModal('${s.student_id}','${dateStr}')"':}>
    //         ${s.nickname}
    //   </span>`;
    });

    // ปุ่มแอดมิน
    let adminBtns = "";
    if (isAdmin) {
      adminBtns = `
        <div class="admin-btns">
          <button class="mini-btn"
            onclick="event.stopPropagation(); openAdminDayView('${dateStr}')">
            รายละเอียด
          </button>

          <button class="mini-btn ${isClosed ? "btn-open" : "btn-close-booking"}"
            onclick="event.stopPropagation(); toggleDay('${dateStr}',${isClosed})">
            ${isClosed ? "เปิดการจอง" : "ปิดการจอง"}
          </button>

          <button class="mini-btn btn-noshow-toggle ${isMarkNoShowMode ? "active" : ""}"
            onclick="event.stopPropagation(); toggleNoShowMode()">
            ${isMarkNoShowMode ? "ออกโหมดหมายหัว" : "หมายหัว"}
          </button>
        </div>
      `;
    }

    // ช่องวัน
    // html += `
    //   td class="${isWeekend(dateStr)?"weekend":""} ${!isAdmin&&isClosed?"is-locked":""}"
    //     ${canClick?`onclick="openAddModal('${dateStr}')"`:""}>

// ===== สร้าง td =====

const canClick = isAdmin
  || (!isClosed && !isOutOfWeek && !isFullDay);

html += `
<td class="
  ${isWeekend(dateStr) ? "weekend" : ""}
  ${isInWeek ? "is-in-week" : ""}
  ${isOutOfWeek ? "is-out-week" : ""}
  ${isClosed ? "is-locked" : ""}
  ${!isAdmin && !isClosed && isFullDay ? "is-full" : ""}
"


${canClick ? `onclick="openAddModal('${dateStr}')"` : ""}>

  <div class="date-row">
    <span class="date-num">${d}</span>
    ${adminBtns}
  </div>

  <div class="nickname-container">${badges}</div>

  ${(!isAdmin && isFullDay) ? `<span class="status-full">เต็ม</span>` : ""}

</td>
`;


    if ((d+firstDay)%7===0) html += `</tr><tr>`;
  }

  calendarEl.innerHTML = html + `</tr></tbody>`;
}

// ปุ่มเปลี่ยนวัน ซ็าย ขวา
function changeMonth(step){
  const next = new Date(currentViewDate);
  next.setMonth(next.getMonth() + step);

  const y = next.getFullYear();
  const m = next.getMonth();

  // allow only ปี เดือนที่ set ไว้
  if (y !== ALLOWED_YEAR || !ALLOWED_MONTHS.includes(m)) return;

  currentViewDate = next;
  renderCalendar();
}

// เลือกข้ามเดือน
function jumpToDate(){
  currentViewDate = new Date(+yearSlicer.value, +monthSlicer.value, 1);
  renderCalendar();
}