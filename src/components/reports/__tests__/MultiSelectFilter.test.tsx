import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MultiSelectFilter, MultiSelectOption } from '../shared/MultiSelectFilter';

const mockOptions: MultiSelectOption[] = [
  { value: 'option1', label: 'Option 1', description: 'First option' },
  { value: 'option2', label: 'Option 2', description: 'Second option' },
  { value: 'option3', label: 'Option 3', description: 'Third option' }
];

describe('MultiSelectFilter', () => {
  const mockOnSelectionChange = jest.fn();

  beforeEach(() => {
    mockOnSelectionChange.mockClear();
  });

  it('should render with placeholder when no items selected', () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={[]}
        onSelectionChange={mockOnSelectionChange}
        placeholder="Select items..."
      />
    );

    expect(screen.getByText('Select items...')).toBeInTheDocument();
  });

  it('should display selected items count when multiple items selected', () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={['option1', 'option2', 'option3']}
        onSelectionChange={mockOnSelectionChange}
        maxDisplayItems={2}
      />
    );

    expect(screen.getByText('3 selecionados')).toBeInTheDocument();
  });

  it('should display individual labels when few items selected', () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={['option1', 'option2']}
        onSelectionChange={mockOnSelectionChange}
        maxDisplayItems={3}
      />
    );

    expect(screen.getByText('Option 1, Option 2')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', async () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  it('should call onSelectionChange when option is selected', async () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    await waitFor(() => {
      const option1 = screen.getByText('Option 1');
      fireEvent.click(option1);
    });

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['option1']);
  });

  it('should show search input when searchable is true', async () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={[]}
        onSelectionChange={mockOnSelectionChange}
        searchable={true}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });
  });

  it('should filter options based on search term', async () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={[]}
        onSelectionChange={mockOnSelectionChange}
        searchable={true}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'Option 1' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });
  });

  it('should display title when provided', () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={[]}
        onSelectionChange={mockOnSelectionChange}
        title="Test Filter"
      />
    );

    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('should show clear all button when items are selected and title is provided', () => {
    render(
      <MultiSelectFilter
        options={mockOptions}
        selectedValues={['option1']}
        onSelectionChange={mockOnSelectionChange}
        title="Test Filter"
      />
    );

    expect(screen.getByText('Limpar tudo')).toBeInTheDocument();
  });
});