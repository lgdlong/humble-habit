# Humble Habit - GitHub Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, build, and test the repository:

- **Install pnpm globally**: `npm install -g pnpm` (takes ~2 seconds)
- **Install dependencies**: `pnpm install` (takes ~50 seconds)
  - Alternative: `npm install` (takes ~2 minutes - slower but works)
- **Setup environment**: Copy `.env.local.example` to `.env.local` and configure Supabase credentials
- **Build project**: `pnpm build` (takes ~25 seconds). NEVER CANCEL. Set timeout to 60+ seconds.
  - Alternative: `npm run build` (takes ~25 seconds)
- **Lint code**: `pnpm lint` (takes ~3 seconds)
  - Alternative: `npm run lint` (takes ~3 seconds)
- **Format code**: `pnpm format` (takes ~2-5 seconds)
  - Uses Prettier to auto-format source files
  - Recommended before committing for clean diffs

### Environment Configuration - CRITICAL REQUIREMENT:

- **ALWAYS** create `.env.local` with valid Supabase credentials before building
- Required variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```
- Build **WILL FAIL** without these environment variables
- Get credentials from Supabase project dashboard → Settings → API

### Database Setup - REQUIRED FOR FULL FUNCTIONALITY:

- Use `database-schema-flexible.sql` (newer, more comprehensive schema)
- Run SQL in Supabase SQL Editor to create tables: `habits`, `habit_records`, `quotes`
- Includes Row Level Security (RLS) policies for user data isolation
- One-time setup per Supabase project

### Run the application:

- **Development**: `pnpm dev` (starts in ~1 second with Turbopack)
  - Alternative: `npm run dev`
  - Runs on `http://localhost:3000`
  - Uses Next.js 15 with Turbopack for fast development
- **Production**: `pnpm build && pnpm start`
  - Alternative: `npm run build && npm run start`
  - Production server starts in ~500ms after build

## Validation

### Manual Testing Workflow:

1. **ALWAYS** complete the bootstrap steps first (install, env setup, build)
2. **Start development server**: `pnpm dev`
3. **Test authentication flow**:
   - Navigate to `http://localhost:3000`
   - Should redirect to `/login` page
   - Verify clean login UI with email/password fields
4. **Test with real Supabase setup** (if available):
   - Create test account through sign-up
   - Login and verify redirect to main app
   - Test habit creation and tracking functionality
5. **Test production build**: `pnpm build && pnpm start`

### Code Quality Validation:

- **ALWAYS** run `pnpm lint` before committing changes
- **RECOMMENDED** run `pnpm format` to auto-format code
- No ESLint errors/warnings should be present
- TypeScript compilation must succeed (included in build process)

## Architecture Overview

### Tech Stack:

- **Next.js 15** with App Router and Turbopack
- **TypeScript** (strict mode enabled)
- **Tailwind CSS** with shadcn/ui components
- **Supabase** for authentication and database
- **Zustand** for state management
- **pnpm** as primary package manager (npm works as fallback)

### Key Project Structure:

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Main app (redirects to login/home)
│   ├── login/page.tsx     # Authentication page
│   ├── home/page.tsx      # Main habit tracking interface
│   └── api/               # API routes for habits, records, auth
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Navigation with theme toggle
│   ├── DayView.tsx       # Daily habit view
│   ├── MonthView.tsx     # Monthly calendar view
│   ├── HabitToggle.tsx   # Habit tracking modal
│   └── QuoteBox.tsx      # Motivational quotes
├── lib/                  # Utilities and configuration
│   ├── supabase.ts       # Supabase client setup
│   ├── quotes.ts         # Motivational quotes library
│   └── utils.ts          # General utilities
├── store/                # Zustand state management
└── types/                # TypeScript type definitions
```

### Database Schema:

- **habits** table: User's custom habits
- **habit_records** table: Daily completion tracking
- **quotes** table: Motivational quotes
- Uses Row Level Security (RLS) for user data isolation

## Common Tasks

### Development Workflow:

1. **Make changes** to components in `src/components/`
2. **Test immediately** with hot-reload in dev server
3. **Lint changes**: `pnpm lint`
4. **Build to verify**: `pnpm build`
5. **Manual test** the affected functionality

### Key Files to Monitor:

- **Components**: Always check related components when modifying habit logic
- **Types**: Update `src/types/` when changing data structures
- **Supabase config**: Check `src/lib/supabase.ts` for database changes
- **State management**: Review `src/store/` for global state changes

### Environment Troubleshooting:

- **Build fails**: Check `.env.local` has valid Supabase credentials
- **Auth issues**: Verify Supabase project settings and RLS policies
- **Database errors**: Ensure schema is applied correctly in Supabase
- **pnpm issues**: Use `npm` commands as fallback

## Timing Expectations - NEVER CANCEL

- **pnpm install**: ~50 seconds (NEVER CANCEL - wait 2+ minutes)
- **npm install**: ~2 minutes (NEVER CANCEL - wait 5+ minutes)
- **pnpm build**: ~25 seconds (NEVER CANCEL - set 60+ second timeout)
- **pnpm lint**: ~3 seconds
- **pnpm dev startup**: ~1 second
- **pnpm start**: ~500ms

### Build Cache:

- First build may show "No build cache found" warning - this is normal
- Subsequent builds will be faster with cache

## Application Features

### User Experience:

- **Mobile-first responsive design** with dark/light mode
- **Authentication required** - redirects to login if not authenticated
- **Two-habit tracking system** with color coding (red/blue themes)
- **Day view**: Current date, habit checking modal, motivational quotes
- **Month view**: Calendar with habit completion dots, navigation
- **No gamification**: No streaks or pressure - just honest progress tracking

### Philosophy: "Lower the standard until you succeed"

- Designed for young people aged 17-25
- Focuses on progress over perfection
- Clean, minimal interface without overwhelming features
- Humble approach to habit formation

## Failure Scenarios

### Known Issues:

- **Build fails without Supabase env vars** - Expected behavior, requires setup
- **TypeScript version warning in lint** - Can be ignored, doesn't affect functionality
- **npm slower than pnpm** - Both work, pnpm preferred for performance

### Not Implemented:

- **No test suite** - Manual testing required
- **No CI/CD workflows** - Manual deployment process
- **No automated environment setup** - Manual Supabase configuration required

REMEMBER: This is a working application that requires proper Supabase setup for full functionality. Always test with real database when possible to validate changes fully.
