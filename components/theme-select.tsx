import DarkIcon from 'components/icons/dark';
import LightIcon from 'components/icons/light';
import Select from 'components/select';
import SystemIcon from 'components/icons/system';

import { useTheme } from 'lib/context/theme';

export default function ThemeSelect(): JSX.Element {
  const { theme, setTheme } = useTheme();
  return (
    <Select
      value={theme ?? 'system'}
      onChange={(v) => {
        window.analytics?.track('Theme Selected', { theme: v });
        setTheme(v);
      }}
      label='Theme'
      options={[
        {
          value: 'system',
          label: 'System',
          icon: <SystemIcon />,
        },
        {
          value: 'dark',
          label: 'Dark',
          icon: <DarkIcon />,
        },
        {
          value: 'light',
          label: 'Light',
          icon: <LightIcon />,
        },
      ]}
    />
  );
}
