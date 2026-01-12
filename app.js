const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// CONFIGURACIÓN DE FIREBASE (Limpia la llave para Render)
const getFirebaseConfig = () => {
  try {
    const rawKeys = process.env.FIREBASE_KEYS;
    if (!rawKeys) throw new Error("No se encontró la variable FIREBASE_KEYS en Render");
    const config = JSON.parse(rawKeys);
    config.private_key = config.private_key.replace(/\\n/g, '\n');
    return config;
  } catch (error) {
    console.error("❌ Error en FIREBASE_KEYS:", error.message);
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
    // 1. Obtener nivel actual del tanque
    const tanqueSnap = await db.ref('tanque').once('value');
    const datos = tanqueSnap.val() || { litros: 0 };

    // 2. Obtener historial (Nodos A, lectura0, lectura1...)
    const histSnap = await db.ref('historial').once('value');
    const histData = histSnap.val() || {};
    
    // Procesamos el historial para extraer FECHA y LITROS de cada nodo
    const historial = Object.keys(histData).map(key => ({
      fecha: histData[key].fecha || "Sin fecha",
      valor: histData[key].litros || 0
    })).reverse(); // Mostrar lo más reciente primero

    // 3. Lógica para 722.5 ml
    const capacidadMax = 722.5;
    const umbral = 200; // Estado SUFICIENTE si es mayor a 200ml
    
    const porcentaje = Math.min((datos.litros / capacidadMax) * 100, 100);
    const esSuficiente = datos.litros >= umbral;

    res.render('index', { 
      datos: datos, 
      porcentaje: porcentaje, 
      ok: esSuficiente, 
      historial: historial 
    });
    
  } catch (e) {
    console.error("❌ Error de BD:", e);
    res.status(500).send("Error de conexión");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor activo en puerto ${PORT}`);
});
