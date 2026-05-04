// BMI calculation and classification (Asia-Pacific thresholds)
function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

function getBMICategory(bmi) {
  if (bmi === null || bmi === undefined) return null;
  if (bmi < 18.5) return { label: 'น้ำหนักน้อย',  color: '#3B82F6', bg: '#EFF6FF' };
  if (bmi < 23.0) return { label: 'ปกติ',           color: '#16A34A', bg: '#F0FDF4' };
  if (bmi < 25.0) return { label: 'น้ำหนักเกิน',   color: '#D97706', bg: '#FFFBEB' };
  if (bmi < 30.0) return { label: 'อ้วน',            color: '#EA580C', bg: '#FFF7ED' };
  return               { label: 'อ้วนมาก',          color: '#DC2626', bg: '#FEF2F2' };
}
