import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export interface AccessContextType {
  access?: boolean | string;
  setAccess: Dispatch<SetStateAction<boolean | string | undefined>>;
}

export const AccessContext = createContext<AccessContextType>({
  access: undefined,
  setAccess: () => {},
});

export function useAccess(): AccessContextType {
  return useContext(AccessContext);
}
