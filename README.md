# Humble Habbit 🌱

**"Lower the standard until you succeed."**

A simple, humble habit tracker designed for young people aged 17-25. Focus on progress, not perfection.

## Features ✨

- **Mobile-first design** with dark/light mode
- **Simple 2-habit tracking** with red and blue color coding
- **Day view** with motivational quotes
- **Month view** with calendar and progress visualization
- **No streaks or gamification** - just honest progress tracking
- **Secure authentication** with Supabase
- **Clean, minimal UI** using shadcn/ui components

## Tech Stack 🛠️

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Supabase** for backend and auth
- **Zustand** for state management
- **Lucide React** for icons
- **Geist** font for typography

## Quick Start 🚀

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd humble-habit-project
pnpm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

1. Go to your Supabase project > SQL Editor
2. Copy and paste the contents of `database-schema.sql`
3. Run the SQL to create tables and set up Row Level Security

### 4. Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage 📱

### Authentication
- Users must sign up/login before accessing the app
- Simple email/password authentication via Supabase

### Day View (Home)
- Shows current date prominently
- "Check Habits" button opens a modal with 2 habits
- Completed habits show as colored tags (red & blue)
- Motivational quote at the bottom
- Switch to month view

### Month View
- Calendar grid showing the current month
- Colored dots indicate completed habits for each day
- Today's date is highlighted
- Navigation between months
- Simple progress stats
- Return to day view

### The Philosophy
- **No streaks** - no pressure from broken chains
- **No gamification** - no points, levels, or badges
- **Just real progress** - honest tracking of your habits
- **Lower the bar** - make it so easy you can't fail

## Customization 🎨

### Adding More Habits
Currently limited to 2 habits by design. To add more:

1. Update database schema in `database-schema.sql`
2. Modify `HabitEntry` type in `src/lib/supabase.ts`
3. Update UI components (`HabitToggle`, `DayView`, `MonthView`)
4. Add new colors to the color scheme

### Changing Colors
Habit colors are defined as:
- Habit 1: `bg-red-300` (red)
- Habit 2: `bg-blue-300` (blue)

To change colors, update these classes throughout the components.

### Adding Quotes
Edit `src/lib/quotes.ts` to add your own motivational quotes.

## Project Structure 📁

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with theme provider
│   ├── page.tsx        # Home page (day/month view)
│   └── login/          # Login page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── DayView.tsx    # Today's view with habits
│   ├── MonthView.tsx  # Calendar month view
│   ├── Header.tsx     # Top navigation
│   ├── HabitToggle.tsx # Habit checking modal
│   └── QuoteBox.tsx   # Random motivational quotes
├── hooks/             # Custom React hooks
│   └── useAuth.ts     # Authentication hook
├── lib/               # Utilities and configuration
│   ├── supabase.ts    # Supabase client and types
│   ├── quotes.ts      # Motivational quotes
│   └── utils.ts       # General utilities
└── store/             # Zustand state management
    └── useHabitStore.ts # Habit data store
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License 📄

MIT License - see LICENSE file for details.

## Support 💬

For questions or issues:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Remember: Progress, not perfection. Lower the standard until you succeed.** 🌱
