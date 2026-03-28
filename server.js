/**
 * Servidor de Gestión de Ads - Cute Baires
 * API para gestionar campañas de Meta Ads automáticamente
 */

require('dotenv').config();
const express = require('express');
const MetaAdsManager = require('./meta-ads-manager');

const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Inicializar Manager de Ads
const adsManager = new MetaAdsManager(
  process.env.META_ACCESS_TOKEN,
  process.env.META_AD_ACCOUNT_ID
);

// Almacenamiento temporal de campañas activas
const activeCampaigns = [];

/**
 * GET /status
 * Verifica el estado de las credenciales
 */
app.get('/status', (req, res) => {
  const hasCredentials =
    process.env.META_ACCESS_TOKEN &&
    process.env.META_AD_ACCOUNT_ID;

  res.json({
    status: hasCredentials ? 'conectado' : 'falta_credenciales',
    message: hasCredentials
      ? 'Sistema listo para gestionar ads'
      : 'Por favor, configura .env con tus credenciales',
  });
});

/**
 * POST /campaign/create
 * Crea una nueva campaña publicitaria
 */
app.post('/campaign/create', async (req, res) => {
  try {
    const { name, dailyBudget = 50 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre de la campaña es requerido' });
    }

    const campaign = await adsManager.createCampaign({
      name,
      daily_budget: dailyBudget,
      objective: 'CONVERSIONS',
      targeting: adsManager.generateOptimalTargeting(),
    });

    activeCampaigns.push(campaign.id);

    res.json({
      success: true,
      campaignId: campaign.id,
      message: `Campaña "${name}" creada exitosamente`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /campaign/:id/metrics
 * Obtiene métricas de una campaña
 */
app.get('/campaign/:id/metrics', async (req, res) => {
  try {
    const metrics = await adsManager.getCampaignMetrics(req.params.id);
    res.json({
      campaignId: req.params.id,
      metrics,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /optimize
 * Ejecuta optimización manual de todas las campañas
 */
app.post('/optimize', async (req, res) => {
  try {
    await adsManager.runDailyOptimization(activeCampaigns);
    res.json({
      success: true,
      message: 'Optimización completada',
      campaignsOptimized: activeCampaigns.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /report
 * Genera reporte de desempeño
 */
app.get('/report', (req, res) => {
  const report = adsManager.generatePerformanceReport();
  res.json(report);
});

/**
 * POST /campaign/:id/pause
 * Pausa una campaña
 */
app.post('/campaign/:id/pause', async (req, res) => {
  try {
    await adsManager.pauseLowPerformingCampaign(req.params.id, { roas: 0.5, spend: 1000 });
    res.json({
      success: true,
      message: 'Campaña pausada',
      campaignId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Ejecutar optimización automática cada día a las 00:00
 */
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    console.log('Ejecutando optimización automática nocturna...');
    await adsManager.runDailyOptimization(activeCampaigns);
  }
}, 60000); // Verificar cada minuto

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Ads corriendo en puerto ${PORT}`);
  console.log(`📊 Dashboard disponible en http://localhost:${PORT}/dashboard`);
});
