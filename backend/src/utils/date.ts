export function combineDateTime(dateValue?: string | Date | null, timeValue?: string | null) {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (timeValue) {
    const [hours, minutes] = timeValue.split(":").map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
  }

  return date;
}

export function isDateReached(date?: Date | null) {
  if (!date) {
    return false;
  }

  return date.getTime() <= Date.now();
}
