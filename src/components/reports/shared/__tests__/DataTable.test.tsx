import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataTable } from '../DataTable';
import type { ColumnDef } from '@/types/reports';

// Mock data
const mockData = [
  { id: 1, name: 'John Doe', age: 30, city: 'New York' },
  { id: 2, name: 'Jane Smith', age: 25, city: 'Los Angeles' },
  { id: 3, name: 'Bob Johnson', age: 35, city: 'Chicago' },
];

const mockColumns: ColumnDef<typeof mockData[0]>[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true },
  { key: 'city', title: 'City', sortable: false },
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<DataTable data={[]} columns={mockColumns} loading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} columns={mockColumns} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles sorting', () => {
    const mockOnSortingChange = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        onSortingChange={mockOnSortingChange}
      />
    );
    
    fireEvent.click(screen.getByText('Name'));
    
    expect(mockOnSortingChange).toHaveBeenCalledWith({
      field: 'name',
      direction: 'asc'
    });
  });

  it('handles search filtering', () => {
    const mockOnFilteringChange = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        onFilteringChange={mockOnFilteringChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    expect(mockOnFilteringChange).toHaveBeenCalledWith({
      searchTerm: 'John'
    });
  });

  it('handles pagination', () => {
    const mockOnPaginationChange = jest.fn();
    const pagination = {
      page: 1,
      pageSize: 2,
      total: 3,
    };
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        pagination={pagination}
        onPaginationChange={mockOnPaginationChange}
      />
    );
    
    // Click on page 2 button
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);
    
    expect(mockOnPaginationChange).toHaveBeenCalledWith({
      ...pagination,
      page: 2
    });
  });

  it('handles row clicks', () => {
    const mockOnRowClick = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        onRowClick={mockOnRowClick}
      />
    );
    
    fireEvent.click(screen.getByText('John Doe').closest('tr')!);
    
    expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
  });
});