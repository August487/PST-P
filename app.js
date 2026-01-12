const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// CONFIGURACIÓN DE FIREBASE
const getFirebaseConfig = () => {
  try {
    const rawKeys = process.env.FIREBASE_KEYS;
    if (!rawKeys) throw new Error("No se encontró la variable FIREBASE_KEYS en Render");
    const config = JSON.parse(rawKeys);
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

// RUTA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    // 1. Obtener nivel actual del tanque
    const tanqueSnap = await db.ref('tanque').once('value');
    const datos = tanqueSnap.val() || { litros: 0 };

    // 2. Obtener el historial (lectura1, lectura2, etc.)
    const histSnap = await db.ref('historial').once('value');
    const histData = histSnap.val() || {};
    
    // Convertir objeto de Firebase a lista para la tabla
    const historial = Object.keys(histData).map(key => ({
      nombre: key, // Esto mostrará "lectura1", "lectura2", etc.
      valor: histData[key].litros || 0
    })).reverse(); // El más reciente arriba

    // 3. Lógica de Negocio (722.5 ml)
    const capacidadMax = 722.5;
    const umbralSuficiente = 200; 
    
    const porcentaje = Math.min((datos.litros / capacidadMax) * 100, 100);
    const esSuficiente = datos.litros >= umbralSuficiente;

    res.render('index', { 
      datos: datos, 
      porcentaje: porcentaje, 
      ok: esSuficiente, 
      historial: historial 
    });
    
  } catch (e) {
    console.error("❌ Error:", e);
    res.status(500).send("Error de base de datos");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Monitor de Agua en puerto ${PORT}`);
});
