import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export interface AccessContextType {
  access?: boolean;
  setAccess: Dispatch<SetStateAction<boolean | undefined>>;
}

export const AccessContext = createContext<AccessContextType>({
  access: undefined,
  setAccess: () => {},
});

export function useAccess(): AccessContextType {
  return useContext(AccessContext);
}
