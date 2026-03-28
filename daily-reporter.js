/**
 * Sistema de Reportes Diarios - Cute Baires
 * Envía reporte de anuncios por email cada día a las 9 AM
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const cron = require('node-cron');

class DailyReporter {
  constructor(accessToken, adAccountId, emailTo) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
    this.emailTo = emailTo;
    this.apiVersion = 'v18.0';
  }

  async getCampaignMetrics() {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.adAccountId}/campaigns?fields=id,name,status,daily_budget&access_token=${this.accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo campañas:', error.message);
      return null;
    }
  }

  async getInsights(campaignId) {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/${campaignId}/insights?fields=impressions,clicks,spend,actions,cpc,ctr,cpm&access_token=${this.accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        return data.data[0];
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  generateHTMLReport(campaigns, metricsData) {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
          h1 { color: #667eea; text-align: center; }
          .fecha { text-align: center; color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #667eea; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f9f9f9; }
          .total { font-weight: bold; background: #f0f0f0; }
          .good { color: green; }
          .bad { color: red; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 Reporte de Anuncios - Cute Baires</h1>
          <div class="fecha">${new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>

          <table>
            <thead>
              <tr>
                <th>Campaña</th>
                <th>Estado</th>
                <th>Presupuesto/día</th>
                <th>Impresiones</th>
                <th>Clics</th>
                <th>Gasto</th>
              </tr>
            </thead>
            <tbody>
    `;

    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    campaigns.forEach(campaign => {
      const metrics = metricsData[campaign.id] || {};
      const spend = parseFloat(metrics.spend || 0);
      const clicks = parseInt(metrics.clicks || 0);
      const impressions = parseInt(metrics.impressions || 0);
      const budget = parseFloat(campaign.daily_budget || 0) / 100;

      totalSpend += spend;
      totalClicks += clicks;
      totalImpressions += impressions;

      html += `
        <tr>
          <td><strong>${campaign.name}</strong></td>
          <td>${campaign.status === 'ACTIVE' ? '✅ Activa' : '⏸️ Pausada'}</td>
          <td>$${budget.toFixed(2)}</td>
          <td>${impressions.toLocaleString()}</td>
          <td>${clicks}</td>
          <td>$${spend.toFixed(2)}</td>
        </tr>
      `;
    });

    const cpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0;

    html += `
              <tr class="total">
                <td colspan="2">TOTAL</td>
                <td>-</td>
                <td>${totalImpressions.toLocaleString()}</td>
                <td>${totalClicks}</td>
                <td>$${totalSpend.toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td colspan="6">CPC (Costo por Clic): $${cpc}</td>
              </tr>
            </tbody>
          </table>

          <div style="background: #f0f7ff; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">💡 Recomendaciones</h3>
            <ul style="margin: 10px 0;">
              <li>Monitorea el CPC - Idealmente debería ser menor a $2.00</li>
              <li>Aumenta presupuesto en campañas con bajo CPC y alto CTR</li>
              <li>Revisa el público objetivo si el CPC es muy alto</li>
              <li>Mantén los creativos frescos - Cambia imágenes cada 5 días</li>
            </ul>
          </div>

          <div class="footer">
            <p>Reporte automático generado por Cute Baires Ads Manager</p>
            <p>Este email se envía automáticamente cada día a las 9 AM</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  async sendEmail(subject, htmlContent) {
    try {
      // Configurar transporte (usando Gmail como ejemplo)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: this.emailTo,
        subject: subject,
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente');
      return true;
    } catch (error) {
      console.error('Error enviando email:', error.message);
      return false;
    }
  }

  async generateAndSendReport() {
    console.log('🔄 Generando reporte diario...');

    const campaigns = await this.getCampaignMetrics();

    if (!campaigns || campaigns.length === 0) {
      console.log('❌ No hay campañas para reportar');
      return;
    }

    const metricsData = {};
    for (const campaign of campaigns) {
      const metrics = await this.getInsights(campaign.id);
      if (metrics) {
        metricsData[campaign.id] = metrics;
      }
    }

    const htmlReport = this.generateHTMLReport(campaigns, metricsData);
    const subject = `📊 Reporte de Anuncios - ${new Date().toLocaleDateString('es-AR')}`;

    await this.sendEmail(subject, htmlReport);
  }

  startScheduler() {
    // Ejecutar cada día a las 9 AM
    cron.schedule('0 9 * * *', () => {
      console.log('⏰ Es la hora del reporte diario');
      this.generateAndSendReport();
    });

    console.log('✅ Scheduler iniciado - Reporte diario a las 9 AM');
  }
}

module.exports = DailyReporter;
