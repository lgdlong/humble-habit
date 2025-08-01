# Humble Habbit - Development Setup Guide

## Prerequisites

Make sure you have the following installed:
- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- A Supabase account

## Environment Setup

1. **Clone the repository** (if you haven't already)
2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database:**
   - Create a new Supabase project
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database-schema.sql`
   - Execute the SQL to create tables and policies

5. **Start the development server:**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## Testing the App

1. **Visit the app** - you should be redirected to `/login`
2. **Create an account** using the "Sign up" option
3. **Login** and you'll see the day view
4. **Test habit tracking:**
   - Click "Check Habits" button
   - Toggle the two habits (red and blue)
   - Save and see the colored tags appear
5. **Test month view:**
   - Click "Month View" to see the calendar
   - Completed habits show as colored dots
   - Navigate between months

## Key Features Implemented

✅ **Authentication:** Email/password login with Supabase  
✅ **Dark/Light Mode:** Theme toggle in header  
✅ **Day View:** Current date, habit checking, motivational quotes  
✅ **Month View:** Calendar with habit dots, progress stats  
✅ **Mobile-First:** Responsive design that works on all devices  
✅ **No Scrolling:** Everything fits in one viewport  
✅ **Humble Philosophy:** No streaks, just honest progress  

## File Structure

- `src/app/` - Next.js App Router pages
- `src/components/` - React components including shadcn/ui
- `src/hooks/` - Custom hooks like useAuth
- `src/lib/` - Utilities, Supabase client, quotes
- `src/store/` - Zustand state management

## Customization

- **Colors:** Edit habit colors in components (currently red-300, blue-300)
- **Quotes:** Add motivational quotes in `src/lib/quotes.ts`
- **Habits:** Currently limited to 2 by design (as per requirements)

## Troubleshooting

- **Authentication issues:** Check Supabase credentials in `.env.local`
- **Database errors:** Ensure `database-schema.sql` was executed correctly
- **Build errors:** Check that all dependencies are installed with `pnpm install`

## Next Steps

The app is production-ready! You can:
1. Deploy to Vercel, Netlify, or any hosting platform
2. Set up environment variables on your hosting platform
3. Configure a custom domain
4. Add analytics if needed

Remember: **"Lower the standard until you succeed."** 🌱
