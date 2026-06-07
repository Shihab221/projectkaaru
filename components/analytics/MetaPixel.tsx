"use client";

import Script from "next/script";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any[];
  }
}

interface MetaPixelProps {
  pixelId: string;
}

/**
 * Meta Pixel component - loads the base pixel for Pixel Helper detection.
 * 
 * IMPORTANT: All actual event tracking (AddToCart, Purchase, etc.) is done
 * server-side via the Conversions API. This client-side pixel is only for:
 * 1. Pixel Helper browser extension detection
 * 2. Basic PageView for cookie/browser matching
 * 
 * Automatic Events are DISABLED to prevent false positives like "Subscribe" clicks.
 */
export function MetaPixel({ pixelId }: MetaPixelProps) {
  if (!pixelId) {
    return null;
  }

  return (
    <>
      {/* Client-side pixel for Pixel Helper detection */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Initialize pixel with automatic events DISABLED
            fbq('init', '${pixelId}', {}, {
              autoConfig: false,
              debug: false
            });
            
            // Disable automatic button click tracking (prevents false "Subscribe" events)
            fbq('set', 'autoConfig', false, '${pixelId}');
            
            // Only track PageView client-side (all other events go through Conversions API)
            fbq('track', 'PageView');
            
            console.log('[Meta Pixel] Loaded with ID: ${pixelId} (autoConfig disabled)');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
