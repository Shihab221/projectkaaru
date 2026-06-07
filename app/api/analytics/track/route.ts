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
    const { event, eventId, data } = body;

    if (!event) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

    // Get the full URL for the event
    const url = request.headers.get('referer') || request.url;

    console.log(`[Analytics] Processing ${event} event`, { eventId, data });

    let success = false;

    switch (event) {
      case 'PageView':
        success = await trackPageView(request, url, eventId);
        break;

      case 'Purchase':
        success = await trackPurchase(
          request,
          data.value,
          data.currency || 'BDT',
          data.contents,
          url,
          eventId
        );
        break;

      case 'AddToCart':
        // Handle both content_ids array and contentId singular
        const addToCartContentId = data.content_ids?.[0] || data.contentId;
        success = await trackAddToCart(
          request,
          data.value,
          data.currency || 'BDT',
          addToCartContentId,
          data.content_name || data.contentName,
          data.content_category || data.contentCategory,
          data.quantity || 1,
          url,
          eventId
        );
        break;

      case 'InitiateCheckout':
        success = await trackInitiateCheckout(
          request,
          data.value,
          data.currency || 'BDT',
          data.contents,
          url,
          eventId
        );
        break;

      case 'ViewContent':
        // Handle both content_ids array and contentId singular
        const viewContentId = data.content_ids?.[0] || data.contentId;
        success = await trackViewContent(
          request,
          viewContentId,
          data.content_name || data.contentName,
          data.content_category || data.contentCategory,
          data.value,
          data.currency || 'BDT',
          url,
          eventId
        );
        break;

      case 'Search':
        success = await trackSearch(
          request,
          data.search_string || data.searchString,
          data.content_ids || data.contentIds,
          url,
          eventId
        );
        break;

      case 'Contact':
        success = await trackContact(request, url, eventId);
        break;

      case 'Lead':
        success = await trackLead(request, url, eventId);
        break;

      case 'CompleteRegistration':
        success = await trackCompleteRegistration(request, url, eventId);
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