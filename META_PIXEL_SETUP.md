# Meta Pixel Server-Side Tracking Implementation Guide

## ✅ Hybrid Implementation Complete

Meta Pixel has been successfully implemented with **hybrid tracking** combining client-side pixel for browser detection with server-side Conversions API for reliable event tracking.

### Current Configuration:
- **Meta Pixel ID**: `862848263044423`
- **Client-Side**: Pixel loaded for Pixel Helper detection
- **Server-Side**: Conversions API for actual event tracking
- **Access Token**: Configured for authenticated API calls

## 📋 Environment Variables

Add these to your `.env.local` file (or `.env` for production):

```env
# Meta Pixel Configuration
NEXT_PUBLIC_META_PIXEL_ID=862848263044423
META_ACCESS_TOKEN=EAAcJ7YzhDVIBQTmmWtrDGe0GAiMmu3UEeI8vjmu8d8TZB4AhGRH2luOYgnl8QFtLZAIqjgHpQWWAnHTB8PZCh2NfZA0HtcoMk6K2ZCgy2OxLUKKZAToZAcZBpE8mfxymxX4q38H3hYLxaFZBinHPDQeGquAwhzAvsS1LhKpdMBHSXj1G1aA0Xm1e3VBjCWSKZB0QZDZD

# Database Configuration
DATABASE_URL="your-database-url-here"
DIRECT_URL="your-direct-url-here"

# JWT Secret
JWT_SECRET="your-jwt-secret-here"
```

**Important**: The `NEXT_PUBLIC_` prefix is only needed for the Pixel ID. The Access Token should remain server-side only.

## 🎯 Tracked Events

The following e-commerce events are automatically tracked using **server-side Conversions API**:

1. **PageView** - Automatically tracked on every page load
2. **ViewContent** - When a product page is viewed
3. **AddToCart** - When an item is added to cart
4. **InitiateCheckout** - When user reaches checkout page
5. **Purchase** - When an order is successfully completed
6. **Search** - When user performs a search
7. **Contact** - When user submits contact form
8. **Lead** - When user shows interest
9. **CompleteRegistration** - When user completes signup

## 🔄 Server-Side vs Client-Side Tracking

### Benefits of Server-Side Tracking:
- **More Reliable**: Events are sent directly from your server, not dependent on client-side JavaScript
- **Better Privacy**: No browser fingerprinting or third-party cookies required
- **GDPR Compliant**: Better compliance with privacy regulations
- **Ad Blocker Resistant**: Server-side tracking bypasses most ad blockers
- **Enhanced Data**: Includes server-side user data (IP, User-Agent, etc.)

### How It Works:
1. Client-side events trigger API calls to `/api/analytics/track`
2. Server sends events to Meta's Conversions API with user data
3. Events are processed server-side with proper authentication

## 🔍 How to Verify Server-Side Meta Pixel is Working

### Method 1: Facebook Events Manager (Primary Verification)

1. **Access Events Manager**:
   - Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
   - Select your Pixel (ID: 862848263044423)

2. **Check Real-Time Activity**:
   - Click on "Test Events" or "Live Activity"
   - Browse your website
   - You should see events appearing in real-time from server-side tracking

3. **Verify Event Details**:
   - Click on any event to see details
   - Check that:
     - Event name is correct (PageView, Purchase, etc.)
     - Parameters are being sent (value, currency, content_ids, etc.)
     - **Action Source** shows "website" (server-side events)

### Method 2: Server Logs and Network Tab

1. **Check Browser Network Tab**:
   - Press `F12` → Network tab
   - Filter by "analytics/track"
   - You should see POST requests to `/api/analytics/track` for each event

2. **Check Server Console Logs**:
   - Events are logged in your server console
   - Look for messages like: "Purchase event tracked successfully"

3. **Test API Endpoint Directly**:
   ```bash
   curl -X POST http://localhost:3002/api/analytics/track \
     -H "Content-Type: application/json" \
     -d '{"event":"PageView","data":{}}'
   ```

### Method 3: Test Events (Development Mode)

When `NODE_ENV=development`, events include a `test_event_code` for testing:

1. **In Events Manager**:
   - Go to Test Events section
   - Look for events with test code "TEST12345"

2. **Verify Test Events**:
   - Test events appear in Events Manager but don't affect actual campaigns
   - Remove test code for production deployment

## 🧪 Testing Checklist

Use this checklist to verify all events are working:

