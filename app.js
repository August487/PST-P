const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// 1. CONFIGURACIÓN DE FIREBASE (Ajustada según tu imagen de consola)
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://p-pst1-default-rtdb.firebaseio.com"
});

const db = admin.database();

// 2. CONFIGURACIÓN DEL MOTOR DE VISTAS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 3. RUTA PRINCIPAL (Para mostrar el tanque y el historial)
app.get('/', async (req, res) => {
  try {
    const tanquesSnap = await db.ref('tanque').once('value');
    const historialSnap = await db.ref('historial').limitToLast(10).once('value');

    const datos = tanquesSnap.val() || { litros: 0 };
    const historialData = historialSnap.val() || {};
    
    // Convertimos el historial en una lista para la tabla
    const lista = Object.keys(historialData).map(k => historialData[k]).reverse();

    res.render('index', { datos, lista });
  } catch (error) {
    console.error("Error al obtener datos de Firebase:", error);
    res.status(500).send("Error interno: No se pudo conectar con la base de datos.");
  }
});

// 4. PUERTO (Configuración obligatoria para Render)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor funcionando en puerto ${PORT}`);
});


