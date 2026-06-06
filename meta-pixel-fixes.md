# Meta Pixel & CAPI Fix Instructions

There are **4 files** to change. Follow them in order.

---

## FILE 1 — `lib/analytics.ts`
### What changes: Forward `fbp`/`fbc` cookies + email to CAPI, and fire `fbq()` client-side for deduplication

Replace the **entire file** with this:

```ts
/**
 * Meta Pixel (Facebook Conversions API) Client-Side Event Tracking Utility
 *
 * Each function does TWO things:
 * 1. Fires fbq() in the browser (for Pixel deduplication)
 * 2. Sends the same event + event_id to the server (CAPI)
 *
 * Both use the same event_id so Meta can deduplicate them.
 */

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

/**
 * Generate unique event ID for deduplication between client and server events
 */
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Read a browser cookie by name
 */
function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

/**
 * Send event to server-side tracking API (CAPI)
 * Also forwards fbp, fbc, and optional email for better match quality
 */
async function sendEventToServer(
  eventName: string,
  eventData?: Record<string, any>,
  email?: string
): Promise<{ success: boolean; eventId: string }> {
  const eventId = generateEventId();

  // Read Meta cookies from browser to forward to server
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');

  try {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        eventId,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
        email: email || undefined,
        data: eventData || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to track ${eventName} event:`, errorData.error);
      return { success: false, eventId };
    }

    const result = await response.json();
    console.log(`${eventName} event tracked (eventId: ${eventId}):`, result.message);
    return { success: true, eventId };
  } catch (error) {
    console.error(`Error sending ${eventName} event to server:`, error);
    return { success: false, eventId };
  }
}

/**
 * Fire the same event on the browser-side Pixel using the same event_id
 * This enables Meta to deduplicate between Pixel and CAPI
 */
function fireBrowserPixel(
  eventName: string,
  eventId: string,
  params?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params || {}, { eventID: eventId });
    console.log(`[Meta Pixel] Browser fired: ${eventName} (eventId: ${eventId})`);
  }
}

// ─────────────────────────────────────────────
// PUBLIC TRACKING FUNCTIONS
// ─────────────────────────────────────────────

export async function trackPageView(): Promise<boolean> {
  const { success, eventId } = await sendEventToServer('PageView');
  if (success) fireBrowserPixel('PageView', eventId);
  return success;
}

/**
 * Track Purchase event
 * @param value        - Order total
 * @param currency     - Currency code (default: BDT)
 * @param contents     - Array of purchased items
 * @param email        - Customer email (improves match quality)
 */
export async function trackPurchase(
  value: number,
  currency: string = 'BDT',
  contents?: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    item_price: number;
  }>,
  email?: string
): Promise<boolean> {
  const eventData: Record<string, any> = {
    value: parseFloat(value.toFixed(2)),  // Ensure clean number, fixes "same price" warning
    currency,
  };

  if (contents && contents.length > 0) {
    eventData.contents = contents;
    eventData.content_ids = contents.map((item) => item.id);
    eventData.content_type = 'product';
    eventData.num_items = contents.reduce((sum, item) => sum + item.quantity, 0);
  }

  const { success, eventId } = await sendEventToServer('Purchase', eventData, email);

  if (success) {
    fireBrowserPixel('Purchase', eventId, {
      value: eventData.value,
      currency,
      content_ids: eventData.content_ids,
      content_type: 'product',
      num_items: eventData.num_items,
    });
  }

  return success;
}

/**
 * Track AddToCart event
 * @param value           - Item total price
 * @param currency        - Currency code (default: BDT)
 * @param contentId       - Product ID
 * @param contentName     - Product name
 * @param contentCategory - Product category
 * @param quantity        - Quantity added
 */
export async function trackAddToCart(
  value: number,
  currency: string = 'BDT',
  contentId?: string,
  contentName?: string,
  contentCategory?: string,
  quantity: number = 1
): Promise<boolean> {
  const eventData: Record<string, any> = {
    value: parseFloat(value.toFixed(2)),
    currency,
    content_type: 'product',
    quantity,
  };

  if (contentId) eventData.content_ids = [contentId];
  if (contentName) eventData.content_name = contentName;
  if (contentCategory) eventData.content_category = contentCategory;

  const { success, eventId } = await sendEventToServer('AddToCart', eventData);

  if (success) {
    fireBrowserPixel('AddToCart', eventId, {
      value: eventData.value,
      currency,
      content_ids: eventData.content_ids,
      content_type: 'product',
    });
  }

  return success;
}

