import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import BookingModal from '@/components/BookingModal';
import UserControlsModal from '@/components/UserControlsModal';
import AdminControlsModal from '@/components/AdminControlsModal';
import MemberAuthModal from '@/components/MemberAuthModal';
import EasterEggsModal from '@/components/EasterEggsModal';
import LofiPlayer from '@/components/LofiPlayer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'TalkLab 2.0 — The English Conversation Club You Actually Want to Join',
  description: "TalkLab is Tripoli's modern, gamified English conversation club for young minds. Interactive debates, taboo arcade, real-time 30 LYD seat booking, and chill vibes.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/assets/logo-blue.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/assets/logo-blue.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  openGraph: {
    title: 'TalkLab 2.0 — The English Conversation Club You Actually Want to Join',
    description: "Tripoli's weekly English conversation club at People & Spaces. 30 LYD flat fee, zero boring grammar, 100% interactive fun.",
    images: [{ url: '/assets/logo-blue.png', width: 1024, height: 1024, alt: 'TalkLab Logo' }]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2F42F0'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-palette="notebook" dir="ltr" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col">
        <AppProvider>
          {children}
          <BookingModal />
          <UserControlsModal />
          <MemberAuthModal />
          <AdminControlsModal />
          <EasterEggsModal />
          <LofiPlayer />
        </AppProvider>
      </body>
    </html>
  );
}
