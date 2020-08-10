export default function convertHourToMinutes(time: string) {
  // Separate time on the :, and convert each item(two items) into a number
  const [hour, minutes] = time.split(":").map(Number);

  // 8:00h -> 480min
  const timeInMinutes = hour * 60 + minutes;

  return timeInMinutes;
}
