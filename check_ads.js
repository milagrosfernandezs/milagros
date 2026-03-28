require('dotenv').config();
const fetch = require('node-fetch');

const token = process.env.META_ACCESS_TOKEN;
const accountId = process.env.META_AD_ACCOUNT_ID;

async function checkAds() {
  console.log('🔍 Analizando tus anuncios...\n');
  
  try {
    // Obtener campañas
    const campaignsRes = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/campaigns?fields=id,name,status,daily_budget,spend,objective&access_token=${token}`
    );
    const campaigns = await campaignsRes.json();

    if (!campaigns.data) {
      console.log('❌ Error:', campaigns.error?.message);
      return;
    }

    console.log(`📊 TOTAL CAMPAÑAS: ${campaigns.data.length}\n`);

    for (const campaign of campaigns.data) {
      console.log(`\n📌 ${campaign.name}`);
      console.log(`   Estado: ${campaign.status === 'ACTIVE' ? '✅ ACTIVA' : '⏸️ PAUSADA'}`);
      console.log(`   Presupuesto/día: $${(campaign.daily_budget/100).toFixed(2)}`);
      console.log(`   Objetivo: ${campaign.objective}`);

      // Obtener insights
      const insightsRes = await fetch(
        `https://graph.facebook.com/v18.0/${campaign.id}/insights?fields=impressions,clicks,spend,actions,cpc,ctr&access_token=${token}`
      );
      const insights = await insightsRes.json();

      if (insights.data && insights.data[0]) {
        const data = insights.data[0];
        console.log(`   Impresiones: ${data.impressions || 0}`);
        console.log(`   Clics: ${data.clicks || 0}`);
        console.log(`   Gasto: $${parseFloat(data.spend || 0).toFixed(2)}`);
        console.log(`   CPC: $${parseFloat(data.cpc || 0).toFixed(2)}`);
        console.log(`   CTR: ${parseFloat(data.ctr || 0).toFixed(2)}%`);
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkAds();
