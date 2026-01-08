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
    const { event, data } = body;

    if (!event) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

    // Get the full URL for the event
    const url = request.headers.get('referer') || request.url;

    let success = false;

    switch (event) {
      case 'PageView':
        success = await trackPageView(request, url);
        break;

      case 'Purchase':
        success = await trackPurchase(
          request,
          data.value,
          data.currency || 'BDT',
          data.contents,
          url
        );
        break;

      case 'AddToCart':
        success = await trackAddToCart(
          request,
          data.value,
          data.currency || 'BDT',
          data.contentId,
          data.contentName,
          data.contentCategory,
          data.quantity || 1,
          url
        );
        break;

      case 'InitiateCheckout':
        success = await trackInitiateCheckout(
          request,
          data.value,
          data.currency || 'BDT',
          data.contents,
          url
        );
        break;

      case 'ViewContent':
        success = await trackViewContent(
          request,
          data.contentId,
          data.contentName,
          data.contentCategory,
          data.value,
          data.currency || 'BDT',
          url
        );
        break;

      case 'Search':
        success = await trackSearch(
          request,
          data.searchString,
          data.contentIds,
          url
        );
        break;

      case 'Contact':
        success = await trackContact(request, url);
        break;

      case 'Lead':
        success = await trackLead(request, url);
        break;

      case 'CompleteRegistration':
        success = await trackCompleteRegistration(request, url);
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