/**
 * Server-side Meta Pixel (Facebook Conversions API) Event Tracking Utility
 *
 * This handles server-side event tracking using Meta's Conversions API
 * instead of client-side browser tracking.
 */

interface MetaEventData {
  event_name: string;
  event_time: number;
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
 * Get user data from request for Conversions API
 */
function getUserData(request: Request): MetaEventData['user_data'] {
  const headers = new Headers(request.headers);
  const userAgent = headers.get('user-agent');
  const ip = headers.get('x-forwarded-for') ||
            headers.get('x-real-ip') ||
            headers.get('cf-connecting-ip') ||
            '127.0.0.1';

  // Get fbc and fbp from cookies if available
  const cookieHeader = headers.get('cookie');
  let fbc = '';
  let fbp = '';

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    fbc = cookies['_fbc'] || '';
    fbp = cookies['_fbp'] || '';
  }

  return {
    client_ip_address: ip,
    client_user_agent: userAgent || '',
    fbc: fbc || undefined,
    fbp: fbp || undefined,
  };
}

/**
 * Send event to Meta Conversions API
 */
async function sendToMetaAPI(eventData: MetaEventData): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  console.log('Meta API Config:', {
    pixelId: pixelId ? '***' + pixelId.slice(-4) : 'MISSING',
    accessToken: accessToken ? '***' + accessToken.slice(-4) : 'MISSING',
    nodeEnv: process.env.NODE_ENV
  });

  if (!pixelId || !accessToken) {
    console.error('Meta Pixel ID or Access Token not configured', {
      pixelId: !!pixelId,
      accessToken: !!accessToken
    });
    return false;
  }

  const apiUrl = `https://graph.facebook.com/v18.0/${pixelId}/events`;

  const requestData: MetaConversionsAPIRequest = {
    data: [eventData],
  };

  // Add test_event_code in development
  if (process.env.NODE_ENV === 'development') {
    requestData.test_event_code = 'TEST12345';
  }

  try {
    console.log('Sending to Meta API:', {
      url: apiUrl,
      eventName: eventData.event_name,
      hasAccessToken: !!accessToken,
      requestData: JSON.stringify(requestData, null, 2)
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestData),
    });

    console.log('Meta API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meta Conversions API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return false;
    }

    const result = await response.json();
    console.log('Meta Conversions API success:', result);
    return true;
  } catch (error) {
    console.error('Failed to send event to Meta Conversions API:', error);
    return false;
  }
}

/**
 * Track PageView event
 */
export async function trackPageView(request: Request, url?: string): Promise<boolean> {
  const eventData: MetaEventData = {
    event_name: 'PageView',
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
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
  url?: string
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
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
    custom_data: customData,
  };

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
  url?: string
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
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
    custom_data: customData,
  };

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
  url?: string
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
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
    custom_data: customData,
  };

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
  url?: string
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
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
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
  url?: string
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
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
    custom_data: customData,
  };

  return await sendToMetaAPI(eventData);
}

/**
 * Track Contact event
 */
export async function trackContact(request: Request, url?: string): Promise<boolean> {
  const eventData: MetaEventData = {
    event_name: 'Contact',
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
  };

  return await sendToMetaAPI(eventData);
}

/**
 * Track Lead event
 */
export async function trackLead(request: Request, url?: string): Promise<boolean> {
  const eventData: MetaEventData = {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
  };

  return await sendToMetaAPI(eventData);
}

/**
 * Track CompleteRegistration event
 */
export async function trackCompleteRegistration(request: Request, url?: string): Promise<boolean> {
  const eventData: MetaEventData = {
    event_name: 'CompleteRegistration',
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: url,
    action_source: 'website',
    user_data: getUserData(request),
  };

  return await sendToMetaAPI(eventData);
}