"use client";

import { useEffect } from "react";
import Script from "next/script";
import { trackPageView } from "@/lib/analytics";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any[];
  }
}

interface MetaPixelProps {
  pixelId: string;
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  useEffect(() => {
    // Always track PageView using server-side tracking
    trackPageView().catch((error) => {
      console.error("Failed to track PageView:", error);
    });
  }, []);

  if (!pixelId) {
    return null;
  }

  return (
    <>
      {/* Client-side pixel for Pixel Helper detection in all environments */}
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
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
            console.log('Meta Pixel loaded with ID: ${pixelId}');
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
