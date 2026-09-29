import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import BookingModal from '@/components/BookingModal';
import UserControlsModal from '@/components/UserControlsModal';
import AdminControlsModal from '@/components/AdminControlsModal';
import EasterEggsModal from '@/components/EasterEggsModal';
import LofiPlayer from '@/components/LofiPlayer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'TalkLab 2.0 — The English Conversation Club You Actually Want to Join',
  description: "TalkLab is Tripoli's modern, gamified English conversation club for young minds. Interactive debates, taboo arcade, real-time 30 LYD seat booking, and chill vibes.",
  icons: {
    icon: '/assets/logo-cream.png',
    apple: '/assets/logo-cream.png'
  },
  openGraph: {
    title: 'TalkLab 2.0 — The English Conversation Club You Actually Want to Join',
    description: "Tripoli's weekly English conversation club at People & Spaces. 30 LYD flat fee, zero boring grammar, 100% interactive fun.",
    images: [{ url: '/assets/logo-cream.png', width: 512, height: 512, alt: 'TalkLab Logo' }]
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
    <html lang="en" data-palette="pop" dir="ltr" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col">
        <AppProvider>
          {children}
          <BookingModal />
          <UserControlsModal />
          <AdminControlsModal />
          <EasterEggsModal />
          <LofiPlayer />
        </AppProvider>
      </body>
    </html>
  );
}
