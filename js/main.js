// window.onload = async () => {
//   currentViewDate = new Date(ALLOWED_YEAR, ALLOWED_MONTHS[0], 1);
//   initMonthSlicer();
//   initYearSlicer();
//   await loadBookings();
//   await loadLockedDays();
//   renderCalendar();
// };

window.onload = async () => {
  currentViewDate = new Date(ALLOWED_YEAR, ALLOWED_MONTHS[0], 1);
  initMonthSlicer();
  initYearSlicer();
  await loadBookings();
  await loadLockedDays();
  renderCalendar();
};



elAmount.addEventListener("input",()=>{
  elAmount.value = formatNumberWithComma(elAmount.value);
});

elStudentId.addEventListener("input",()=>{
  elStudentId.value = elStudentId.value.replace(/\D/g,"").slice(0,9);
});
