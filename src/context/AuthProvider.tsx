import { useState, useCallback, type ReactNode } from 'react';
import { AuthContext, type Address, type User } from './AuthContext';
import { isAdminEmail } from '../config/admin';

function loadAddresses(): Address[] {
  try {
    const saved = localStorage.getItem('kosmo-addresses');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveAddresses(addresses: Address[]) {
  localStorage.setItem('kosmo-addresses', JSON.stringify(addresses));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('kosmo-user');
      if (!saved) return null;
      const parsed: User = JSON.parse(saved);
      const isAdmin = isAdminEmail(parsed.email);
      if (parsed.isAdmin !== isAdmin) {
        const normalized = { ...parsed, isAdmin };
        localStorage.setItem('kosmo-user', JSON.stringify(normalized));
        return normalized;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [savedAddresses, setSavedAddresses] = useState<Address[]>(loadAddresses);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      isAdmin: isAdminEmail(email),
    };
    setUser(newUser);
    localStorage.setItem('kosmo-user', JSON.stringify(newUser));
    return true;
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string): Promise<boolean> => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      isAdmin: isAdminEmail(email),
    };
    setUser(newUser);
    localStorage.setItem('kosmo-user', JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('kosmo-user');
  }, []);

  const addAddress = useCallback((address: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...address,
      id: crypto.randomUUID(),
    };
    setSavedAddresses((prev) => {
      const updated = address.isDefault
        ? prev.map((a) => ({ ...a, isDefault: false }))
        : prev;
      const next = [...updated, newAddress];
      saveAddresses(next);
      return next;
    });
  }, []);

  const removeAddress = useCallback((id: string) => {
    setSavedAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveAddresses(next);
      return next;
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setSavedAddresses((prev) => {
      const next = prev.map((a) => ({ ...a, isDefault: a.id === id }));
      saveAddresses(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        savedAddresses,
        login,
        register,
        logout,
        addAddress,
        removeAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
