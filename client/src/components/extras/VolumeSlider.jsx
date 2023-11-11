import React, { useState } from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';

export default function MusicSlider({translation, volume, changeVolume, musicStatus}) {
    return (
        <CircularSlider
            width={80}
            label={translation("audio_status_off")}
            labelFontSize={ musicStatus == false ? "1.2rem" : "0rem" }
            labelColor="#e1d0d0"
            labelBottom={ musicStatus == false ? true : false }
            valueFontSize={ musicStatus == false ? "0rem" : "2rem" }
            verticalOffset="0.5rem"
            knobColor={ musicStatus == false ? "#06722333" : "#067223" }
            progressColorFrom={ musicStatus == false ? "#06722300" : "#1ca90a" }
            progressColorTo="#464f03"
            progressSize={ musicStatus == false ? 0 : 6 }
            trackColor={ musicStatus == false ? "#dddddd33" : "#dddddd" }
            trackSize={8}
            min={0}
            max={100}
            dataIndex={volume * 100}
            knobDraggable={musicStatus}
            onChange={ value => { changeVolume(parseFloat(value / 100)) } }
        />
    )
}