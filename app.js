const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// FUNCIÓN PARA LIMPIAR LA LLAVE AUTOMÁTICAMENTE
const getFirebaseConfig = () => {
  try {
    const rawKeys = process.env.FIREBASE_KEYS;
    if (!rawKeys) throw new Error("No se encontró la variable FIREBASE_KEYS en Render");
    
    const config = JSON.parse(rawKeys);
    // Esto arregla los saltos de línea que causan el error "Invalid PEM"
    config.private_key = config.private_key.replace(/\\n/g, '\n');
    return config;
  } catch (error) {
    console.error("❌ Error procesando FIREBASE_KEYS:", error.message);
    return null;
  }
};

const serviceAccount = getFirebaseConfig();

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://p-pst1-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  try {
    const snap = await db.ref('tanque').once('value');
    const datos = snap.val() || { litros: 0 };
    res.render('index', { datos, lista: [] });
  } catch (e) {
    res.status(500).send("Error de Firebase: " + e.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor en puerto ${PORT} listo para probar`);
});
