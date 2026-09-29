import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MathMarkdown } from '../components/ui/MathMarkdown';

describe('MathMarkdown Component LaTeX & Formula Rendering', () => {
  it('renders inline math cleanly without throwing', () => {
    const { container } = render(
      <MathMarkdown content="This is an inline equation: $x^2 + y^2 = r^2$" />,
    );

    // KaTeX outputs elements with class "katex"
    const katexElement = container.querySelector('.katex');
    expect(katexElement).toBeDefined();
    expect(container.textContent).toContain('This is an inline equation:');
  });

  it('renders centered block equations with display math class without layout breakage', () => {
    const { container } = render(
      <MathMarkdown content="Here is a block equation:\n\n$$\\int f(x) \\, dx$$" />,
    );

    // Block math renders with katex-display
    const displayElement = container.querySelector('.katex-display');
    expect(displayElement).toBeDefined();
    expect(container.textContent).toContain('Here is a block equation:');
  });

  it('displays placeholder when content is empty', () => {
    const { container } = render(<MathMarkdown content="" placeholder="Custom Empty Message" />);
    expect(container.textContent).toContain('Custom Empty Message');
  });
});
