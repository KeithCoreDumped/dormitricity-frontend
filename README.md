# Dormitricity Frontend

This is the frontend for the Dormitricity project, built with Next.js, React, and TypeScript. It provides a user-friendly interface for monitoring dormitory electricity usage, managing subscriptions, and configuring real-time notifications.

## Features

-   **User Authentication**: Secure registration and login system.
-   **Dashboard**: A central hub displaying all subscribed dormitories as interactive cards.
-   **Seamless Subscription Management**: Add new dormitory subscriptions directly from the dashboard with an in-place, non-disruptive UI.
-   **Detailed Analytics**: View historical power usage charts for each subscription, with selectable time ranges.
-   **Advanced Notification Settings**: A comprehensive dialog to configure alerts via Feishu, WeCom, or ServerChan.
    -   Intelligent token input that parses webhook URLs.
    -   Rules for low power thresholds and estimated time to depletion.
    -   A "Test" button to instantly verify notification setup.
-   **Multi-language Support**: Full internationalization for English, Chinese, and Japanese across the entire UI and documentation.
-   **Responsive Design**: A clean, modern UI that works on both desktop and mobile devices.
-   **In-App Documentation**: User guides and tutorials written in MDX are available directly within the application.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router & Turbopack)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Internationalization**: [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)
-   **Linting**: [ESLint](https://eslint.org/)

## Project Structure

The project follows the standard Next.js App Router structure.

```
src/
├── app/                  # Main application routes
│   ├── (app)/            # Protected routes (dashboard, etc.)
│   ├── (auth)/           # Authentication routes (login, register)
│   └── layout.tsx        # Root layout
├── components/           # Reusable React components
│   ├── layout/           # Sidebar, Topbar, etc.
│   ├── subs/             # Subscription-related components (cards, settings)
│   └── ui/               # Core UI elements from shadcn/ui
├── lib/                  # Core logic and utilities
│   ├── apiClient.ts      # Backend API communication wrapper
│   ├── auth.ts           # JWT token management
│   ├── i18n.ts           # Internationalization setup
│   └── types.ts          # TypeScript type definitions
└── public/               # Static assets
    └── locales/          # Translation JSON files
```

## Getting Started

To run the frontend locally for development, follow these steps.

### 1. Prerequisites

-   Node.js (v20.x or later)
-   pnpm (or npm/yarn)

### 2. Installation

Install the project dependencies:

```bash
npm install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root of the project directory. This file will hold the URL of your backend worker.

```
# .env.local
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787
```

Replace the URL with your production worker URL if you are not running the backend locally.

### 4. Running the Development Server

Start the Next.js development server (with Turbopack for speed):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

To create a production-ready build of the application, run:

```bash
pnpm build
```

This will generate an optimized set of static files in the `.next` directory, which can be deployed to any static hosting provider or run as a Node.js server.

To run the production server locally:

```bash
pnpm start
```