/**
 * Track InitiateCheckout event
 * @param value    - Cart total
 * @param currency - Currency code (default: BDT)
 * @param contents - Cart items
 * @param email    - Customer email (improves match quality)
 */
export async function trackInitiateCheckout(
  value: number,
  currency: string = 'BDT',
  contents?: Array<{
    id: string;
    name: string;
    category?: string;
    quantity: number;
    item_price: number;
  }>,
  email?: string
): Promise<boolean> {
  const eventData: Record<string, any> = {
    value: parseFloat(value.toFixed(2)),
    currency,
  };

  if (contents && contents.length > 0) {
    eventData.contents = contents;
    eventData.content_ids = contents.map((item) => item.id);
    eventData.content_type = 'product';
    eventData.num_items = contents.reduce((sum, item) => sum + item.quantity, 0);
  }

  const { success, eventId } = await sendEventToServer('InitiateCheckout', eventData, email);

  if (success) {
    fireBrowserPixel('InitiateCheckout', eventId, {
      value: eventData.value,
      currency,
      content_ids: eventData.content_ids,
      num_items: eventData.num_items,
    });
  }

  return success;
}

/**
 * Track ViewContent event
 */
export async function trackViewContent(
  contentId?: string,
  contentName?: string,
  contentCategory?: string,
  value?: number,
  currency: string = 'BDT'
): Promise<boolean> {
  const eventData: Record<string, any> = {
    content_type: 'product',
    currency,
  };

  if (contentId) eventData.content_ids = [contentId];
  if (contentName) eventData.content_name = contentName;
  if (contentCategory) eventData.content_category = contentCategory;
  if (value !== undefined) eventData.value = parseFloat(value.toFixed(2));

  const { success, eventId } = await sendEventToServer('ViewContent', eventData);

  if (success) {
    fireBrowserPixel('ViewContent', eventId, {
      content_ids: eventData.content_ids,
      content_name: contentName,
      content_type: 'product',
      value: eventData.value,
      currency,
    });
  }

  return success;
}

export async function trackSearch(searchString: string, contentIds?: string[]): Promise<boolean> {
  const eventData: Record<string, any> = {
    search_string: searchString,
    content_type: 'product',
  };
  if (contentIds && contentIds.length > 0) eventData.content_ids = contentIds;

  const { success, eventId } = await sendEventToServer('Search', eventData);
  if (success) fireBrowserPixel('Search', eventId, { search_string: searchString });
  return success;
}

export async function trackContact(): Promise<boolean> {
  const { success, eventId } = await sendEventToServer('Contact');
  if (success) fireBrowserPixel('Contact', eventId);
  return success;
}

export async function trackLead(): Promise<boolean> {
  const { success, eventId } = await sendEventToServer('Lead');
  if (success) fireBrowserPixel('Lead', eventId);
  return success;
}

