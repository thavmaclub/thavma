import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';

export interface AccessContextType {
  access?: boolean | string;
  setAccess: Dispatch<SetStateAction<boolean | string | undefined>>;
}

export const AccessContext = createContext<AccessContextType>({
  access: undefined,
  setAccess: () => {},
});

export function useAccess(
  { required } = { required: false }
): AccessContextType {
  const { access, setAccess } = useContext(AccessContext);
  const { prefetch, replace, asPath } = useRouter();
  useEffect(() => {
    if (required) void prefetch('/join');
  }, [required, prefetch]);
  useEffect(() => {
    if (required && (access === false || typeof access === 'string'))
      void replace(`/join?r=${encodeURIComponent(asPath)}`);
  }, [required, replace, access, asPath]);
  return useMemo(() => ({ access, setAccess }), [access, setAccess]);
}
