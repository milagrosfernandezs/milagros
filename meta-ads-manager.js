/**
 * Meta Ads Manager - Gestión automática de campañas publicitarias
 * Responsable de optimizar anuncios para incrementar ventas
 */

const fetch = require('node-fetch');

class MetaAdsManager {
  constructor(accessToken, adAccountId) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
    this.baseUrl = 'https://graph.instagram.com/v18.0';
    this.apiVersion = 'v18.0';
    this.campaignMetrics = {};
  }

  /**
   * Crea una nueva campaña publicitaria optimizada para conversiones
   */
  async createCampaign(campaignData) {
    try {
      const {
        name,
        objective = 'CONVERSIONS', // Optimizado para ventas
        dailyBudget = 50,
        targetAudience = {},
      } = campaignData;

      const payload = {
        name,
        objective,
        status: 'PAUSED', // Comienza pausado para revisión
        daily_budget: dailyBudget * 100, // En centavos
        ...campaignData,
      };

      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${this.adAccountId}/campaigns?access_token=${this.accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.id) {
        console.log(`✅ Campaña creada: ${name} (ID: ${result.id})`);
        return result;
      } else {
        throw new Error(result.error?.message || 'Error al crear campaña');
      }
    } catch (error) {
      console.error('Error creando campaña:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza los contenidos de los anuncios basado en rendimiento
   */
  async optimizeAdContent(campaignId, metrics) {
    try {
      const { conversionRate, cpc, roas } = metrics;

      // Lógica de optimización automática
      let optimizations = {
        status: 'ACTIVE',
      };

      // Si el CPC es muy alto, reduce el presupuesto
      if (cpc > 2.0) {
        optimizations.daily_budget = Math.max(2500, metrics.currentBudget * 100 * 0.8);
        console.log(`📉 CPC alto detectado (${cpc}). Reduciendo presupuesto...`);
      }

      // Si la tasa de conversión es baja, cambia audiencia
      if (conversionRate < 0.02) {
        console.log(`⚠️ Tasa de conversión baja (${conversionRate}). Ajustando audiencia...`);
        optimizations.targeting = this.generateOptimalTargeting();
      }

      // Si ROAS es excelente, aumenta presupuesto
      if (roas > 4.0) {
        optimizations.daily_budget = metrics.currentBudget * 100 * 1.2;
        console.log(`🚀 ROAS excelente (${roas}). Aumentando presupuesto...`);
      }

      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${campaignId}?access_token=${this.accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(optimizations),
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error optimizando anuncios:', error.message);
      throw error;
    }
  }

  /**
   * Genera público objetivo óptimo para buzos personalizados
   */
  generateOptimalTargeting() {
    return {
      age_min: 14,
      age_max: 35,
      genders: [1, 2], // Todos
      interests: [
        { id: '6003139', name: 'Fashion' },
        { id: '6003107', name: 'Shopping' },
        { id: '6002714', name: 'Arts and culture' },
        { id: '6003116', name: 'Trending topics' },
      ],
      behaviors: [
        { id: '6015235', name: 'Shoppers' },
      ],
      countries: ['AR'], // Argentina
      device_platforms: ['mobile', 'desktop'],
    };
  }

  /**
   * Obtiene métricas de rendimiento de una campaña
   */
  async getCampaignMetrics(campaignId) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${campaignId}/insights?fields=impressions,clicks,spend,actions,action_values,cpc,ctr,cpp,cpm&access_token=${this.accessToken}`
      );

      const result = await response.json();

      if (result.data && result.data.length > 0) {
        const data = result.data[0];
        const metrics = {
          impressions: parseInt(data.impressions || 0),
          clicks: parseInt(data.clicks || 0),
          spend: parseFloat(data.spend || 0),
          conversions: this.getConversionsFromActions(data.actions),
          cpc: parseFloat(data.cpc || 0),
          ctr: parseFloat(data.ctr || 0),
          cpm: parseFloat(data.cpm || 0),
        };

        // Calcular métricas derivadas
        metrics.conversionRate = metrics.conversions / metrics.clicks || 0;
        metrics.roas = metrics.conversions > 0 ? (metrics.conversions * 50) / metrics.spend : 0; // Asumiendo AOV de $50

        this.campaignMetrics[campaignId] = metrics;
        return metrics;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo métricas:', error.message);
      throw error;
    }
  }

  /**
   * Extrae conversiones de los datos de acciones
   */
  getConversionsFromActions(actions) {
    if (!actions) return 0;

    const purchases = actions.find(a => a.action_type === 'purchase');
    return purchases ? parseInt(purchases.value || 0) : 0;
  }

  /**
   * Pausa una campaña si el rendimiento es muy bajo
   */
  async pauseLowPerformingCampaign(campaignId, metrics) {
    if (metrics.roas < 1.0 && metrics.spend > 100) {
      try {
        await fetch(
          `https://graph.facebook.com/${this.apiVersion}/${campaignId}?access_token=${this.accessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PAUSED' }),
          }
        );
        console.log(`⏸️ Campaña pausada por bajo rendimiento (ROAS: ${metrics.roas})`);
        return true;
      } catch (error) {
        console.error('Error pausando campaña:', error.message);
      }
    }
    return false;
  }

  /**
   * Ejecuta optimización automática diaria
   */
  async runDailyOptimization(campaignIds) {
    console.log('🔄 Iniciando optimización diaria...');

    for (const campaignId of campaignIds) {
      try {
        const metrics = await this.getCampaignMetrics(campaignId);

        if (metrics) {
          console.log(`📊 Métricas de campaña ${campaignId}:`, metrics);

          // Pausar si rendimiento es muy bajo
          await this.pauseLowPerformingCampaign(campaignId, metrics);

          // Optimizar si está activa
          if (metrics.roas > 0) {
            await this.optimizeAdContent(campaignId, metrics);
          }
        }
      } catch (error) {
        console.error(`Error procesando campaña ${campaignId}:`, error.message);
      }
    }

    console.log('✅ Optimización diaria completada');
  }

  /**
   * Genera reporte de rendimiento
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      campaigns: this.campaignMetrics,
      summary: {
        totalSpend: 0,
        totalConversions: 0,
        averageRoas: 0,
        bestPerforming: null,
        worstPerforming: null,
      },
    };

    let roasSum = 0;
    let count = 0;

    for (const [campaignId, metrics] of Object.entries(this.campaignMetrics)) {
      report.summary.totalSpend += metrics.spend;
      report.summary.totalConversions += metrics.conversions;
      roasSum += metrics.roas;
      count++;

      if (!report.summary.bestPerforming || metrics.roas > report.summary.bestPerforming.roas) {
        report.summary.bestPerforming = { campaignId, ...metrics };
      }
      if (!report.summary.worstPerforming || metrics.roas < report.summary.worstPerforming.roas) {
        report.summary.worstPerforming = { campaignId, ...metrics };
      }
    }

    report.summary.averageRoas = count > 0 ? (roasSum / count).toFixed(2) : 0;

    return report;
  }
}

module.exports = MetaAdsManager;
