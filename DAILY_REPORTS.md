# 📧 Sistema de Reportes Diarios

**Recibe un email cada día a las 9 AM con el rendimiento de tus anuncios.**

---

## Setup (2 minutos)

### 1. Agregar credenciales de email al .env

```
# En tu .env, agrega:
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app
```

**Para Gmail:**
1. Ve a [myaccount.google.com/security](https://myaccount.google.com/security)
2. Habilita "Verificación en 2 pasos"
3. Ve a "Contraseñas de aplicación"
4. Selecciona "Mail" y "Windows/Linux"
5. Copia la contraseña de 16 caracteres
6. Úsala en `EMAIL_PASSWORD`

### 2. Instalar dependencias

```bash
npm install nodemailer node-cron
```

### 3. Activar en server.js

Agrega esto en tu `server.js`:

```javascript
const DailyReporter = require('./daily-reporter');

const reporter = new DailyReporter(
  process.env.META_ACCESS_TOKEN,
  process.env.META_AD_ACCOUNT_ID,
  'blancasalai@gmail.com' // Tu email
);

reporter.startScheduler();
```

### 4. Listo

El sistema enviará automáticamente un reporte cada día a las 9 AM con:
- ✅ Todas tus campañas activas
- ✅ Impresiones, clics, gasto
- ✅ CPC (Costo por Clic)
- ✅ Recomendaciones automáticas

---

## Qué recibirás

Un email con tabla de campañas y análisis automático:
- Si CPC es alto → recomendación de revisar público
- Si conversiones son bajas → cambiar creativos
- Etc.

---

**Listo. Los reportes llegan automáticamente a tu email cada día.**
