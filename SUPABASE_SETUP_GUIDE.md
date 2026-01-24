## **Prerequisites**

### 1. Install Supabase CLI

```powershell
# Install via npm
npm install supabase
```

### 2. Get Your Supabase Project Details

Go to [Supabase Dashboard](https://supabase.com/dashboard) and note:

- **Project URL**: `https://xxxxx.supabase.co`
- **Publishable Key**: From Settings → API
- **Project ID**: From Settings → General

### 3. Get Gemini API Key

- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Save it securely

---

## **STEP 1: Link Your Local Project**

### 1.1 Login to Supabase

```powershell
npx supabase login
```

This will open your browser for authentication.

### 1.2 Link to Your Project

```powershell
npx supabase link --project-ref YOUR_PROJECT_ID
```

---

## **STEP 2: Run Database Migrations**

### Option A: Push All Migrations (Recommended)

```powershell
npx supabase db push
```

This will automatically apply all migrations in chronological order.

---

## **STEP 3: Set Up Environment Variables**

### 3.1 Set Gemini API Key in Supabase

Go to your Supabase Dashboard:

1. Navigate to **Settings** → **Edge Functions**
2. Click on **Manage Secrets**
3. Add a new secret:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key

Alternatively, use CLI:

```powershell
npx supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

---

## **STEP 4: Deploy Edge Functions**

### 4.1 Deploy All Functions at Once

```powershell
npx supabase functions deploy
```

This deploys all functions in the `supabase/functions` directory.

---
