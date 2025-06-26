# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Termigo is a modern terminal client management tool built with **Tauri** (Rust backend) and **React** (TypeScript frontend). It enables cross-platform SSH connection management, terminal sessions, port forwarding, and credential storage.

## Development Commands

### Frontend Development

- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend for production
- `npm run serve` - Preview production build

### Tauri Development

- `npm run tauri dev` - Start Tauri development mode (runs both frontend and backend)
- `npm run tauri build` - Build production Tauri application

### Code Quality

- `npm run lint` - Run ESLint linter
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- Pre-commit hooks automatically run: `npm run lint`, `npm run format`, `cargo fmt --check`, `cargo clippy`

## Architecture Overview

### Frontend (React + TypeScript)

The frontend follows a feature-based component architecture:

**Main Layout:**

- `routes/__root.tsx` - Root layout with sidebar navigation and conditional terminal/page rendering
- App switches between terminal view and management pages based on `activeTerminal` state

**Core Features:**

- **Hosts Management** (`/hosts`) - SSH host configuration and connection
- **Identities Management** (`/identities`) - SSH identity/credential storage
- **Private Keys Management** (`/private-keys`) - SSH key management
- **Settings** (`/settings`) - Application configuration and updates
- **Terminals** - Full-screen terminal sessions with xterm.js

**State Management:**

- **Zustand** stores with Immer middleware:
  - `terminal.store.ts` - Active terminals, host mappings
  - `portforward.store.ts` - Port forwarding tunnel state

**Backend Communication:**

- All Rust backend calls go through `core/invoker.ts`
- Services (`services/`) provide typed interfaces for each feature area
- Uses Tauri's `invoke()` API with custom error handling

### Backend (Rust/Tauri)

- Located in `src-tauri/` directory
- Handles SSH connections, terminal streams, credential storage
- Commands are invoked from frontend via `invoker.ts`

### UI Components

**Shadcn/ui Integration:**

- Uses shadcn/ui component library with CSS variables for theming
- Components in `components/ui/` follow shadcn patterns
- **Dark mode only** - app is hardcoded to dark theme in `__root.tsx`
- Color system uses semantic variables: `bg-card`, `text-muted-foreground`, `border-border`, etc.

**Component Structure:**

- `components/pages/` - Feature-specific page components
- `components/shared/` - Reusable components (Card, ConfirmDialog, Dropzone)
- Each feature has: main page, card component, and sidebar for CRUD operations

### Key Patterns

**Form Handling:**

- React Hook Form with Zod validation
- Controllers for complex form inputs
- Sidebar pattern for create/edit operations

**Data Fetching:**

- TanStack Query for server state management
- Services layer abstracts backend communication
- Automatic refetching after mutations

**Terminal Integration:**

- xterm.js for terminal rendering
- Terminal sessions managed via Zustand store
- Tauri streams for real-time terminal data

## Development Guidelines

### Color Usage

Always use shadcn semantic color variables rather than hardcoded colors. The application uses a comprehensive color system with CSS variables for theming.

#### Core Color Variables (Dark Theme)

```css
--background: 222.2 84% 4.9%; /* Very dark blue - Main app background */
--foreground: 210 40% 98%; /* Almost white - Main text */
--card: 222.2 84% 4.9%; /* Very dark blue - Card backgrounds */
--card-foreground: 210 40% 98%; /* Almost white - Card text */
--primary: 210 40% 98%; /* Almost white - Primary buttons */
--primary-foreground: 222.2 47.4% 11.2%; /* Dark blue - Text on primary */
--secondary: 217.2 32.6% 17.5%; /* Dark blue-gray - Secondary elements */
--secondary-foreground: 210 40% 98%; /* Almost white - Text on secondary */
--muted: 217.2 32.6% 17.5%; /* Dark blue-gray - Muted backgrounds */
--muted-foreground: 215 20.2% 65.1%; /* Light gray - Muted text */
--destructive: 0 62.8% 30.6%; /* Dark red - Destructive actions */
--destructive-foreground: 210 40% 98%; /* Almost white - Text on destructive */
--border: 217.2 32.6% 17.5%; /* Dark blue-gray - Borders */
--input: 217.2 32.6% 17.5%; /* Dark blue-gray - Input borders */
```

#### Semantic Color Classes

**Backgrounds:**

- `bg-background` - Main app background
- `bg-card` - Card component backgrounds
- `bg-muted` - Subtle backgrounds for footers, disabled states
- `bg-primary` - Primary buttons and important elements
- `bg-secondary` - Secondary buttons and less prominent elements
- `bg-destructive` - Delete/remove actions

**Text Colors:**

- `text-foreground` - Main text color
- `text-card-foreground` - Text on cards
- `text-muted-foreground` - Secondary/muted text
- `text-primary-foreground` - Text on primary backgrounds
- `text-destructive-foreground` - Text on destructive buttons

**Borders:**

- `border-border` - Default borders
- `border-input` - Input field borders

#### Color Usage Best Practices

1. **Semantic Usage**: Use colors based on meaning, not appearance

   - Use `bg-destructive` for delete actions, not just for red color
   - Use `bg-muted` for disabled states, not just for gray

2. **Contrast Pairing**: Always pair backgrounds with corresponding foregrounds

   - `bg-primary` with `text-primary-foreground`
   - `bg-card` with `text-card-foreground`
   - `bg-muted` with `text-muted-foreground`

3. **Avoid Hardcoded Colors**: Never use `bg-slate-900`, `text-gray-400`, etc.
   - ❌ `className="bg-slate-900 text-white"`
   - ✅ `className="bg-card text-card-foreground"`

### Component Patterns

- Card-based layouts for management pages
- Sidebar pattern for forms (create/edit)
- Consistent use of shadcn components and styling
- TypeScript interfaces defined in `interfaces/` directory

### Backend Integration

- All Tauri commands must be called through `invoker.ts`
- Services provide typed wrappers around backend functionality
- Handle `InvokerError` for user-friendly error messages

### Routing

- Uses TanStack Router with file-based routing
- Pages automatically navigate to `/hosts` on app start
- Terminal overlay system for switching between management and terminal views
