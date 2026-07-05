# Supabase Setup

Use this when you want courses and saved scorecards to appear on every phone.

## 1. Create the database tables

1. Open your Supabase project.
2. Go to SQL Editor.
3. Paste the full contents of `supabase-setup.sql`.
4. Run it once.

## 2. Add your project keys

1. In Supabase, copy your Project URL.
2. Copy your public anon key.
3. Put both values into `supabase-config.js`.

Example:

```js
window.VEGAS_SUPABASE = {
  url: 'https://your-project-ref.supabase.co',
  anonKey: 'your-public-anon-key',
  syncKey: 'default'
};
```

Use the same `syncKey` on all phones that should share the same courses and history.

## 3. Publish the update

Commit and push the updated files to GitHub. After GitHub Pages refreshes, open the app on each phone and tap `Sync`.

## Privacy note

This simple setup uses Supabase's public anon key and open row-level security policies for easy sharing. Do not store private or sensitive data in this scorecard.
