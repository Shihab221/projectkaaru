# Meta Pixel & CAPI Checking Instructions

---

## Part 1 — Checking with Meta Pixel Helper

### Step 1 — Install the extension
Go to the Chrome Web Store and search **"Meta Pixel Helper"** — it's a free extension by Meta. Install it and pin it to your toolbar.

### Step 2 — Open your website
Go to your live website (or localhost if testing). Click the **blue Pixel Helper icon** in your toolbar. It should show your Pixel ID and a green checkmark with "PageView" detected.

### Step 3 — Test each event

| Action to do on site | Event you should see in Pixel Helper |
|---|---|
| Load any page | PageView |
| Open a product page | ViewContent |
| Click "Add to Cart" | AddToCart |
| Go to checkout page | InitiateCheckout |
| Place a test order | Purchase |

### Step 4 — Check for deduplication
After your fix, each event should show **two entries** in Pixel Helper — one from the browser Pixel and one from CAPI. That's correct and expected. Both should have the **same Event ID**, which confirms deduplication is working.

### Step 5 — Check for errors
If an event shows a red or yellow icon in Pixel Helper, click it to see what parameter is missing or malformed.

---

## Part 2 — Checking CAPI in Meta Events Manager

### Step 1 — Open Events Manager
Go to [business.facebook.com/events_manager](https://business.facebook.com/events_manager) → select your Pixel → click the **"Test Events"** tab.

### Step 2 — Copy your test code
You'll see a `TEST12345` code (or similar) on that page. Your code in `lib/server-analytics.ts` already sends `test_event_code` automatically in development mode, so in dev it should appear here immediately.

> If you're testing on production, temporarily hardcode the test code in `sendToMetaAPI()`:
> ```ts
> requestData.test_event_code = 'TEST12345'; // replace with your actual code from Events Manager
> ```
> Remove it after testing.

### Step 3 — Trigger events on your site
Do the same actions as above (visit a product, add to cart, checkout, purchase). Within a few seconds each event should appear in the Test Events panel with a green tick.

### Step 4 — Check what you want to verify

In the Test Events panel, click any event and confirm:

- ✅ `fbp` is present under User Data
- ✅ `fbc` is present (only if the user clicked a Facebook ad — otherwise it's empty, that's fine)
- ✅ `email` is present and shows as hashed (a long string of letters/numbers)
- ✅ `value` and `currency` are correct on Purchase events
- ✅ `content_ids` are populated

### Step 5 — Check match quality
Go back to the **Overview** tab in Events Manager. After a few real events come in (not test events), your match quality score will update. With email + fbp being sent correctly it should climb to **8–9/10** within 24–48 hours.

### Step 6 — Check deduplication is working
In Events Manager → **Overview** tab, look at the **"Integration"** column. Events that are properly deduplicated will show both **Meta Pixel** and **Conversions API** on the same row, not as separate rows. If you see them split into two separate rows for the same event, the `event_id` is not matching and deduplication is failing.

---

## Quick checklist before testing

- [ ] `NEXT_PUBLIC_META_PIXEL_ID` is set in your `.env`
- [ ] `META_ACCESS_TOKEN` is set in your `.env`
- [ ] You deployed or restarted your dev server after the code changes
- [ ] You're using Chrome with the Meta Pixel Helper extension installed
