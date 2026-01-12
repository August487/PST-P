const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// Configuración de Firebase para Render
const getFirebaseConfig = () => {
  try {
    const rawKeys = process.env.FIREBASE_KEYS;
    if (!rawKeys) throw new Error("No se encontró FIREBASE_KEYS");
    const config = JSON.parse(rawKeys);
    config.private_key = config.private_key.replace(/\\n/g, '\n');
    return config;
  } catch (error) {
    console.error("❌ Error en Config:", error.message);
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
    // 1. Obtener datos del tanque (Mostrará 722.5 ml y la fecha de tu imagen)
    const tanqueSnap = await db.ref('tanque').once('value');
    const datosTanque = tanqueSnap.val() || { litros: 0, ultima_actualizacion: "N/A" };

    // 2. Obtener historial (Lectura0, Lectura1, etc.)
    const histSnap = await db.ref('historial').once('value');
    const histData = histSnap.val() || {};
    
    // Procesamos el historial asegurando que 'fecha' y 'litros' se lean correctamente
    const historial = Object.keys(histData).map(key => ({
      fecha: histData[key].fecha || "Sin fecha",
      valor: histData[key].litros || 0
    })).reverse(); // Los más recientes arriba

    // 3. Cálculos de Interfaz
    const capacidadMax = 722.5;
    const porcentaje = Math.min((datosTanque.litros / capacidadMax) * 100, 100);
    
    // Umbral: Es SUFICIENTE si tiene más de 400ml (ajustable)
    const ok = datosTanque.litros > 400; 

    res.render('index', { 
      datos: datosTanque, 
      porcentaje: porcentaje, 
      ok: ok, 
      historial: historial 
    });
    
  } catch (e) {
    console.error("❌ Error:", e);
    res.status(500).send("Error de base de datos");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor en puerto ${PORT}`);
});
