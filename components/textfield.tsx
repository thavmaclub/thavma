import { FormEvent } from 'react';
import cn from 'classnames';

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

export default function TextField({ error, loading, label, type = 'text', id, value, setValue, button, placeholder, onSubmit }: TextFieldProps): JSX.Element {
  return (
    <form onSubmit={onSubmit}>
      {label && <label htmlFor={id} className={cn({ error, disabled: loading })}>{label}</label>}
      <span className='field'>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={loading}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          className={cn({ error })}
        />
        <button className={cn({ error })} disabled={loading} type='submit'>{button}</button>
      </span>
      <style jsx>{`
        .field {
          display: flex;
        }

        label {
          font-size: 0.875rem;
          margin-bottom: 6px;
          display: block;
          transition: color 0.2s ease;
        }

        label.disabled {
          color: var(--accents-4);
        }

        label.error {
          color: var(--error);
          animation: shake 250ms 1; 
        }

        @keyframes shake {
          0% {
            transform: translateX(calc(0 - 0%));
          }
          33% {
            animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
            transform: translateX(calc(4% - 0%));
          }
          66% {
            animation-timing-function:
              cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
            transform: translateX(calc(-4% - 0%));
          }
          100% {
            transform: translateX(calc(0 - 0%));
          }
        }

        input {
          font: inherit;
          outline: none;
          appearance: none;
          font-size: 0.875rem;
          height: 40px;
          line-height: 1.25rem;
          text-rendering: auto;
          width: 100%;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-top-left-radius: var(--radius);
          border-bottom-left-radius: var(--radius);
          border: 2px solid var(--primary);
          background: var(--background);
          color: var(--on-background);
          padding: 0 12px;
          padding-right: 36px;
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        input.error {
          border-color: var(--error);
        }

        input:disabled {
          cursor: wait;
          border-color: var(--accents-4);
          color: var(--accents-4);
        }

        input::placeholder {
          color: var(--accents-4);
          opacity: 1;
        }

        button {
          border: unset;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          border-top-right-radius: var(--radius);
          border-bottom-right-radius: var(--radius);
          background: var(--primary);
          color: var(--on-primary);
          padding: 4px 12px;
          margin: unset;
          font: inherit;
          font-size: 0.875rem;
          line-height: 1;
          text-align: center;
          appearance: unset;
          cursor: pointer;
          flex: none;
          transition: background 0.2s ease, color 0.2s ease;
        }

        button.error {
          background: var(--error);
          color: var(--on-error);
        }
        
        button:disabled {
          cursor: wait;
          background: var(--accents-4);
        }
      `}</style>
    </form>
  );
}
