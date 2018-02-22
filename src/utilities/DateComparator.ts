class DateComparator {

  public static isSameDay(date1: Date, date2: Date): boolean {
    return (date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth()
      && date1.getFullYear() === date2.getFullYear());
  }

  public static isWithinRange(date1: Date, date2: Date, dateToCheck: Date): boolean {
    const startDate: Date = new Date(date1);
    const endDate: Date = new Date(date2);
    return dateToCheck >= startDate && dateToCheck <= endDate;
  }
}

export default DateComparator;
