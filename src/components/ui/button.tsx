'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    const variantStyles = {
      default:
        'bg-[#F6D86B] text-[#141827] font-bold border-2 border-[#141827] shadow-hard-sm hover:bg-[#fae28a] active:translate-y-0.5 active:shadow-none transition-all',
      destructive:
        'bg-[#E54D2E] text-white font-bold border-2 border-[#141827] shadow-hard-sm hover:bg-[#cc3d1f] active:translate-y-0.5 active:shadow-none transition-all',
      outline:
        'bg-white text-[#141827] font-bold border-2 border-[#141827] shadow-hard-sm hover:bg-[#F8F5EF] active:translate-y-0.5 active:shadow-none transition-all',
      secondary:
        'bg-[#C8D4CF] text-[#141827] font-bold border-2 border-[#141827] shadow-hard-sm hover:bg-[#b8c6c0] active:translate-y-0.5 active:shadow-none transition-all',
      ghost: 'text-[#141827] hover:bg-[#F0EBE0] font-medium transition-colors',
      link: 'text-[#141827] underline-offset-4 hover:underline font-bold',
    }[variant];

    const sizeStyles = {
      default: 'h-9 px-4 py-2 text-sm',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8 text-base',
      icon: 'h-8 w-8 p-0',
    }[size];

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',
          variantStyles,
          sizeStyles,
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
