import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { CloseCircle, WarningCircle } from './icons';

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export type TagStatus = 'success' | 'warning' | 'error' | 'chip-success' | 'chip-warning' | 'chip-danger' | 'chip-branded';

export function Tag({ status, block, children }: { status: TagStatus; block?: boolean; children: ReactNode }) {
  return <span className={cx('tag', `tag--${status}`, block && 'tag--block')}>{children}</span>;
}

export function Indicator({ status = 'branded', children }: { status?: 'branded' | 'subtle' | 'neutral'; children: ReactNode }) {
  return (
    <span role="status" className={cx('indicator', `indicator--${status}`)}>
      {children}
    </span>
  );
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
  label: string;
  size?: 'small' | 'medium';
  flat?: boolean;
}

export function IconButton({ icon, label, size = 'medium', flat, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx('icon-btn', size === 'medium' && 'icon-btn--medium', 'icon-btn--secondary', flat && 'icon-btn--flat', className)}
      {...rest}
    >
      {icon}
    </button>
  );
}

export function Button({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cx('btn', className)} {...rest} />;
}

export function Alert({
  variant,
  title,
  children,
  floating,
  onClick,
}: {
  variant: 'warning' | 'error';
  title: string;
  children?: ReactNode;
  floating?: boolean;
  onClick?: () => void;
}) {
  const Icon = variant === 'error' ? CloseCircle : WarningCircle;
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx('alert', `alert--${variant}`, floating && 'alert--floating')}
      onClick={onClick}
    >
      <Icon className="alert__icon" />
      <div>
        <p className="alert__title">{title}</p>
        {children && <p className="alert__body">{children}</p>}
      </div>
    </div>
  );
}

export function Divider() {
  return <hr className="divider" />;
}
