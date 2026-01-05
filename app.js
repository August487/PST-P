const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// LLAVE CORREGIDA - NO TOCAR EL FORMATO
const p_key = "-----BEGIN PRIVATE KEY-----\n" +
"MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDfYBWgus1BWOlr\n" +
"z09zvDpgYZ4ncwOx3LmfuLf5UaR1DhC2prGI4mZTaUJEA4d44q0NQO0OWLh3W+mW\n" +
"CDRw4Beqv89YqEn1nrzivOyXfvbx/nmEIhUceMZUWLPDTGtTihGg+BEP/fHMJYWJ\n" +
"gV5auU55Ad363SsxL89VfrT4cmK0SfKytmI0ZE/TtAHCLhIoFjjWtfTeWDCowEb2\n" +
"GIXpLRlcKXkYIzB5e9DlVNHRjpq3A9TTDMJplnf4OnknSgGWhV3PThkqHn+guzp8\n" +
"e95BuBoKQjKUwYifUOM+F6pXebe6CNdcVX8/XG5jI4zgswtxEdtzGNPf6cbjXhNo\n" +
"GVBaJpRNAgMBAAECggEAHWHJpoE7038rAQPdaxdUxG3CvGSsFT636fMFvBVJoR4P\n" +
"A7+Mdbl2BT3AuiqOrM+APNCP/gWcihK8eIAuybQoWMzvLLXCOL0/EkIQiuLn/6/d\n" +
"8wv6o+qdB+Y9CxDnwy7Tn81RjT11i0laNdqe+ycJ0+/zb3adIlSsHI5UpqOBKT6b\n" +
"2e8xffBSLGY8BvRYTfgV7j7CHjryFVP0Al+0JpPaApQpNN+B7CJRCKJcDEytUKyq\n" +
"tE9SJGgczvRniLgwH47bKTnxAW+zjMpNMJ8QCo3pl+SjhL154GIbhsyRATiAePXE\n" +
"2Bsg79jAlJQQ2GSu1uUbCo0k9nEPSyoWbEL0xi4YHwKBgQD9iSD8MohDPGd7Z195\n" +
"pqbgDVbLoNyTNGUq++oXbYS/9OaTEF0RPKsVxxZcw+ObMoTJQvXmBc9wZjPmePaF\n" +
"LAWT3s8RG7SsAfbyARwxnNaCiKTuHFu2xIoxnNoUevbnc7VBNEdGq5F7Q29nz34j\n" +
"+51DTfNFAOxNxYQpGb0ufL2HMwKBgQDhi+hq6wsSDHR4EKS3O3kPg+A93WW/vvuF\n" +
"RZrDpQoydVFOzJUGUV+JgudpMx+kpnR2P69TLzi/G8wGvySGgWz0Y2tSI2NPApEW\n" +
"MWRRLMZEOlIUAktXepbTVpwwnfCgRW2uTbYy5+7ATZSnXMx0P5KPZRAw4Ot0gci0\n" +
"FaDGaPV2fwKBgQDJ2PK51kFFxkFcreAFKfiRSA1h8J+rUnt4zTaBkF+vs3oee1ic\n" +
"8IAExou3Lv12AbJVyUmb5+ROyA9p3cPmIjYOk8SnCje8+ZNw+BFKLmNZaRBlwY4C\n" +
"5FZhSU8WHw+TFTuovcZBLTaVvAply3vRifCaNOUIesOm5ylgz20eJZF+oQKBgCsS\n" +
"8RwaL08PGd8kLpDfxsrzwIuQELKB4r8c/+WFS2E/jnuiDoPaXoiAe3lXzh8/utYq\n" +
"na21Tg17cDCbtsigN56T0p7ZUE88vCk5WuHXYOzUkfjBcD89xFgTecY3HXAD/wWac\n" +
"aMNoD+yh5FXiHxnEWlUQU/tBuTXS42WhC8dYnCg5AoGALeOGqEBW0Vof8Z7xbyD3\n" +
"1cdAwPQAOE+un6wu7TSgs/tqPTu//0DwvYagPFQg+OfJx9OpojNiTp4036GK3fVi\n" +
"Sh7JhxifqfX7GSjRJOoZXshKQq2EXv22yIr6eqbMpwbfnJTzJXS+4izRxNYkjKYS\n" +
"FEq57iKYPhcKLYDezOU8pPY=\n" +
"-----END PRIVATE KEY-----";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "p-pst1",
    clientEmail: "firebase-adminsdk-fbsvc@p-pst1.iam.gserviceaccount.com",
    privateKey: p_key
  }),
  databaseURL: "https://p-pst1-default-rtdb.firebaseio.com"
});

const db = admin.database();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    const snap = await db.ref('tanque').once('value');
    const datos = snap.val() || { litros: 0 };
    res.render('index', { datos, lista: [] });
  } catch (e) {
    res.status(500).send("Error");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ¡LISTO! Puerto ${PORT}`);
});
