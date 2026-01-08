# Meta Pixel Implementation Guide

## ✅ Implementation Complete

Meta Pixel has been successfully implemented in your website with the following Pixel ID: **2398720360548171**

## 📋 Environment Variable

Add this to your `.env.local` file (or `.env` for production):

```env
NEXT_PUBLIC_META_PIXEL_ID=2398720360548171
```

**Important**: The `NEXT_PUBLIC_` prefix is required for Next.js to make this variable available in the browser.

## 🎯 Tracked Events

The following e-commerce events are automatically tracked:

1. **PageView** - Automatically tracked on every page load
2. **ViewContent** - When a product page is viewed
3. **AddToCart** - When an item is added to cart
4. **InitiateCheckout** - When user reaches checkout page
5. **Purchase** - When an order is successfully completed

## 🔍 How to Verify Meta Pixel is Working

### Method 1: Facebook Pixel Helper (Chrome Extension) - **RECOMMENDED**

1. **Install the Extension**:
   - Go to Chrome Web Store
   - Search for "Facebook Pixel Helper"
   - Install the extension by Facebook

2. **Verify on Your Website**:
   - Open your website (localhost:3000 or production URL)
   - Click the Facebook Pixel Helper icon in your browser toolbar
   - You should see:
     - ✅ Pixel ID: 2398720360548171
     - ✅ Events being tracked (PageView, ViewContent, etc.)

3. **Test Events**:
   - **PageView**: Should fire automatically when page loads
   - **ViewContent**: Navigate to a product page (`/products/[slug]`)
   - **AddToCart**: Add a product to cart
   - **InitiateCheckout**: Go to checkout page
   - **Purchase**: Complete an order

### Method 2: Facebook Events Manager

1. **Access Events Manager**:
   - Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
   - Select your Pixel (ID: 2398720360548171)

2. **Check Real-Time Activity**:
   - Click on "Test Events" or "Live Activity"
   - Browse your website
   - You should see events appearing in real-time

3. **Verify Event Details**:
   - Click on any event to see details
   - Check that:
     - Event name is correct (PageView, Purchase, etc.)
     - Parameters are being sent (value, currency, content_ids, etc.)

### Method 3: Browser Console (Developer Tools)

1. **Open Developer Tools**:
   - Press `F12` or right-click → Inspect
   - Go to the "Console" tab

2. **Check for Pixel Code**:
   - Type: `window.fbq`
   - Press Enter
   - You should see a function (not undefined)

3. **Manually Trigger Events** (for testing):
   ```javascript
   // Check if pixel is loaded
   typeof window.fbq === "function" // Should return true
   
   // Manually track a test event
   window.fbq('track', 'PageView');
   ```

### Method 4: Network Tab (Advanced)

1. **Open Developer Tools**:
   - Press `F12`
   - Go to "Network" tab
   - Filter by "tr" (Meta Pixel requests)

2. **Look for Requests**:
   - You should see requests to `facebook.com/tr`
   - Click on any request
   - Check the payload to see event data

## 🧪 Testing Checklist

Use this checklist to verify all events are working:

- [ ] **PageView** - Load homepage → Check Pixel Helper
- [ ] **ViewContent** - View a product page → Check Pixel Helper shows "ViewContent" event
- [ ] **AddToCart** - Add product to cart → Check Pixel Helper shows "AddToCart" event with product details
- [ ] **InitiateCheckout** - Go to checkout → Check Pixel Helper shows "InitiateCheckout" event
- [ ] **Purchase** - Complete an order → Check Pixel Helper shows "Purchase" event with order value

## 📊 Event Data Structure

### Purchase Event Example:
```javascript
{
  event: 'Purchase',
  value: 1250.00,
  currency: 'BDT',
  content_ids: ['product-id-1', 'product-id-2'],
  contents: [
    {
      id: 'product-id-1',
      name: 'Product Name',
      category: 'Category Name',
      quantity: 2,
      item_price: 500.00
    }
  ],
  num_items: 3
}
```

### AddToCart Event Example:
```javascript
{
  event: 'AddToCart',
  value: 500.00,
  currency: 'BDT',
  content_ids: ['product-id'],
  content_name: 'Product Name',
  content_category: 'Category Name',
  quantity: 1
}
```

## 🚨 Troubleshooting

### Pixel Not Loading?

1. **Check Environment Variable**:
   - Ensure `NEXT_PUBLIC_META_PIXEL_ID` is set in `.env.local`
   - Restart your development server after adding the variable

2. **Check Browser Console**:
   - Look for any JavaScript errors
   - Ensure no ad blockers are interfering

3. **Verify Pixel ID**:
   - Confirm the Pixel ID is correct: `2398720360548171`
   - Check in Facebook Events Manager that the Pixel exists

### Events Not Firing?

1. **Check Network Tab**:
   - Ensure requests are being sent to `facebook.com/tr`
   - Check for any blocked requests

2. **Verify Event Triggers**:
   - Ensure you're performing the actions that trigger events
   - Check the code to see where events are called

3. **Check Facebook Pixel Helper**:
   - It will show errors if events aren't firing correctly
   - Check for any warnings or errors

### Localhost vs Production

- **Localhost**: Pixel will work, but events might not appear in Events Manager immediately
- **Production**: All events will be properly tracked and visible in Events Manager

## 📝 Additional Notes

- The Pixel code is loaded in the root layout, so it's active on all pages
- Events are tracked using the utility functions in `lib/analytics.ts`
- All tracking is client-side only (browser-based)
- No sensitive user data is sent to Meta Pixel (only e-commerce events)

## 🔗 Resources

- [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- [Facebook Events Manager](https://business.facebook.com/events_manager2)
- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)

---

**Need Help?** Check Facebook Pixel Helper for real-time event tracking and debugging information.
