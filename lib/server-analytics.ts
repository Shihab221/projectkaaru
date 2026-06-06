/**
 * Server-side Meta Pixel (Facebook Conversions API) Event Tracking Utility
 *
 * This handles server-side event tracking using Meta's Conversions API
 * instead of client-side browser tracking.
 */

interface MetaEventData {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: string;
  user_data?: {
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
    external_id?: string;
    email?: string;
    phone?: string;
  };
  custom_data?: Record<string, any>;
}

interface MetaConversionsAPIRequest {
  data: MetaEventData[];
  test_event_code?: string; // For testing
}

/**
 * Hash a string with SHA-256 (required by Meta for PII like email)
 */
async function hashSHA256(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get user data from request for Conversions API
 * Reads fbp/fbc from custom forwarded headers (set by track/route.ts)
 * and falls back to request cookies
 */
async function getUserData(request: Request): Promise<MetaEventData['user_data']> {
  const headers = new Headers(request.headers);
  const userAgent = headers.get('user-agent');
  const ip =
    headers.get('x-forwarded-for') ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    '127.0.0.1';

  // First try the forwarded headers from the browser (most reliable)
  let fbp = headers.get('x-fbp') || '';
  let fbc = headers.get('x-fbc') || '';
  const rawEmail = headers.get('x-user-email') || '';

  // Fallback: read directly from request cookies
  if (!fbp || !fbc) {
    const cookieHeader = headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      if (!fbp) fbp = cookies['_fbp'] || '';
      if (!fbc) fbc = cookies['_fbc'] || '';
    }
  }

  // Hash email if provided (Meta requires SHA-256 hashed PII)
  const hashedEmail = rawEmail ? await hashSHA256(rawEmail) : undefined;

  return {
    client_ip_address: ip,
    client_user_agent: userAgent || '',
    fbc: fbc || undefined,
    fbp: fbp || undefined,
    email: hashedEmail,
  };
}

/**
 * Send event to Meta Conversions API
 */
