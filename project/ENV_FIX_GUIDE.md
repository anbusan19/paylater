# Environment Variables Fix Guide

## Issue
Getting error: "Merchant wallet address not configured"

## Quick Fixes

### 1. Restart Development Server
Environment variables are loaded when the dev server starts. After updating `.env`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Check .env File Location
Make sure `.env` is in the project root (same level as `package.json`):

```
project/
├── .env                 ← Should be here
├── package.json
├── src/
└── ...
```

### 3. Verify .env Content
Your `.env` should look like:

```env
VITE_MERCHANT_WALLET_ADDRESS="0xF746C249955f7516A601E309764241590486b509"
VITE_LIQUIDITY_WALLET_ADDRESS="0xF746C249955f7516A601E309764241590486b509"
```

### 4. Check Browser Console
Open browser console (F12) and look for:
```
Environment Variables Debug:
VITE_MERCHANT_WALLET_ADDRESS: 0xF746C249955f7516A601E309764241590486b509
```

### 5. Fallback Configuration
I've added fallback addresses in the code, so even if env vars don't load, it should use:
- Merchant: `0xF746C249955f7516A601E309764241590486b509`
- Liquidity: `0xF746C249955f7516A601E309764241590486b509`

## Testing Steps

1. **Restart dev server**: `npm run dev`
2. **Open app** and check debug panel
3. **Look at console** for environment variable logs
4. **Try payment** - should now work with configured addresses

## If Still Not Working

Check if you have multiple `.env` files:
- `.env.local`
- `.env.development`
- `.env.production`

Vite loads them in priority order. Make sure your variables are in the right file.

## Verification

The debug panel now shows:
- ✅ PYUSD Contract Address
- ✅ Merchant Wallet Address  
- ✅ Liquidity Pool Address

All should show valid addresses, not "NOT CONFIGURED".