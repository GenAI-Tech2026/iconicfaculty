import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '600', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'Iconic Faculty | Free Education for Intermediate Students',
  description: 'I am a retired professor providing free education resources to protect intermediate students from the college mafia. Join Iconic Faculty today.',
  icons: {
    icon: '/iconicfaculty.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body>
        <div className="background-overlay"></div>
        <div className="animated-bg"></div>
        {children}
      </body>
    </html>
  );
}
