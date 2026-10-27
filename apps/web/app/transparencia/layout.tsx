import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import './transparencia.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prestação de Contas da Zeladoria | Urboa',
  description:
    'Veja cada conserto feito nas escolas, postos de saúde e praças da cidade, com foto de antes e depois, prazo e quanto custou.',
};

export default function TransparenciaLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} tp-root`}>{children}</div>;
}
