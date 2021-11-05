import { Dispatch, SetStateAction, createContext, useContext } from 'react';

import { User } from 'lib/model';

export interface UserContextType {
  user?: User;
  setUser: Dispatch<SetStateAction<User | undefined>>;
}

export const UserContext = createContext<UserContextType>({
  user: { id: '', phone: '' },
  setUser: () => {},
});

export function useUser(): UserContextType {
  return useContext(UserContext);
}
