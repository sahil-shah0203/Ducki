export const fetchCalendarEvents = async () => {
  const response = await fetch('~/api/Calendar');
  const data = await response.json();
  return data;
};
