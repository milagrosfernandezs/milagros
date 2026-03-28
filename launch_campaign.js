require('dotenv').config();
const fetch = require('node-fetch');

const accessToken = process.env.META_ACCESS_TOKEN;
const adAccountId = process.env.META_AD_ACCOUNT_ID;

async function launchCampaign() {
  try {
    console.log('🚀 Lanzando campaña de Cute Baires...');
    
    const campaignData = {
      name: 'Cute Baires - Buzos Destacados ' + new Date().toLocaleDateString('es-AR'),
      objective: 'CONVERSIONS',
      status: 'ACTIVE',
      daily_budget: 1500000, // $15k en centavos
      bid_strategy: 'LOWEST_COST_WITH_BID_CAP'
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      }
    );

    const result = await response.json();
    
    if (result.id) {
      console.log('\n✅ CAMPAÑA CREADA EXITOSAMENTE\n');
      console.log('ID Campaña:', result.id);
      console.log('Nombre:', campaignData.name);
      console.log('Presupuesto diario: $15.000');
      console.log('Objetivo: CONVERSIONES (Ventas)');
      console.log('Estado: ACTIVA');
      console.log('\n🎯 La campaña está corriendo ahora\n');
    } else {
      console.log('Response:', result);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

launchCampaign();
