# 🚀 Despliegue en Render (5 minutos)

Este sistema se despliega en Render.com, que proporciona un servidor real en la nube con conexión a internet.

## Pasos:

### 1. Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Haz clic en "Sign Up"
3. Usa tu email
4. Verifica tu email

### 2. Conectar GitHub
1. En Render, ve a "Conectar repositorio"
2. Selecciona GitHub (o GitLab)
3. Autoriza la conexión

### 3. Desplegar
1. En Render, click en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio `milagrosfernandezs/milagros`
4. Selecciona rama `claude/meta-ads-integration-wVs7A`
5. Llena los datos:
   - **Name:** `cute-baires-ads`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 4. Agregar variables de entorno
En Render, ve a "Environment":

```
META_ACCESS_TOKEN=EAAW1L9W6CcsBRMfPzPQhAYo9apKaVmTMMfaZCQjKGz1NH3a3eGyvx2K5ZCZCULeQ6euitLLcykVZAnm0CJYQmu0i7Qms3e3iI8odHRwrjdQmqGhjlezJBiNh3PtpWHMwbDPIPNBwh9ytDYuA6IexiGZByYsJ2NTEEWmWTtUy3K5jCMC11pFTnk2GIsfyR4rMTrgZDZD

META_AD_ACCOUNT_ID=act_3138715802975699

META_BUSINESS_ACCOUNT_ID=1135509063833204
```

### 5. Deploy
Click en "Deploy" y espera 2-3 minutos.

Una vez hecho, Render te da un URL como:
```
https://cute-baires-ads.onrender.com
```

---

## ✅ Tu dashboard estará en:

```
https://cute-baires-ads.onrender.com/pages/dashboard-ads.html
```

¡Listo! El sistema estará activo 24/7 con conexión real a Meta API.
