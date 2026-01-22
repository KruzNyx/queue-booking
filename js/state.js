let currentViewDate = new Date();
let currentModalDate = null;

let allBookings = [];
let lockedDays = {};
let editingRole = "student";

let selectedDates = [];
let selectedWeekRange = null;


// element
const calendarEl = document.getElementById("calendar");
const modal = document.getElementById("modal");
const adminModal = document.getElementById("adminModal");

const elBookingId = document.getElementById("booking_id");
const elStudentId = document.getElementById("student_id");
const elFullName = document.getElementById("full_name");
const elNickname = document.getElementById("nickname");
const elAmount = document.getElementById("amount");

const elModalTitle = document.getElementById("modalTitle");
const elModalDate = document.getElementById("modalDateDisplay");

const delBtn = document.getElementById("delBtn");
const monthSlicer = document.getElementById("monthSlicer");
const yearSlicer = document.getElementById("yearSlicer");
