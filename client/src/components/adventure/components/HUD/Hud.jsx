import React, { useEffect, useState } from 'react';
import Clock from './Clock';
import Day from './Day';
import Save from './Save';
import ClockImage from '../../../../assets_tmp/adventure/images/hud/hud_clock.webp';
import './Hud.css';

export default function Hud({translation, handleSaveGame, userSave, gameNotification}) {
    const [days, setDays] = useState(1);
    const [weekDay, setWeekDay] = useState(0);
    const [clockTime, setClockTime] = useState('2011-11-11T11:11:11');
    const [notification, setNotification] = useState("");
    const [notificationClass, setNotificationClass] = useState("");
    let startTime = new Date(clockTime);
    startTime.setUTCHours(8, 0, 0);
    const [startClock, setStartClock] = useState(startTime);

    useEffect(() => {
        setNotification(gameNotification);
        setTimeout(() => {
            setNotification("");
        }, 5000)
    }, [gameNotification])
    

    useEffect(() => {
        if(userSave != null) {
            setDays(userSave.timeData.days);
            setWeekDay(userSave.timeData.weekDay);
            setClockTime(userSave.timeData.clockTime);
            startTime = new Date(userSave.timeData.clockTime);
            startTime.setUTCHours(startTime.getUTCHours(), startTime.getUTCMinutes(), startTime.getUTCSeconds());
            setStartClock(startTime);
        }
    }, [userSave])

    const handleDayCounter = () => {
        setDays(prevDays => prevDays + 1);
    }

    const saveTimeState = (time) => {
        setClockTime(time);
    }

    const handleWeekDay = () => {
        setWeekDay(prevWeekDay => (prevWeekDay === 6 ? 0 : prevWeekDay + 1));
    }

    const collectTimeData = () => {
        const time = {
            days: days,
            weekDay: weekDay,
            clockTime: clockTime
        }

        handleSaveGame(time);
    }

    return(
        <div className="game-hud-container">
            <div className={notification !== "" ? "hud-notification-container-active" : "hud-notification-container"}>
                <span>{notification}</span>
            </div>
            <div className="game-hud-top-bar">
                <img className="hud-clock-image" src={ClockImage} />
                <Clock translation={translation} handleDays={handleDayCounter} saveTimeState={saveTimeState} handleWeekDay={handleWeekDay} weekDay={weekDay} startTime={startClock} />
                <Save translation={translation} handleCollectTimeData={collectTimeData} />
            </div>
            <Day translation={translation} days={days} />
        </div>
    );
}