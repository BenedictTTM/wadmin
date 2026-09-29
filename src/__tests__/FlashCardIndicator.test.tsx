import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashCardIndicator } from '../components/ui/FlashCardIndicator';

describe('FlashCardIndicator Component', () => {
  it('renders Zap icon, teal colour class, and correct tooltip accessibility label when hasFlashCard is true', () => {
    const { container } = render(<FlashCardIndicator hasFlashCard={true} />);

    const trigger = screen.getByLabelText('Flash card linked');
    expect(trigger).toBeDefined();

    // Check teal styling on container
    expect(trigger.className).toContain('text-teal-600');

    // Check SVG lucide-zap presence
    const zapIcon = container.querySelector('svg.lucide-zap');
    expect(zapIcon).not.toBeNull();
  });

  it('renders Minus icon, slate colour class, and correct tooltip accessibility label when hasFlashCard is false', () => {
    const { container } = render(<FlashCardIndicator hasFlashCard={false} />);

    const trigger = screen.getByLabelText('No flash card');
    expect(trigger).toBeDefined();

    // Check slate styling on container
    expect(trigger.className).toContain('text-slate-300');

    // Check SVG lucide-minus presence
    const minusIcon = container.querySelector('svg.lucide-minus');
    expect(minusIcon).not.toBeNull();
  });

  it('renders large badge variant with explicit label when size="lg"', () => {
    render(<FlashCardIndicator hasFlashCard={true} size="lg" />);
    expect(screen.getByText('Flash card linked')).toBeDefined();
  });
});
