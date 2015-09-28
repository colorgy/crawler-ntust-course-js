function getCurrentYear() {
  var date = (new Date());
  return ((date.getMonth() + 1 > 6) ? date.getFullYear() : date.getFullYear() - 1);
}

function getCurrentTerm() {
  var date = (new Date());
  return ((date.getMonth() + 1 > 6) ? 1 : 2);
}

export { getCurrentYear, getCurrentTerm };
