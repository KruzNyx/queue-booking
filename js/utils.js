function isWeekend(dateStr) {
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

//รวมการจากตามชื่อนศ
function groupByStudent(list) {
  const map = {};
  list.forEach(b => {
    if (!map[b.student_id]) {
      map[b.student_id] = {
        student_id: b.student_id,
        full_name: b.full_name,
        nickname: b.nickname,
        role: b.role,
        slots: []
      };
    }
    map[b.student_id].slots.push(b.time_slot);
  });
  return Object.values(map);
}

//hsort thai date
function formatThaiDate(dateStr){
  const d = new Date(dateStr);
  const m = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`;
}

//long thai date
function formatThaiDateAD(dateStr) {
  const d = new Date(dateStr);
  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  return `วันที่ ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}


function formatNumberWithComma(value) {
  if (!value) return "";
  value = value.replace(/[^0-9.]/g, "");
  const parts = value.split(".");
  let integer = parts[0];
  let decimal = parts[1]?.slice(0, 2);
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal !== undefined ? `${integer}.${decimal}` : integer;
}

// check if it all booked
function isDayFullyBooked(dateStr){
  const dayBookings = allBookings.filter(b => b.work_date === dateStr);
  const countMap = {};

  dayBookings.forEach(b=>{
    countMap[b.time_slot] = (countMap[b.time_slot] || 0) + 1;
  });

  const allSlots = [
    "8.30-9.30","9.30-10.30","10.30-11.30","11.30-12.30",
    "13.00-14.00","14.00-15.00","15.00-16.00","16.00-17.00"
  ];

  return allSlots.every(
    slot => (countMap[slot] || 0) >= MAX_PER_SLOT
  );
}
