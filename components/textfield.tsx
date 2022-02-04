import { FormEvent } from 'react';
import cn from 'classnames';

import Input from 'components/input';

export interface TextFieldProps {
  error?: boolean;
  loading?: boolean;
  label?: string;
  type?: string;
  id: string;
  value: string;
  setValue: (value: string) => unknown;
  button: string;
  placeholder: string;
  onSubmit: (evt: FormEvent) => unknown;
}

export default function TextField({
  error,
  loading,
  label,
  type = 'text',
  id,
  value,
  setValue,
  button,
  placeholder,
  onSubmit,
}: TextFieldProps): JSX.Element {
  return (
    <Input
      error={error}
      loading={loading}
      label={label}
      id={id}
      button={button}
      onSubmit={onSubmit}
    >
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={loading}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        className={cn('input', { error })}
      />
    </Input>
  );
}
