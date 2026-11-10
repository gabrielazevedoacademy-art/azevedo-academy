'use client';

import { useFormStatus } from 'react-dom';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string };

export default function SubmitButton({ children, pendingLabel, className = 'btn btn-primary', ...rest }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || rest.disabled} aria-busy={pending} {...rest}>
      {pending ? (<><span className="spinner" aria-hidden />{pendingLabel ?? children}</>) : children}
    </button>
  );
}
