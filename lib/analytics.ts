/**
 * Meta Pixel (Facebook Conversions API) Server-Side Event Tracking Utility
 *
 * This handles server-side event tracking using Meta's Conversions API
 * instead of client-side browser tracking.
 *
 * Use these functions to track standard e-commerce events:
 * - trackPageView() - Automatically tracked on page load
 * - trackPurchase() - When order is completed
 * - trackAddToCart() - When item added to cart
 * - trackInitiateCheckout() - When checkout starts
 * - trackViewContent() - When product page viewed
 * - trackSearch() - When user searches
 * - trackContact() - When user submits contact form
 */

/**
 * Send event to server-side tracking API
 */
async function sendEventToServer(eventName: string, eventData?: Record<string, any>): Promise<boolean> {
  try {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        data: eventData || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to track ${eventName} event:`, errorData.error);
      return false;
    }

    const result = await response.json();
    console.log(`${eventName} event tracked successfully:`, result.message);
    return true;
  } catch (error) {
    console.error(`Error sending ${eventName} event to server:`, error);
    return false;
  }
}

/**
 * Track PageView (automatically tracked, but can be called manually)
 */
export async function trackPageView(): Promise<boolean> {
  return await sendEventToServer("PageView");
}

/**
 * Track Purchase event - Call when order is completed
 * @param value - Order total amount
 * @param currency - Currency code (default: BDT)
 * @param contents - Array of purchased items
 */
export async function trackPurchase(
  value: number,
  currency: string = "BDT",
  contents?: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    item_price: number;
  }>
): Promise<boolean> {
  const eventData: Record<string, any> = {
    value,
    currency,
  };

  if (contents && contents.length > 0) {
    eventData.contents = contents;
    eventData.content_ids = contents.map((item) => item.id);
    eventData.content_type = "product";
    eventData.num_items = contents.reduce((sum, item) => sum + item.quantity, 0);
  }

  return await sendEventToServer("Purchase", eventData);
}

/**
 * Track AddToCart event - Call when item is added to cart
 * @param value - Item price
 * @param currency - Currency code (default: BDT)
 * @param contentId - Product ID
 * @param contentName - Product name
 * @param contentCategory - Product category
 * @param quantity - Quantity added
 */
export async function trackAddToCart(
  value: number,
  currency: string = "BDT",
  contentId?: string,
  contentName?: string,
  contentCategory?: string,
  quantity: number = 1
): Promise<boolean> {
  const eventData: Record<string, any> = {
    value,
    currency,
    content_type: "product",
    quantity,
  };

  if (contentId) eventData.content_ids = [contentId];
  if (contentName) eventData.content_name = contentName;
  if (contentCategory) eventData.content_category = contentCategory;

  return await sendEventToServer("AddToCart", eventData);
}

/**
 * Track InitiateCheckout event - Call when user starts checkout
 * @param value - Cart total
 * @param currency - Currency code (default: BDT)
 * @param contents - Array of items in cart
 */
export async function trackInitiateCheckout(
  value: number,
  currency: string = "BDT",
  contents?: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    item_price: number;
  }>
): Promise<boolean> {
  const eventData: Record<string, any> = {
    value,
    currency,
  };

  if (contents && contents.length > 0) {
    eventData.contents = contents;
    eventData.content_ids = contents.map((item) => item.id);
    eventData.content_type = "product";
    eventData.num_items = contents.reduce((sum, item) => sum + item.quantity, 0);
  }

  return await sendEventToServer("InitiateCheckout", eventData);
}

/**
 * Track ViewContent event - Call when product page is viewed
 * @param contentId - Product ID
 * @param contentName - Product name
 * @param contentCategory - Product category
 * @param value - Product price
 * @param currency - Currency code (default: BDT)
 */
export async function trackViewContent(
  contentId?: string,
  contentName?: string,
  contentCategory?: string,
  value?: number,
  currency: string = "BDT"
): Promise<boolean> {
  const eventData: Record<string, any> = {
    content_type: "product",
    currency,
  };

  if (contentId) eventData.content_ids = [contentId];
  if (contentName) eventData.content_name = contentName;
  if (contentCategory) eventData.content_category = contentCategory;
  if (value !== undefined) eventData.value = value;

  return await sendEventToServer("ViewContent", eventData);
}

/**
 * Track Search event - Call when user searches
 * @param searchString - Search query
 * @param contentIds - Array of product IDs in results (optional)
 */
export async function trackSearch(searchString: string, contentIds?: string[]): Promise<boolean> {
  const eventData: Record<string, any> = {
    search_string: searchString,
    content_type: "product",
  };

  if (contentIds && contentIds.length > 0) {
    eventData.content_ids = contentIds;
  }

  return await sendEventToServer("Search", eventData);
}

/**
 * Track Contact event - Call when user submits contact form
 */
export async function trackContact(): Promise<boolean> {
  return await sendEventToServer("Contact");
}

/**
 * Track Lead event - Call when user signs up or shows interest
 */
export async function trackLead(): Promise<boolean> {
  return await sendEventToServer("Lead");
}

/**
 * Track CompleteRegistration event - Call when user completes signup
 */
export async function trackCompleteRegistration(): Promise<boolean> {
  return await sendEventToServer("CompleteRegistration");
}
