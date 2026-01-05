const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// REEMPLAZO DIRECTO DE CREDENCIALES
// Abre tu archivo .json en tu PC y llena estos campos con esa info:
const serviceAccount = {
  "type": "service_account",
  "project_id": "p-pst1",
  "private_key_id": "PON_AQUI_TU_ID_DEL_JSON",
  "private_key": "-----BEGIN PRIVATE KEY-----\nTU_LLAVE_LARGA_AQUI\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@p-pst1.iam.gserviceaccount.com",
  "client_id": "PON_AQUI_TU_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "PON_AQUI_TU_URL_CERT"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://p-pst1-default-rtdb.firebaseio.com"
});

const db = admin.database();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  try {
    const tanquesSnap = await db.ref('tanque').once('value');
    const datos = tanquesSnap.val() || { litros: 0 };
    res.render('index', { datos, lista: [] });
  } catch (error) {
    res.status(500).send("Error de Firebase");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVIDOR ENCENDIDO EN PUERTO ${PORT}`);
});


