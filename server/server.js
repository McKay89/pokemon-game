/*
 ___   ___   ___  ___     _  ___   ___
/ __| / _ \/__   \\  \   // / _ \/__   \
\__ \|  __/   |  | \  \ // |  __/   |  |
\___/ \___|   |__|  \___/   \___|   |__|
*/

// Express //
const express = require('express');
const app = express();
app.use(express.json());

// Cors //
const cors = require('cors');
app.use(cors({origin:'http://localhost:5173'}));

// Test GET //
app.get('/api/testdata', (req, res) => {
    const data = {
        name: "Vulpix",
        attack: 20
    }
    res.json(data);
})

app.listen(3001, () => console.log('Server started on port 3001'));