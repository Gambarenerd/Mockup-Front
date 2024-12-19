const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve i file statici della build Angular
app.use(express.static(path.join(__dirname, 'dist/translation-app')));

// Gestione fallback per le Single Page Application
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/translation-app/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
