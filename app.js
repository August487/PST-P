const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// Configuración de Firebase
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://p-pst1-default-rtdb.firebaseio.com/"
});

const db = admin.database();

// Configuración de Vistas para Render
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta Principal
app.get('/', async (req, res) => {
  try {
    const tanquesSnap = await db.ref('tanque').once('value');
    const historialSnap = await db.ref('historial').limitToLast(10).once('value');

    const datos = tanquesSnap.val() || { litros: 0 };
    const historialData = historialSnap.val() || {};
    const lista = Object.keys(historialData).map(k => historialData[k]).reverse();

    res.render('index', { datos, lista });
  } catch (error) {
    console.error("Error en Firebase:", error);
    res.status(500).send("Error conectando a la base de datos");
  }
});

// Puerto dinámico para Render (0.0.0.0 es obligatorio)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor funcionando en puerto ${PORT}`);
});

