export type AITemperature = {
  temp: 'hot' | 'warm' | 'cold';
  insight: string;
  action: string;
  breakdown: string;
};

// FIXED: Added explicit return type Promise<AITemperature>
export async function getAITemperature(listingId: string, views: number, clicks: number): Promise<AITemperature> {
  const score = Math.min((views * 0.1) + (clicks * 2), 100);
  
  if (score > 70) {
    return {
      temp: 'hot',
      insight: 'Your product is gaining strong traction. Push it to a Facebook Page today.',
      action: 'Prepare Facebook Post',
      breakdown: `${views} views, ${clicks} clicks this week.`
    };
  } else if (score > 30) {
    return {
      temp: 'warm',
      insight: 'You have steady interest. Sharing this in a niche Facebook group could boost sales.',
      action: 'Find Facebook Groups',
      breakdown: `${views} views, ${clicks} clicks this week.`
    };
  } else {
    return {
      temp: 'cold',
      insight: 'Your listing is quiet. A quick description refresh might catch more eyes.',
      action: 'Refresh Description',
      breakdown: `${views} views, ${clicks} clicks this week.`
    };
  }
}

export async function getDiscoveryTargets(listingId: string) {
  return {
    pages: [
      { id: 'page_1', name: 'Local Buy & Sell', followers: '12K', likelyToBuy: 85 },
      { id: 'page_2', name: 'Premium Marketplace', followers: '45K', likelyToBuy: 60 }
    ],
    groups: [
      { id: 'group_123', name: 'City Deals Hub', members: '8K', deepLink: 'fb://group/123456789', webLink: 'https://facebook.com/groups/123456789' }
    ]
  };
}