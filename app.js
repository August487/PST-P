const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

const getFirebaseConfig = () => {
  try {
    const rawKeys = process.env.FIREBASE_KEYS;
    if (!rawKeys) throw new Error("No se encontró FIREBASE_KEYS en Render");
    const config = JSON.parse(rawKeys);
    config.private_key = config.private_key.replace(/\\n/g, '\n');
    return config;
  } catch (error) {
    console.error("❌ Error en Firebase Config:", error.message);
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
    // 1. Obtener datos del TANQUE (722.5 ml)
    const tanqueSnap = await db.ref('tanque').once('value');
    const tData = tanqueSnap.val() || {};
    
    // Buscamos litros y ultima_actualizacion
    const datosTanque = {
      litros: tData.litros || 0,
      actualizacion: tData.ultima_actualizacion || "Desconocida"
    };

    // 2. Obtener HISTORIAL
    const histSnap = await db.ref('historial').once('value');
    const histData = histSnap.val() || {};
    
    // Lógica para limpiar los campos con "::" o nombres variados
    const historial = Object.keys(histData).map(key => {
      const nodo = histData[key];
      // Busca 'fecha' o 'fecha::'
      const fechaFinal = nodo.fecha || nodo['fecha::'] || "No registrada";
      // Busca 'litros' o 'litros::'
      const litrosFinal = nodo.litros !== undefined ? nodo.litros : (nodo['litros::'] || 0);
      
      return {
        fecha: fechaFinal.replace(/"/g, ''), // Quita comillas extra si existen
        valor: litrosFinal
      };
    }).reverse();

    // 3. Cálculos para 722.5 ml
    const capacidadMax = 722.5;
    const porcentaje = Math.min((datosTanque.litros / capacidadMax) * 100, 100);
    // Marcamos como suficiente si supera los 500ml
    const ok = datosTanque.litros > 500;

    res.render('index', { 
      datos: datosTanque, 
      porcentaje: porcentaje, 
      ok: ok, 
      historial: historial 
    });
    
  } catch (e) {
    console.error("❌ Error en ruta /:", e);
    res.status(500).send("Error de base de datos");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor en línea en puerto ${PORT}`);
});
