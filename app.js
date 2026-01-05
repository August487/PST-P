const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// 1. CONFIGURACIÓN DE CREDENCIALES DIRECTAS
const serviceAccount = {
  "type": "service_account",
  "project_id": "p-pst1",
  "private_key_id": "e1f695b338af5887fbd0ec3d5eb25d4cde4758da",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDfYBWgus1BWOlr\nz09zvDpgYZ4ncwOx3LmfuLf5UaR1DhC2prGI4mZTaUJEA4d44q0NQO0OWLh3W+mW\nCDRw4Beqv89YqEn1nrzivOyXfvbx/nmEIhUceMZUWLPDTGtTihGg+BEP/fHMJYWJ\ngV5auU55Ad363SsxL89VfrT4cmK0SfKytmI0ZE/TtAHCLhIoFjjWtfTeWDCowEb2\nGIXpLRlcKXkYIzB5e9DlVNHRjpq3A9TTDMJplnf4OnknSgGWhV3PThkqHn+guzp8\ne95BuBoKQjKUwYifUOM+F6pXebe6CNdcVX8/XG5jI4zgswtxEdtzGNPf6cbjXhNo\nGVBaJpRNAgMBAAECggEAHWHJpoE7038rAQPdaxdUxG3CvGSsFT636fMFvBVJoR4P\nA7+Mdbl2BT3AuiqOrM+APNCP/gWcihK8eIAuybQoWMzvLLXCOL0/EkIQiuLn/6/d\n8wv6o+qdB+Y9CxDnwy7Tn81RjT11i0laNdqe+ycJ0+/zb3adIlSsHI5UpqOBKT6b\n2e8xffBSLGY8BvRYTfgV7j7CHjryFVP0Al+0JpPaApQpNN+B7CJRCKJcDEytUKyq\ntE9SJGgczvRniLgwH47bKTnxAW+zjMpNMJ8QCo3pl+SjhL154GIbhsyRATiAePXE\n2Bsg79jAlJQQ2GSu1uUbCo0k9nEPSyoWbEL0xi4YHwKBgQD9iSD8MohDPGd7Z195\npqbgDVbLoNyTNGUq++oXbYS/9OaTEF0RPKsVxxZcw+ObMoTJQvXmBc9wZjPmePaF\nLAWT3s8RG7SsAfbyARwxnNaCiKTuHFu2xIoxnNoUevbnc7VBNEdGq5F7Q29nz34j\n+51DTfNFAOxNxYQpGb0ufL2HMwKBgQDhi+hq6wsSDHR4EKS3O3kPg+A93WW/vvuF\nRZrDpQoydVFOzJUGUV+JgudpMx+kpnR2P69TLzi/G8wGvySGgWz0Y2tSI2NPApEW\nMWRRLMZEOlIUAktXepbTVpwwnfCgRW2uTbYy5+7ATZSnXMx0P5KPZRAw4Ot0gci0\nFaDGaPV2fwKBgQDJ2PK51kFFxkFcreAFKfiRSA1h8J+rUnt4zTaBkF+vs3oee1ic\n8IAExou3Lv12AbJVyUmb5+ROyA9p3cPmIjYOk8SnCje8+ZNw+BFKLmNZaRBlwY4C\n5FZhSU8WHw+TFTuovcZBLTaVvAply3vRifCaNOUIesOm5ylgz20eJZF+oQKBgCsS\n8RwaL08PGd8kLpDfxsrzwIuQELKB4r8c/+WFS2E/jnuiDoPaXoiAe3lXzh8/utYq\na21Tg17cDCbtsigN56T0p7ZUE88vCk5WuHXYOzUkfjBcD89xFgTecY3HXAD/wWac\naMNoD+yh5FXiHxnEWlUQU/tBuTXS42WhC8dYnCg5AoGALeOGqEBW0Vof8Z7xbyD3\n1cdAwPQAOE+un6wu7TSgs/tqPTu//0DwvYagPFQg+OfJx9OpojNiTp4036GK3fVi\nSh7JhxifqfX7GSjRJOoZXshKQq2EXv22yIr6eqbMpwbfnJTzJXS+4izRxNYkjKYS\nFEq57iKYPhcKLYDezOU8pPY=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@p-pst1.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://p-pst1-default-rtdb.firebaseio.com"
});

const db = admin.database();

// 2. CONFIGURACIÓN DE VISTAS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 3. RUTA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    const tanquesSnap = await db.ref('tanque').once('value');
    const historialSnap = await db.ref('historial').limitToLast(10).once('value');

    const datos = tanquesSnap.val() || { litros: 0 };
    const historialData = historialSnap.val() || {};
    const lista = Object.keys(historialData).map(k => historialData[k]).reverse();

    res.render('index', { datos, lista });
  } catch (error) {
    console.error("Error Firebase:", error);
    res.status(500).send("Error conectando a la base de datos.");
  }
});

// 4. PUERTO PARA RENDER
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ¡ÉXITO! Servidor funcionando en puerto ${PORT}`);
});
