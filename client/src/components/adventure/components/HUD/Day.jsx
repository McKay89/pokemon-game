import React, { useEffect, useState } from 'react';

export default function Day({translation, days}) {

    return(
        <div className="hud-day">
            <span>{days}</span>
            <span>{translation("adventure:day_counter")}</span>
        </div>
    );
}