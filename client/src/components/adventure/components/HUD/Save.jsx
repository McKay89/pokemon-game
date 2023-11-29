import React from 'react';

export default function Save({translation, handleCollectTimeData}) {

    return(
        <div className="hud-save">
            <i onClick={handleCollectTimeData} className="fa-solid fa-floppy-disk"></i>
        </div>
    );
}