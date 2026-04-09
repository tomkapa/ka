import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntitySearchPanel } from '../components/EntitySearchPanel.js';
import type { EntityManifest } from '@flowdiagram/core';

const testManifest: EntityManifest = {
  version: '1.0',
  entities: [
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'databases',
      tags: ['database', 'sql'],
      description: 'PostgreSQL database',
      image: 'categories/databases/postgresql.svg',
      format: 'svg',
      animated: false,
    },
    {
      id: 'redis',
      name: 'Redis',
      category: 'databases',
      tags: ['cache', 'database'],
      description: 'Redis cache',
      image: 'categories/databases/redis.svg',
      format: 'svg',
      animated: false,
    },
    {
      id: 'router',
      name: 'Router',
      category: 'networking',
      tags: ['network'],
      description: 'Router',
      image: 'categories/networking/router.svg',
      format: 'svg',
      animated: false,
    },
  ],
};

describe('EntitySearchPanel', () => {
  it('renders search input', () => {
    render(<EntitySearchPanel manifest={testManifest} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeDefined();
  });

  it('shows all entities when no search query', () => {
    render(<EntitySearchPanel manifest={testManifest} />);
    expect(screen.getByText('PostgreSQL')).toBeDefined();
    expect(screen.getByText('Redis')).toBeDefined();
    expect(screen.getByText('Router')).toBeDefined();
  });

  it('filters entities on search', async () => {
    render(<EntitySearchPanel manifest={testManifest} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'database' } });

    // Should show database entities
    expect(screen.getByText('PostgreSQL')).toBeDefined();
    expect(screen.getByText('Redis')).toBeDefined();
  });

  it('calls onSelect when entity is clicked', () => {
    const onSelect = vi.fn();
    render(
      <EntitySearchPanel manifest={testManifest} onSelect={onSelect} />,
    );
    fireEvent.click(screen.getByText('PostgreSQL'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'postgresql' }),
    );
  });
});
