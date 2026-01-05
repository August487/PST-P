const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// Esto lee la llave directamente desde Render sin errores de formato
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEYS)),
  databaseURL: "https://p-pst1-default-rtdb.firebaseio.com"
});

const db = admin.database();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    const snap = await db.ref('tanque').once('value');
    const datos = snap.val() || { litros: 0 };
    res.render('index', { datos, lista: [] });
  } catch (e) {
    res.status(500).send("Error de Firebase");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ¡LISTO! Servidor en puerto ${PORT}`);
});
