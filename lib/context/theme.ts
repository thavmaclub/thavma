import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export type Theme = 'system' | 'dark' | 'light';
export interface ThemeContextType {
  theme?: Theme;
  setTheme: Dispatch<SetStateAction<Theme | undefined>>;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
});

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
