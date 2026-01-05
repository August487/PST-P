const express = require('express');
const admin = require('firebase-admin');
const app = express();

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

// 1. Asegúrate de que la ruta sea absoluta para evitar el error de "file not found"
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://p-pst1-default-rtdb.firebaseio.com/" 
});

const db = admin.database();
app.set('view engine', 'ejs');

// 2. IMPORTANTE: Definir la carpeta de vistas explícitamente para Render
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  try {
    const tanquesSnap = await db.ref('tanque').once('value');
    const historialSnap = await db.ref('historial').limitToLast(10).once('value');

    const datos = tanquesSnap.val() || { litros: 0 };
    const historialData = historialSnap.val() || {};
    const lista = Object.keys(historialData).map(k => historialData[k]).reverse();

    res.render('index', { datos, lista });
  } catch (error) {
    console.error("Error en la ruta principal:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// 3. El puerto DEBE ser 0.0.0.0 para que Render lo detecte externamente
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor operativo en puerto ${PORT}`);
});
