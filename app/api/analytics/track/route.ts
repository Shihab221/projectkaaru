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
