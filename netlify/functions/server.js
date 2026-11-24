//// Import modules/packages/files
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs/promises');

//// Listen is needed or Node.js will just exit silently i.e. app shut down
// (Netlify deployment) - Not required
/*const listener = app.listen(3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});*/

//// Serve static files
app.use(express.static('public'));

//// Routing
// (Netlify deployment) - Not required.
// (Netlify deployment) Netlify > Projects > csy-heat-map > Project overview > Project configuration (continued..)
// (Netlify deployment) (..continued) > Developer settings > Build settings > Publish directory > value set to "public"
// (Netlify deployment) index.html is hence served from "public" directory/folder (by default)
/*app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});*/

// Retrieve raw data for heat map
app.get('/api/data', async (req, res) => {
    // Parse raw data and send as JSON response
    // data.json downloaded from here: https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json
    try {
        const filePath = path.join(process.cwd(), 'public', 'data.json');
        const content = await fs.readFile(filePath, 'utf8');
        const dataset = JSON.parse(content);
        res.status(200).json(dataset);

    // Raw data file not found
    } catch (error) {
        console.log("Retrieve raw data for heat map unsuccessful: " + error.message);
        res.status(500).json({ error: "Retrieve raw data for heat map unsuccessful" });
    }
});

//// Error page
// (Netlify deployment) - Handled in netlify.toml
/*app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public/html/error.html"));
});*/

//// (Netlify deployment) - Export the wrapped app handler
const serverless = require('serverless-http');
export const handler = serverless(app);