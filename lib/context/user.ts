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
import log from 'lib/log';

export interface UserContextType {
  user?: User | null;
  setUser: Dispatch<SetStateAction<User | undefined | null>>;
}

export const UserContext = createContext<UserContextType>({
  user: undefined,
  setUser: () => {},
});

export function useUser({
  access,
}: { access?: 'required' } = {}): UserContextType {
  const { user, setUser } = useContext(UserContext);
  const { prefetch, replace, asPath } = useRouter();
  useEffect(() => {
    if (access) void prefetch('/join');
    if (access) void prefetch('/pay');
  }, [access, prefetch]);
  useEffect(() => {
    if (access && user === null) {
      log.debug('User is null, redirecting to /join...');
      void replace(`/join?r=${encodeURIComponent(asPath)}`);
    }
    if (access && user?.access === false) {
      log.debug('Access is false, redirecting to /pay...');
      void replace(`/pay?r=${encodeURIComponent(asPath)}`);
    }
  }, [access, user, replace, asPath]);
  return useMemo(() => ({ user, setUser }), [user, setUser]);
}
