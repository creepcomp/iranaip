'use client';

import { createContext, useContext } from 'react';

const AdminContext = createContext(false);

export const _AdminProvider = AdminContext.Provider;

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children, isAdmin, }: { children: React.ReactNode, isAdmin: boolean }) {
  return <_AdminProvider value={isAdmin}>{children}</_AdminProvider>;
}
