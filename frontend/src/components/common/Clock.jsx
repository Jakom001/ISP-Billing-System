import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
  
  // Format hours for 12-hour clock
  const formatHour = (hour) => {
    return hour % 12 || 12; // Convert 0 to 12 for 12 AM
  };
  
  // Add leading zero for single-digit numbers
  const addLeadingZero = (number) => {
    return number < 10 ? `0${number}` : number;
  };
  
  // Get AM/PM
  const getAmPm = (hour) => {
    return hour >= 12 ? 'PM' : 'AM';
  };
  
  const hours = formatHour(time.getHours());
  const minutes = addLeadingZero(time.getMinutes());
  const seconds = addLeadingZero(time.getSeconds());
  const ampm = getAmPm(time.getHours());
  
  return (
    <div className="flex items-center justify-center gap-4">
      
      <div className="text-lg">
        {time.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
      <div className="text-2xl font-bold tracking-wide mb-1 bg-gradient-to-r from-primary  to-secondary bg-clip-text text-transparent">
        {hours}:{minutes}:{seconds} {ampm}
      </div>
    </div>
  );
}