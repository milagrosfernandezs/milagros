# 🎯 Meta Ads Manager - Guía de Configuración

Sistema automático para gestionar anuncios Meta Ads y optimizar campañas para incrementar ventas.

## 📋 Requisitos Previos

- Node.js v14+ instalado
- Cuenta de Meta Business Manager
- Acceso a Meta Ads Manager

## 🔧 Pasos de Configuración

### 1. Obtener Credenciales de Meta Ads

#### 1.1 Crear App en Meta Business Manager
1. Ve a [business.facebook.com](https://business.facebook.com)
2. En la esquina superior izquierda, haz click en tu nombre
3. Selecciona "Configuración → Apps y sitios web"
4. Haz click en "Crear aplicación"
5. Selecciona tipo de app: **"Empresario"**
6. Completa los datos de la app: "Cute Baires Ads Manager"

#### 1.2 Generar Access Token
1. Ve a tu app creada
2. En el menú lateral, ve a **Herramientas → Explorador de gráficos**
3. En el dropdown de arriba a la izquierda, selecciona tu app
4. En el campo "Scopes", asegúrate de tener estos permisos:
   - `ads_management`
   - `ads_read`
   - `business_management`
5. Haz click en "Generate Access Token"
6. **Copia el token generado** (es largo, empieza con `EAAGZC...`)

#### 1.3 Obtener Ad Account ID
1. Ve a [Meta Ads Manager](https://ads.facebook.com)
2. En la esquina superior izquierda, haz click en tu nombre o logo
3. Busca "Account ID" o ve a **Configuración**
4. Copia el ID de tu cuenta publicitaria (formato: `act_XXXXXXXXXX`)

#### 1.4 Obtener Business Account ID (Opcional)
1. En Meta Business Manager → Configuración
2. Busca "Business Account ID"
3. Copia el ID

### 2. Configurar Variables de Entorno

1. En la raíz del proyecto (`/home/user/milagros`), crea un archivo llamado `.env`:

```bash
touch .env
```

2. Abre el archivo `.env` y agrega:

```
META_ACCESS_TOKEN=EAAGZC...{tu_token_aqui}...
META_AD_ACCOUNT_ID=act_123456789
META_BUSINESS_ACCOUNT_ID=987654321
DAILY_BUDGET=50
TARGET_ROAS=3.0
AUTO_OPTIMIZE=true
PORT=3000
```

**⚠️ IMPORTANTE:**
- **NUNCA** compartas tu `.env` en GitHub
- El archivo `.env` está en `.gitignore` (protegido)
- Mantén tus credenciales privadas

### 3. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- **Express**: Para el servidor web
- **dotenv**: Para leer las variables de entorno
- **node-fetch**: Para hacer requests a la API de Meta

### 4. Iniciar el Servidor

```bash
npm start
```

O en modo desarrollo (con auto-reinicio):
```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor de Ads corriendo en puerto 3000
📊 Dashboard disponible en http://localhost:3000/dashboard
```

## 📊 Usando el Dashboard

1. Abre tu navegador en `http://localhost:3000/pages/dashboard-ads.html`
2. Verás el estado de conexión en la esquina superior derecha
3. Si está **verde (✅ Conectado)**, ¡todo funciona!

### Acciones Disponibles

- **➕ Crear Nueva Campaña**: Lanza una nueva campaña publicitaria
- **⚡ Optimizar Ahora**: Ejecuta optimizaciones automáticas
- **📈 Cargar Reporte**: Ver métricas y desempeño

## 🤖 Cómo Funciona la Automatización

### Optimización Automática Diaria
El sistema se ejecuta automáticamente cada día a las **00:00** y:

1. **Pausa campañas con bajo rendimiento** (ROAS < 1.0)
2. **Reduce presupuesto** si el CPC (costo por click) es muy alto
3. **Aumenta presupuesto** si el ROAS es excelente (> 4.0)
4. **Ajusta audiencia** si la tasa de conversión es baja

### Métricas Monitoreadas

| Métrica | Qué significa | Acción automática |
|---------|---------------|-------------------|
| **ROAS** | Return on Ad Spend (ganancia por peso gastado) | > 4.0 = aumentar presupuesto |
| **CPC** | Costo por clic | > $2.0 = reducir presupuesto |
| **Tasa de Conversión** | % de clics que resultan en venta | < 2% = cambiar audiencia |
| **CTR** | Click-Through Rate (% de clics en impresiones) | Monitor de relevancia |

## 🎯 Públicos Objetivo Automáticos

El sistema está configurado para apuntar a:
- **Edad**: 14-35 años
- **Ubicación**: Argentina
- **Intereses**: Moda, compras, arte, tendencias
- **Comportamientos**: Compradores activos
- **Dispositivos**: Mobile y Desktop

## 📈 Ejemplo de Flujo

```
1. Creas una campaña con presupuesto de $50/día
   ↓
2. El sistema la activa y la monitorea
   ↓
3. A las 00:00, analiza métricas:
   - Conversiones: 5
   - Gasto: $45
   - ROAS: 5.55x (EXCELENTE)
   ↓
4. Automáticamente aumenta presupuesto a $60/día
   ↓
5. Próximo día, más alcance = más ventas
```

## 🔒 Seguridad

- **Nunca commits `.env`**: Está protegido por `.gitignore`
- **Token seguro**: Solo tú debes ver tus credenciales
- **Permisos limitados**: El token solo puede acceder a tus ads

## 🐛 Troubleshooting

### "Falta Configuración"
- Verifica que tu `.env` existe en la raíz
- Comprueba que las variables están correctas
- Reinicia el servidor

### "Error al conectar"
- Confirma que el servidor está corriendo (`npm start`)
- Verifica que no hay otro proceso en el puerto 3000
- Comprueba tu conexión a internet

### Token inválido
- Genera un nuevo token en Meta
- Asegúrate de tener todos los scopes
- Actualiza el `.env`

## 📚 API Endpoints

```
GET  /status              - Estado de conexión
POST /campaign/create     - Crear nueva campaña
GET  /campaign/:id/metrics - Obtener métricas
POST /optimize            - Ejecutar optimización
GET  /report              - Obtener reporte
POST /campaign/:id/pause  - Pausar campaña
```

## 🚀 Próximos Pasos

1. Configura tu `.env` con tus credenciales
2. Ejecuta `npm install && npm start`
3. Abre el dashboard en `http://localhost:3000/pages/dashboard-ads.html`
4. Crea tu primera campaña
5. ¡Observa cómo el sistema optimiza automáticamente!

## 💡 Tips

- Empieza con presupuestos bajos ($10-20/día) para probar
- Monitored regularmente tu ROAS
- El sistema aprende después de 2-3 días de datos
- Diferentes públicos pueden tener diferentes ROAS
- Actualiza el contenido de tus ads regularmente

---

**¿Preguntas?** Lee la documentación completa de Meta Marketing API en:
https://developers.facebook.com/docs/marketing-api
