// ===== UNIT CONVERSION =====

const CM_PER_INCH = 2.54;

function cmToInch(cm) {
  if (cm == null || isNaN(cm)) return null;
  return Math.round(cm / CM_PER_INCH * 10) / 10;
}

function inchToCm(inch) {
  if (inch == null || isNaN(inch)) return null;
  return Math.round(inch * CM_PER_INCH * 10) / 10;
}
