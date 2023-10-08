import React, {useState, useEffect} from "react";
import "./Notify.css";

export default function Notify({text, handlerNotify}) {
    const [notifyHide, setNotifyHide] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setNotifyHide(true);
            setTimeout(() => {
                handlerNotify();
            }, 200)
        }, 4000)
    }, [])
    

    return (
        <div className={!notifyHide ? "notify-container-active" : "notify-container-inactive"}>
            <span>{text}</span>
        </div>
    )
}