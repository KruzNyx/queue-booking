window.onload = async () => {
  await restoreAdminSession();
  currentViewDate = new Date(ALLOWED_YEAR, ALLOWED_MONTHS[0], 1);
  initMonthSlicer();
  initYearSlicer();
  await loadBookings();
  await loadLockedDays();
  renderCalendar();
  updateAdminUI();
};

async function handleLogin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  const success = await adminLogin(user, pass);

  if (success) {
    // alert("เข้าสู่ระบบแอดมินสำเร็จ");
    document.getElementById('loginModal').style.display = 'none';
    
    await loadBookings();
    await loadLockedDays();
    renderCalendar();
  } else {
    alert("Username หรือ Password ไม่ถูกต้อง");
  }
}

function updateAdminUI() {
  const loginBtn = document.getElementById("adminLoginBtn");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  if (isAdmin) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

// amount
elAmount.addEventListener("input", () => {
  elAmount.value = formatNumberWithComma(elAmount.value);
  updateBookingSummary(elStudentId.value.trim(), currentModalDate);
});

// student id (พิมพ์)
elStudentId.addEventListener("input", () => {
  elStudentId.value = elStudentId.value.replace(/\D/g, "").slice(0, 9);
  updateBookingSummary(elStudentId.value.trim(), currentModalDate);
});

// student id (ออกจากช่อง)
elStudentId.addEventListener("blur", () => {
  if (!elStudentId.value || !currentModalDate) return;

  updateStudentWeeklyStatus(elStudentId.value, currentModalDate);
  handleStudentAddBookingRule(elStudentId.value, currentModalDate); // ⭐ สำคัญมาก
  updateBookingSummary(elStudentId.value.trim(), currentModalDate);
});

