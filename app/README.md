# DebtMates
DebtMates helps you keep track of debts with friends and family, notifying users and helping settle payments easily.

# Tech Stack
- `TypeScript`
- `React`
- `Tailwind CSS`
- `Supabase`

# Features
- Create new debts and assign them to users
- Add authorized users to manage debts
- Notify users when a new debt is assigned
- Confirm or deny payments
- Clean and responsive UI using Tailwind CSS and Shadcn UI

# Getting started
1. `Clone the repository:`
```bash
git clone <repository link>
cd DebtMates
```

2. `Install dependencies:`
```bash
npm install
```

3. `Setup the environment variables:`
Create an .env file with your Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
You can follow the official guide to get your Supabase key [here](https://supabase.com/docs/guides/getting-started).

4. `Run the development server:`
```bash
npm run dev
```

5. `View the app:`
```bash
Open http://localhost:5173 in your browser.
```

# Production build & server
1. `Build the app:`
```bash
npm run build
```

2. `Start the server:`
```bash
node server.js
```

3. `View the production app:`
```bash
http://localhost:3000
```

# Test Accounts
If you'd like to explore the app quickly, you can use these test accounts:
- **Email:** owen_hall@testing.com | **Password:** Test123
- **Email:** jesse_lang@testing.com | **Password:** Test123

# Project structure
- `/src/components` - Reusable UI components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Supabase and helper functions
- `/public` - Static assets (images, icons)
- `supabaseClient.ts` - Supabase client setup

# Future additions
- Add WhatsApp or mobile push notifications for real-time alerts
- Link a bank app or payment service to allow users to pay debts directly from the app