- [ ] **PageView** - Load homepage → Check Pixel Helper
- [ ] **ViewContent** - View a product page → Check Pixel Helper shows "ViewContent" event
- [ ] **AddToCart** - Add product to cart → Check Pixel Helper shows "AddToCart" event with product details
- [ ] **InitiateCheckout** - Go to checkout → Check Pixel Helper shows "InitiateCheckout" event
- [ ] **Purchase** - Complete an order → Check Pixel Helper shows "Purchase" event with order value

## 📊 Server-Side Event Data Structure

Events are sent to Meta's Conversions API with enhanced server-side data:

### Purchase Event (Server-Side Format):
```javascript
{
  event_name: 'Purchase',
  event_time: 1703123456,
  event_source_url: 'https://yourwebsite.com/checkout',
  action_source: 'website',
  user_data: {
    client_ip_address: '192.168.1.1',
    client_user_agent: 'Mozilla/5.0...',
    fbc: 'fb.1.1703123456...',
    fbp: 'fb.1.1703123456...'
  },
  custom_data: {
    value: 1250.00,
    currency: 'BDT',
    contents: [
      {
        id: 'product-id-1',
        name: 'Product Name',
        category: 'Category Name',
        quantity: 2,
        item_price: 500.00
      }
    ],
    content_ids: ['product-id-1', 'product-id-2'],
    content_type: 'product',
    num_items: 3
  }
}
```

### Client-Side API Call (What your app sends):
```javascript
// POST /api/analytics/track
{
  event: 'Purchase',
  data: {
    value: 1250.00,
    currency: 'BDT',
    contents: [...],
    content_ids: ['product-id-1', 'product-id-2'],
    num_items: 3
  }
}
```

### Server-Side Advantages:
- **IP Address**: User's IP for better geo-targeting
- **User Agent**: Device and browser information
- **Click IDs**: fbc/fbp parameters when available
- **Event Source URL**: Exact page where event occurred
- **Server Timestamp**: Accurate event timing

## 🚨 Troubleshooting

### Server-Side Tracking Not Working?

1. **Check Environment Variables**:
   - Ensure both `NEXT_PUBLIC_META_PIXEL_ID` and `META_ACCESS_TOKEN` are set
   - Restart your development server after adding variables

2. **Check API Endpoint**:
   - Visit `http://localhost:3002/api/analytics/track` directly
   - Should return a 405 Method Not Allowed (only accepts POST)

3. **Verify Access Token**:
   - Ensure the Access Token is valid and has the right permissions
   - Check Facebook Events Manager for any authentication errors

4. **Check Server Logs**:
   - Look for API errors in your server console
   - Meta API responses are logged for debugging

### Events Not Appearing in Events Manager?

1. **Check Network Requests**:
   - Ensure `/api/analytics/track` requests are successful (200 status)
   - Check browser Network tab for failed requests

2. **Verify Event Data**:
   - Events require proper data structure
   - Check server logs for "event tracked successfully" messages

3. **Test vs Live Events**:
   - Development: Events include test code, appear in Test Events
   - Production: Events appear in Live Activity immediately

### Access Token Issues?

1. **Generate New Token**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Your App → Marketing API → Tools
   - Generate new access token with `ads_management` permission

2. **Token Permissions**:
   - Ensure token has Conversions API access
   - Check token expiration (some tokens expire)

## 📝 Additional Notes

- **Server-side tracking** is more reliable than client-side
- Events are sent from `/api/analytics/track` endpoint
- All tracking uses Meta's Conversions API v18.0
- User data includes IP, User-Agent, and click IDs when available
- Development mode includes test event codes
- No browser fingerprinting or third-party cookies used

## 🔗 Resources

- [Facebook Events Manager](https://business.facebook.com/events_manager2)
- [Meta Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Server-Side Tracking Guide](https://developers.facebook.com/docs/marketing-api/conversions-api/server-side-tracking)

## 🛠️ API Endpoints

- **POST** `/api/analytics/track` - Send events to server-side tracking
- **Request Body**: `{ "event": "EventName", "data": {...} }`
- **Response**: `{ "success": true, "message": "Event tracked successfully" }`

## 📋 Development vs Production

### Development Mode:
- Includes `test_event_code: "TEST12345"` in all events
- Events appear in "Test Events" section of Events Manager
- Safe for testing without affecting live campaigns

### Production Mode:
- No test codes (remove for live deployment)
- Events appear in real-time Live Activity
- Affects actual ad campaigns and analytics

---

**Server-Side Tracking Active**: Events are now sent directly from your server using Meta's Conversions API for maximum reliability and privacy compliance.
