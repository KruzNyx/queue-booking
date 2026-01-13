// Supabase
const SB_URL = "https://vadyheyjiygkruehljly.supabase.co";
const SB_KEY = "sb_publishable_S1_LURvzKRzM_JgC4-x2vg_6L_XAN0X";
const sb = window.supabase.createClient(SB_URL, SB_KEY);

const calendarEl = document.getElementById("calendar");
const monthSlicer = document.getElementById("monthSlicer");
const yearSlicer = document.getElementById("yearSlicer");
const modal = document.getElementById("modal");
const elBookingId = document.getElementById("booking_id");
const elStudentId = document.getElementById("student_id");
const elFullName = document.getElementById("full_name");
const elNickname = document.getElementById("nickname");
const elModalTitle = document.getElementById("modalTitle");
const elModalDate = document.getElementById("modalDateDisplay");
const delBtn = document.getElementById("delBtn");

let currentViewDate = new Date();
let allBookings = [];

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("kaiwan");
const isAdmin = token==="adminroleja";

// --- Slicers ---
function initSlicers(){
    const monthNames = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    monthNames.forEach((name, idx)=>{
        let opt = document.createElement("option");
        opt.value=idx;
        opt.textContent=name;
        monthSlicer.appendChild(opt);
    });
    const currentYear = new Date().getFullYear();
    for(let i=currentYear-1;i<=currentYear+3;i++){
        let opt = document.createElement("option");
        opt.value=i;
        opt.textContent=`พ.ศ. ${i+543}`;
        yearSlicer.appendChild(opt);
    }
}

// --- Load bookings ---
async function loadBookings(){
    const {data,error} = await sb.from("queue_booking").select("*");
    if(!error) allBookings = data||[];
}

// --- Render calendar ---
function renderCalendar(){
    const y = currentViewDate.getFullYear();
    const m = currentViewDate.getMonth();
    monthSlicer.value = m;
    yearSlicer.value = y;

    const today = new Date().toISOString().split("T")[0];
    const firstDay = new Date(y,m,1).getDay();
    const totalDays = new Date(y,m+1,0).getDate();

    let html = `<thead><tr>`;
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d=>html+=`<th>${d}</th>`);
    html+=`</tr></thead><tbody><tr>`;

    for(let i=0;i<firstDay;i++) html+=`<td></td>`;

    for(let d=1;d<=totalDays;d++){
        const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const isToday = dateStr===today?"today":"";

        const studentBookings = allBookings.filter(b=>b.work_date===dateStr && b.role==='student');
        const adminBookings = allBookings.filter(b=>b.work_date===dateStr && b.role==='admin');
        const isFull = studentBookings.length>=5 && !isAdmin;

        // --- Arrange 1:1 ---
        const maxRows = Math.max(studentBookings.length, adminBookings.length);
        let rowsHtml = '';
        for(let i=0;i<maxRows;i++){
            const s = studentBookings[i] ? `<span class="badge student" onclick="event.stopPropagation(); openEditModal('${studentBookings[i].id}')">${studentBookings[i].nickname}</span>` : '';
            const a = adminBookings[i] ? `<span class="badge admin" onclick="event.stopPropagation(); openEditModal('${adminBookings[i].id}')">${adminBookings[i].nickname} (Admin)</span>` : '';
            rowsHtml += `<div class="nickname-row">${s}${a}</div>`;
        }

        html+=`<td class="${isToday} ${isFull?'is-full':''}" onclick="${isFull?'alert(\'วันนี้คิวเต็มแล้วสำหรับนักศึกษา\')':`openAddModal('${dateStr}')`}">
            <span class="date-num">${d}</span>
            ${isFull?'<span class="status-full">Full</span>':''}
            <div class="nickname-container">${rowsHtml}</div>
        </td>`;

        if((d+firstDay)%7===0) html+=`</tr><tr>`;
    }

    calendarEl.innerHTML = html+`</tr></tbody>`;
}

// --- Navigation ---
function changeMonth(offset){ currentViewDate.setMonth(currentViewDate.getMonth()+offset); renderCalendar(); }
function jumpToDate(){ currentViewDate = new Date(yearSlicer.value, monthSlicer.value, 1); renderCalendar(); }
function closeModal(){ modal.style.display="none"; }

// --- Modal ---
function openAddModal(date){
    modal.style.display="block";
    elModalTitle.textContent="จองคิวใหม่";
    elModalDate.textContent="วันที่ "+date;
    elBookingId.value="";
    elStudentId.value="";
    elStudentId.readOnly=false;
    elStudentId.classList.remove("readonly");
    elFullName.value="";
    elNickname.value="";
    delBtn.style.display="none";
}

function openEditModal(id){
    const b = allBookings.find(x=>x.id===id);
    if(!b) return;
    modal.style.display="block";
    elModalTitle.textContent="แก้ไขข้อมูล";
    elModalDate.textContent="วันที่ "+b.work_date;
    elBookingId.value=b.id;

    elStudentId.value=b.student_id;
    elStudentId.readOnly=true; // readonly
    elStudentId.classList.add("readonly");

    elFullName.value=b.full_name;
    elNickname.value=b.nickname;
    delBtn.style.display="block";
}

// --- CRUD ---
async function saveBooking(){
    const date = elModalDate.textContent.replace("วันที่ ","");
    if(!elStudentId.value||!elFullName.value) return alert("กรุณากรอกข้อมูลให้ครบ");

    if(elBookingId.value){
        await sb.from("queue_booking")
            .update({
                full_name: elFullName.value,
                nickname: elNickname.value
            })
            .eq("id", elBookingId.value);
    } else {
        const role = isAdmin?'admin':'student';
        const {data} = await sb.rpc("book_queue",{
            p_date: date,
            p_student_id: elStudentId.value,
            p_full_name: elFullName.value,
            p_nickname: elNickname.value,
            p_role: role
        });
        if(data==="FULL") return alert("ขออภัย คิวเต็มแล้วสำหรับนักศึกษา");
        if(data==="DUPLICATE") return alert("คุณได้จองคิววันนี้ไปแล้ว");
    }

    closeModal();
    await loadBookings();
    renderCalendar();
}

async function deleteBooking(){
    if(!confirm("ยกเลิกการจองใช่หรือไม่?")) return;
    await sb.from("queue_booking").delete().eq("id", elBookingId.value);
    closeModal();
    await loadBookings();
    renderCalendar();
}

// --- Start ---
window.onload=async()=>{
    initSlicers();
    await loadBookings();
    renderCalendar();
};
