import React, { useEffect, useState } from 'react';

export default function Clock({translation, handleDays, saveTimeState, handleWeekDay, weekDay, startTime}) {
    const [elapsedTime, setElapsedTime] = useState(startTime);
    const weekDays = [
        translation("adventure:weekday_sunday"),
        translation("adventure:weekday_monday"),
        translation("adventure:weekday_tuesday"),
        translation("adventure:weekday_wednesday"),
        translation("adventure:weekday_thursday"),
        translation("adventure:weekday_friday"),
        translation("adventure:weekday_saturday")
    ];

    useEffect(() => {
        setElapsedTime(startTime);
    }, [startTime])

    useEffect(() => {
      let isMounted = true;
      const intervalId = setInterval(() => {
        setElapsedTime(prevTime => {
            const newTime = new Date(prevTime);
            newTime.setUTCSeconds(prevTime.getUTCSeconds() + 1);

            if (newTime.getUTCHours() === 0 && newTime.getUTCMinutes() === 0 && newTime.getUTCSeconds() === 0) {
                handleWeekDay();
                handleDays();
            }

            if(prevTime.getUTCMinutes() != newTime.getUTCMinutes()) {
                const saveTimeString = '2011-11-11T11:11:11';
                const saveTime = new Date(saveTimeString);
                saveTime.setUTCHours(newTime.getUTCHours(), newTime.getUTCMinutes(), newTime.getUTCSeconds());
                if (isMounted) {
                    saveTimeState(saveTime);
                }
            }

            return newTime;
        });
      }, 100);
    
      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }, [startTime]);
  
    const elapsedSeconds = Math.floor(elapsedTime / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
  
    const formattedHours = String((elapsedHours % 24)).padStart(2, '0');
    const formattedMinutes = String((elapsedMinutes % 60)).padStart(2, '0');
  
    const formattedTime = `${formattedHours}:${formattedMinutes}`;
  
    return(
        <div className="hud-timer">
            <span>{formattedTime}</span>
            <span>{weekDays[weekDay]}</span>
        </div>
    );
}