window.onload = async () => {
  await restoreAdminSession();


  
  currentViewDate = new Date(ALLOWED_YEAR, ALLOWED_MONTHS[0], 1);
  initMonthSlicer();
  initYearSlicer();
  await loadBookings();
  await loadLockedDays();
  renderCalendar();
};

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


