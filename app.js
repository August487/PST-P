const express = require('express');
const admin = require('firebase-admin');
const app = express();

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://p-pst1-default-rtdb.firebaseio.com" 
});

const db = admin.database();
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    try {
        const tanqueSnap = await db.ref('tanque').once('value');
        const historialSnap = await db.ref('historial').limitToLast(10).once('value');

        const datos = tanqueSnap.val() || { litros: 0 };
        const historialData = historialSnap.val() || {};
        const lista = Object.keys(historialData).map(k => historialData[k]).reverse();

        res.render('index', { data: datos, historial: lista });
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(3000, () => console.log("✅ Servidor en puerto 3000"));