'use client';

import { FrappeProvider } from 'frappe-react-sdk';

const ERP_URL = process.env.NEXT_PUBLIC_ERP_PROXY_URL || 'http://localhost:5500/erp';
const API_KEY = process.env.NEXT_PUBLIC_ERP_API_KEY || '';
const API_SECRET = process.env.NEXT_PUBLIC_ERP_API_SECRET || '';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FrappeProvider
      url={ERP_URL}
      tokenParams={API_KEY ? {
        useToken: true,
        token: () => `token ${API_KEY}:${API_SECRET}`,
        type: 'token',
      } : undefined}
    >
      {children}
    </FrappeProvider>
  );
}
