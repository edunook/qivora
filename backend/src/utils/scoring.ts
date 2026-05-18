export function getGrade(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

export function getGpa(percentage: number) {
  if (percentage >= 90) return 4;
  if (percentage >= 80) return 3.7;
  if (percentage >= 70) return 3.2;
  if (percentage >= 60) return 2.6;
  if (percentage >= 50) return 2;
  return 0;
}
