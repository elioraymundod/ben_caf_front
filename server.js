//instal express serve
const express = require('express');
const path = require('path');

const app = express();

//save the static files
app.use(express.static('./dist/sistema-inventarios'));

app.get('/*', (req, res) => 
    res.sendFile('index.html', {root: 'dist/sistema-inventarios'})
)

//Start the app by listening on the default heroku port
app.listen(process.env.PORT || 8080);