async function sendToMetaAPI(eventData: MetaEventData): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  console.log('[Meta API] Config check:', {
    pixelId: pixelId ? '***' + pixelId.slice(-4) : 'MISSING',
    accessToken: accessToken ? '***' + accessToken.slice(-4) : 'MISSING',
    nodeEnv: process.env.NODE_ENV
  });

  if (!pixelId || !accessToken) {
    console.error('[Meta API] Pixel ID or Access Token not configured', {
      pixelId: !!pixelId,
      accessToken: !!accessToken
    });
    return false;
  }

  // Use v20.0 API (more recent and stable)
  const apiUrl = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`;

  // Clean undefined values from event data
  const cleanEventData = { ...eventData };
  if (!cleanEventData.event_id) delete cleanEventData.event_id;
  if (!cleanEventData.event_source_url) delete cleanEventData.event_source_url;
  
  const requestData: MetaConversionsAPIRequest = {
    data: [cleanEventData],
  };

  // Add test_event_code in development
  if (process.env.NODE_ENV === 'development') {
    requestData.test_event_code = 'TEST12345';
  }

  try {
    console.log(`[Meta API] Sending ${eventData.event_name} event:`, {
      event_id: eventData.event_id,
      event_time: eventData.event_time,
      custom_data: eventData.custom_data,
      user_data_keys: eventData.user_data ? Object.keys(eventData.user_data).filter(k => eventData.user_data![k as keyof typeof eventData.user_data]) : [],
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const responseText = await response.text();
    
    console.log(`[Meta API] Response for ${eventData.event_name}:`, {
      status: response.status,
      body: responseText
    });

    if (!response.ok) {
      console.error(`[Meta API] Error for ${eventData.event_name}:`, {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      return false;
    }

    const result = JSON.parse(responseText);
    console.log(`[Meta API] Success for ${eventData.event_name}:`, result);
    return true;
  } catch (error) {
    console.error(`[Meta API] Failed to send ${eventData.event_name}:`, error);
    return false;
  }
}

/**
 * Track PageView event
 */
export async function trackPageView(request: Request, url?: string, eventId?: string): Promise<boolean> {
  const eventData: MetaEventData = {
    event_name: 'PageView',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
  };

  return await sendToMetaAPI(eventData);
}

/**
 * Track Purchase event
 */
export async function trackPurchase(
  request: Request,
  value: number,
  currency: string = 'BDT',
  contents?: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    item_price: number;
  }>,
  url?: string,
  eventId?: string
): Promise<boolean> {
  const customData: Record<string, any> = {
    value,
    currency,
    content_type: 'product',
  };

  if (contents && contents.length > 0) {
    customData.contents = contents;
    customData.content_ids = contents.map(item => item.id);
    customData.num_items = contents.reduce((sum, item) => sum + item.quantity, 0);
  }

  const eventData: MetaEventData = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
    custom_data: customData,
  };

  console.log(`[Meta API] Sending Purchase event:`, { eventId, value, currency, numContents: contents?.length });

  return await sendToMetaAPI(eventData);
}

/**
 * Track AddToCart event
 */
export async function trackAddToCart(
  request: Request,
  value: number,
  currency: string = 'BDT',
  contentId?: string,
  contentName?: string,
  contentCategory?: string,
  quantity: number = 1,
  url?: string,
  eventId?: string
): Promise<boolean> {
  const customData: Record<string, any> = {
    value,
    currency,
    content_type: 'product',
    quantity,
  };

  if (contentId) customData.content_ids = [contentId];
  if (contentName) customData.content_name = contentName;
  if (contentCategory) customData.content_category = contentCategory;

  const eventData: MetaEventData = {
    event_name: 'AddToCart',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
    custom_data: customData,
  };

  console.log(`[Meta API] Sending AddToCart event:`, { eventId, value, contentId, contentName, quantity });

  return await sendToMetaAPI(eventData);
}

/**
 * Track InitiateCheckout event
 */
export async function trackInitiateCheckout(
  request: Request,
  value: number,
  currency: string = 'BDT',
  contents?: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    item_price: number;
  }>,
  url?: string,
  eventId?: string
): Promise<boolean> {
  const customData: Record<string, any> = {
    value,
    currency,
    content_type: 'product',
  };

  if (contents && contents.length > 0) {
    customData.contents = contents;
    customData.content_ids = contents.map(item => item.id);
    customData.num_items = contents.reduce((sum, item) => sum + item.quantity, 0);
  }

  const eventData: MetaEventData = {
    event_name: 'InitiateCheckout',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
    custom_data: customData,
  };

  console.log(`[Meta API] Sending InitiateCheckout event:`, { eventId, value, numContents: contents?.length });

  return await sendToMetaAPI(eventData);
}

/**
 * Track ViewContent event
 */
export async function trackViewContent(
  request: Request,
  contentId?: string,
  contentName?: string,
  contentCategory?: string,
  value?: number,
  currency: string = 'BDT',
  url?: string,
  eventId?: string
): Promise<boolean> {
  const customData: Record<string, any> = {
    content_type: 'product',
    currency,
  };

  if (contentId) customData.content_ids = [contentId];
  if (contentName) customData.content_name = contentName;
  if (contentCategory) customData.content_category = contentCategory;
  if (value !== undefined) customData.value = value;

  const eventData: MetaEventData = {
    event_name: 'ViewContent',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
    custom_data: customData,
  };

  return await sendToMetaAPI(eventData);
}

/**
 * Track Search event
 */
export async function trackSearch(
  request: Request,
  searchString: string,
  contentIds?: string[],
  url?: string,
  eventId?: string
): Promise<boolean> {
  const customData: Record<string, any> = {
    search_string: searchString,
    content_type: 'product',
  };

  if (contentIds && contentIds.length > 0) {
    customData.content_ids = contentIds;
  }

  const eventData: MetaEventData = {
    event_name: 'Search',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
    custom_data: customData,
  };

  return await sendToMetaAPI(eventData);
}

/**
 * Track Contact event
 */
export async function trackContact(request: Request, url?: string, eventId?: string): Promise<boolean> {
  const eventData: MetaEventData = {
    event_name: 'Contact',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
  };

  return await sendToMetaAPI(eventData);
}

/**
 * Track Lead event
 */
export async function trackLead(request: Request, url?: string, eventId?: string): Promise<boolean> {
  const eventData: MetaEventData = {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
  };

  return await sendToMetaAPI(eventData);
}

/**
 * Track CompleteRegistration event
 */
export async function trackCompleteRegistration(request: Request, url?: string, eventId?: string): Promise<boolean> {
  const eventData: MetaEventData = {
    event_name: 'CompleteRegistration',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: 'website',
    user_data: await getUserData(request),
  };

  return await sendToMetaAPI(eventData);
}
