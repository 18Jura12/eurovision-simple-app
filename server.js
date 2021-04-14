//Install express server
const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static('./dist/finale'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/finale/'}),
);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);

// function requireHTTPS(req, res, next) {
//   // The 'x-forwarded-proto' check is for Heroku
//   if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
//       return res.redirect('http://' + req.get('host') + req.url);
//   }
//   next();
// }const express = require('express');
// const app = express();
// app.use(requireHTTPS);

// app.use(express.static('./dist/finale'));

// app.get('/*', function(req, res) {
//   res.sendFile('index.html', {root: 'dist/finale/'}
// );
// });

// app.listen(process.env.PORT || 8080);
