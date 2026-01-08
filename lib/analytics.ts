/**
 * Meta Pixel (Facebook Pixel) Event Tracking Utility
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

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

/**
 * Check if Meta Pixel is loaded
 */
function isMetaPixelLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

/**
 * Track a custom event with Meta Pixel
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (!isMetaPixelLoaded()) {
    console.warn("Meta Pixel not loaded yet. Event not tracked:", eventName);
    return;
  }

  try {
    if (eventData) {
      window.fbq("track", eventName, eventData);
    } else {
      window.fbq("track", eventName);
    }
  } catch (error) {
    console.error("Error tracking Meta Pixel event:", error);
  }
}

/**
 * Track PageView (automatically tracked, but can be called manually)
 */
export function trackPageView() {
  trackEvent("PageView");
}

/**
 * Track Purchase event - Call when order is completed
 * @param value - Order total amount
 * @param currency - Currency code (default: BDT)
 * @param contents - Array of purchased items
 */
export function trackPurchase(
  value: number,
  currency: string = "BDT",
  contents?: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    item_price: number;
  }>
) {
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

  trackEvent("Purchase", eventData);
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
export function trackAddToCart(
  value: number,
  currency: string = "BDT",
  contentId?: string,
  contentName?: string,
  contentCategory?: string,
  quantity: number = 1
) {
  const eventData: Record<string, any> = {
    value,
    currency,
    content_type: "product",
    quantity,
  };

  if (contentId) eventData.content_ids = [contentId];
  if (contentName) eventData.content_name = contentName;
  if (contentCategory) eventData.content_category = contentCategory;

  trackEvent("AddToCart", eventData);
}

/**
 * Track InitiateCheckout event - Call when user starts checkout
 * @param value - Cart total
 * @param currency - Currency code (default: BDT)
 * @param contents - Array of items in cart
 */
export function trackInitiateCheckout(
  value: number,
  currency: string = "BDT",
  contents?: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    item_price: number;
  }>
) {
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

  trackEvent("InitiateCheckout", eventData);
}

/**
 * Track ViewContent event - Call when product page is viewed
 * @param contentId - Product ID
 * @param contentName - Product name
 * @param contentCategory - Product category
 * @param value - Product price
 * @param currency - Currency code (default: BDT)
 */
export function trackViewContent(
  contentId?: string,
  contentName?: string,
  contentCategory?: string,
  value?: number,
  currency: string = "BDT"
) {
  const eventData: Record<string, any> = {
    content_type: "product",
    currency,
  };

  if (contentId) eventData.content_ids = [contentId];
  if (contentName) eventData.content_name = contentName;
  if (contentCategory) eventData.content_category = contentCategory;
  if (value !== undefined) eventData.value = value;

  trackEvent("ViewContent", eventData);
}

/**
 * Track Search event - Call when user searches
 * @param searchString - Search query
 * @param contentIds - Array of product IDs in results (optional)
 */
export function trackSearch(searchString: string, contentIds?: string[]) {
  const eventData: Record<string, any> = {
    search_string: searchString,
    content_type: "product",
  };

  if (contentIds && contentIds.length > 0) {
    eventData.content_ids = contentIds;
  }

  trackEvent("Search", eventData);
}

/**
 * Track Contact event - Call when user submits contact form
 */
export function trackContact() {
  trackEvent("Contact");
}

/**
 * Track Lead event - Call when user signs up or shows interest
 */
export function trackLead() {
  trackEvent("Lead");
}

/**
 * Track CompleteRegistration event - Call when user completes signup
 */
export function trackCompleteRegistration() {
  trackEvent("CompleteRegistration");
}