export async function trackCompleteRegistration(): Promise<boolean> {
  const { success, eventId } = await sendEventToServer('CompleteRegistration');
  if (success) fireBrowserPixel('CompleteRegistration', eventId);
  return success;
}
```

---

## FILE 2 — `app/api/analytics/track/route.ts`
### What changes: Accept `fbp`, `fbc`, and `email` from the request body and pass them to CAPI

Replace the **entire file** with this:

```ts
import { NextRequest, NextResponse } from "next/server";
import {
  trackPageView,
  trackPurchase,
  trackAddToCart,
  trackInitiateCheckout,
  trackViewContent,
  trackSearch,
  trackContact,
  trackLead,
  trackCompleteRegistration,
} from "@/lib/server-analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // fbp, fbc, and email are now forwarded from the browser
    const { event, eventId, data, fbp, fbc, email } = body;

    if (!event) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

    const url = request.headers.get("referer") || request.url;

    console.log(`[Analytics] Processing ${event} event`, { eventId, data, hasFbp: !!fbp, hasFbc: !!fbc, hasEmail: !!email });

    // Pass fbp/fbc/email into the request so server-analytics can use them
    // We attach them as custom headers so getUserData() can read them
    const augmentedRequest = new Request(request.url, {
      method: request.method,
      headers: new Headers({
        ...Object.fromEntries(request.headers.entries()),
        ...(fbp ? { 'x-fbp': fbp } : {}),
        ...(fbc ? { 'x-fbc': fbc } : {}),
        ...(email ? { 'x-user-email': email } : {}),
      }),
      body: request.body,
    });

    let success = false;

    switch (event) {
      case "PageView":
        success = await trackPageView(augmentedRequest, url, eventId);
        break;

      case "Purchase":
        success = await trackPurchase(
          augmentedRequest,
          data.value,
          data.currency || "BDT",
          data.contents,
          url,
          eventId
        );
        break;

      case "AddToCart":
        const addToCartContentId = data.content_ids?.[0] || data.contentId;
        success = await trackAddToCart(
          augmentedRequest,
          data.value,
          data.currency || "BDT",
          addToCartContentId,
          data.content_name || data.contentName,
          data.content_category || data.contentCategory,
          data.quantity || 1,
          url,
          eventId
        );
        break;

      case "InitiateCheckout":
        success = await trackInitiateCheckout(
          augmentedRequest,
          data.value,
          data.currency || "BDT",
          data.contents,
          url,
          eventId
        );
        break;

      case "ViewContent":
        const viewContentId = data.content_ids?.[0] || data.contentId;
        success = await trackViewContent(
          augmentedRequest,
          viewContentId,
          data.content_name || data.contentName,
          data.content_category || data.contentCategory,
          data.value,
          data.currency || "BDT",
          url,
          eventId
        );
        break;

      case "Search":
        success = await trackSearch(
          augmentedRequest,
          data.search_string || data.searchString,
          data.content_ids || data.contentIds,
          url,
          eventId
        );
        break;

      case "Contact":
        success = await trackContact(augmentedRequest, url, eventId);
        break;

      case "Lead":
        success = await trackLead(augmentedRequest, url, eventId);
        break;

      case "CompleteRegistration":
        success = await trackCompleteRegistration(augmentedRequest, url, eventId);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown event type: ${event}` },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `${event} event tracked successfully`,
        eventId,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to track event" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## FILE 3 — `lib/server-analytics.ts`
### What changes: Read `fbp`/`fbc` from custom headers + hash email with SHA-256

Find the `getUserData` function (around line 34) and replace **just that function** with this:

```ts
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
```

> ⚠️ **Important:** Because `getUserData` is now `async`, you also need to update every function that calls it.
> Find all lines like:
> ```ts
> user_data: getUserData(request),
> ```
> And change them to:
> ```ts
> user_data: await getUserData(request),
> ```
> There are about **8 places** in the file — do a find & replace for `getUserData(request)` → `await getUserData(request)`.

---

## FILE 4 — `app/checkout/page.tsx`
### What changes: Pass `formData.email` to `trackPurchase` and `trackInitiateCheckout`

**Change 1** — `trackInitiateCheckout` call (around line 175):

Find:
```ts
      trackInitiateCheckout(checkoutTotal, "BDT", contents);
```

Replace with:
```ts
      trackInitiateCheckout(checkoutTotal, "BDT", contents, formData.email);
```

---

**Change 2** — `trackPurchase` call (around line 351):

Find:
```ts
      trackPurchase(total, "BDT", contents);
```

Replace with:
```ts
      trackPurchase(parseFloat(total.toFixed(2)), "BDT", contents, formData.email);
```

---

## That's it! Summary of what each change does

| File | What it fixes |
|---|---|
| `lib/analytics.ts` | Pixel now fires browser-side `fbq()` for every event with matching `event_id` for deduplication. Also forwards `fbp`/`fbc` cookies to server. |
| `app/api/analytics/track/route.ts` | Passes `fbp`, `fbc`, and `email` from the request body into the CAPI call. |
| `lib/server-analytics.ts` | Reads forwarded `fbp`/`fbc` headers, falls back to cookies. Hashes email with SHA-256 before sending to Meta. |
| `app/checkout/page.tsx` | Passes customer email to Purchase and InitiateCheckout events. Ensures `total` is a clean number. |
