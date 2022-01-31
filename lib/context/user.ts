import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';

import { User } from 'lib/model';

export interface UserContextType {
  user?: User | null;
  setUser: Dispatch<SetStateAction<User | undefined | null>>;
}

export const UserContext = createContext<UserContextType>({
  user: undefined,
  setUser: () => {},
});

export function useUser({ access }: { access?: 'required' }): UserContextType {
  const { user, setUser } = useContext(UserContext);
  const { prefetch, replace, asPath } = useRouter();
  useEffect(() => {
    if (!access) return;
    void prefetch('/join');
    void prefetch('/pay');
  }, [access, prefetch]);
  useEffect(() => {
    if (access && user === null)
      void replace(`/join?r=${encodeURIComponent(asPath)}`);
    if (access && user?.access === false)
      void replace(`/pay?r=${encodeURIComponent(asPath)}`);
  }, [access, user, replace, asPath]);
  return useMemo(() => ({ user, setUser }), [user, setUser]);
}
