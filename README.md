# Red Photo Feed 📸

A modern social media photo sharing platform built with React, TypeScript, and Supabase. Users can share photos, interact with posts through likes and comments, and creators can access detailed analytics about their content performance.

## 🚀 Features

### User Authentication
- **Dual Authentication System**
  - Regular user authentication (viewers)
  - Separate admin/creator authentication
  - Email verification for new users
  - Secure session management with Supabase Auth
- **Role-Based Access Control**
  - **Viewers**: Browse, like, and comment on posts
  - **Creators**: Upload posts and access analytics

### Photo Feed
- Chronological feed of all posts
- Real-time search by caption or username
- Responsive grid layout
- Real-time updates after interactions

### Post Creation (Creators Only)
- Image upload with live preview
- **Rich Metadata Fields** (all optional):
  - Caption
  - Location (📍)
  - People Present (👥)
  - Rating (1-5 stars ⭐)

### Social Interactions
- **Like System**
  - One-click like/unlike
  - Real-time like count
  - Visual feedback with heart animation
- **Comments**
  - Add and view comments
  - Display commenter's username and avatar
  - Collapsible comment sections
- **View Tracking**
  - Automatic view counting for analytics

### Creator Analytics Dashboard
- **Performance Metrics**:
  - Total Likes across all posts
  - Total Views across all posts
  - Total Comments across all posts
- Real-time calculation
- Beautiful card layout

### User Profiles
- Avatar with fallback to initials
- Username and bio display
- Grid view of user's posts
- Post count statistics

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Lucide React** - Icon library

### Backend
- **Supabase** (Backend-as-a-Service)
  - PostgreSQL Database
  - Authentication & Authorization
  - Storage for images
  - Real-time subscriptions
- **TypeScript** - Type safety throughout

## 📊 Database Schema

### profiles
```sql
- id (uuid, primary key)
- username (text, unique)
- full_name (text)
- avatar_url (text)
- bio (text)
- role (text: 'viewer' or 'creator')
- created_at (timestamptz)
```

### posts
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- image_url (text, not null)
- caption (text)
- location (text)
- people_present (text)
- rating (integer, 1-5)
- views (integer, default 0)
- likes (uuid[])
- created_at (timestamptz)
```

### comments
```sql
- id (uuid, primary key)
- post_id (uuid, foreign key)
- user_id (uuid, foreign key)
- text (text, not null)
- created_at (timestamptz)
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd red-photo-feed
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run database migrations**

Execute the SQL files in the `migrations/` folder in your Supabase SQL editor:
- `20251231_000000_enable_extensions_and_profiles.sql`
- `20251231_000001_create_posts.sql`
- `20251231_000002_create_comments.sql`
- `20260105_000000_add_role_to_profiles.sql`
- `20260106_000000_add_location_to_posts.sql`

5. **Start the development server**
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

6. **Open your browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
red-photo-feed/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Layout.tsx
│   │   ├── NavLink.tsx
│   │   └── PostCard.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and config
│   │   ├── storage.ts    # Data layer functions
│   │   ├── supabase.ts   # Supabase client
│   │   └── utils.ts
│   ├── pages/            # Page components
│   │   ├── AdminAuth.tsx
│   │   ├── Auth.tsx
│   │   ├── CreatePost.tsx
│   │   ├── Feed.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   └── Profile.tsx
│   ├── App.tsx
│   └── main.tsx
├── migrations/           # Database migrations
├── public/              # Static assets
└── package.json
```

## 🔑 Key Features Implementation

### Authentication Flow
1. User signs up with email/password
2. Email verification sent
3. User confirms email
4. Profile automatically created
5. Default role assigned (viewer)
6. Creators elevated through admin auth

### Post Creation Flow
1. Creator uploads image URL
2. Adds optional metadata (caption, location, people, rating)
3. Post saved to database
4. Appears in feed immediately

### Analytics Calculation
```typescript
totalLikes = sum(post.likes.length) for all user posts
totalViews = sum(post.views) for all user posts
totalComments = sum(post.comments.length) for all user posts
```

## 🔒 Security Features

- Row Level Security (RLS) policies on all tables
- SQL injection protection via Supabase client
- CSRF protection
- Secure password hashing
- JWT-based session tokens
- Role-based access control

## 🎨 UI/UX Highlights

- Responsive design for mobile and desktop
- Dark mode support with Tailwind
- Loading states and skeleton screens
- Toast notifications for user feedback
- Smooth animations and transitions
- Accessible components (WCAG compliant)

## 📈 Performance Optimizations

- Database indexes on frequently queried columns
- Lazy loading of images
- Debounced search input
- Optimistic UI updates
- Efficient React re-renders with useMemo
- CDN delivery for images via Supabase Storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend platform
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling


