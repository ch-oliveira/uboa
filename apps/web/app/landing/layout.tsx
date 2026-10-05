import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Newsreader } from 'next/font/google';
import './landing.css';

// Geist (local) for UI/body text, Newsreader for editorial display headlines.
const geist = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-ld-sans',
  weight: '100 900',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-ld-display',
  style: ['normal', 'italic'],
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: 'Urboa | Zeladoria inteligente para prédios públicos',
  description:
    'Gestão integrada, preditiva e auditável da manutenção de escolas, UBS e prédios administrativos. Do chamado à prestação de contas ao Tribunal de Contas.',
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${geist.variable} ${newsreader.variable} ld-root`}>{children}</div>;
}
