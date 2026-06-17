import './globals.css';

export const metadata = {
  title: 'Iconic Faculty | Free Education for Intermediate Students',
  description: 'I am a retired professor providing free education resources to protect intermediate students from the college mafia. Join Iconic Faculty today.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="background-overlay"></div>
        <div className="animated-bg"></div>
        {children}
      </body>
    </html>
  );
}
