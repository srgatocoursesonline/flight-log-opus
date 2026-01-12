import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ColumnDef,
  PaginationConfig,
  SortingConfig,
  FilteringConfig,
} from '@/types/reports';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onPaginationChange?: (pagination: PaginationConfig) => void;
  onSortingChange?: (sorting: SortingConfig) => void;
  onFilteringChange?: (filtering: FilteringConfig) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pagination,
  sorting,
  filtering,
  loading = false,
  onRowClick,
  onPaginationChange,
  onSortingChange,
  onFilteringChange,
  className,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [localSearchTerm, setLocalSearchTerm] = useState(filtering?.searchTerm || '');

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!filtering?.searchTerm) return data;
    
    const searchTerm = filtering.searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((column) => {
        const value = column.dataIndex ? row[column.dataIndex] : row[column.key];
        return String(value || '').toLowerCase().includes(searchTerm);
      })
    );
  }, [data, filtering?.searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sorting) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sorting.field];
      const bValue = b[sorting.field];

      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sorting.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sorting]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  const handleSort = (field: string) => {
    if (!onSortingChange) return;

    const newDirection = 
      sorting?.field === field && sorting?.direction === 'asc' ? 'desc' : 'asc';
    
    onSortingChange({ field, direction: newDirection });
  };

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    onFilteringChange?.({ ...filtering, searchTerm: value });
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination || !onPaginationChange) return;
    
    onPaginationChange({ ...pagination, page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (!pagination || !onPaginationChange) return;
    
    onPaginationChange({ ...pagination, pageSize: newPageSize, page: 1 });
  };

  const getSortIcon = (field: string) => {
    if (sorting?.field !== field) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sorting.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const currentPage = pagination?.page || 1;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      {onFilteringChange && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={localSearchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    column.className,
                    column.sortable && onSortingChange && 'cursor-pointer select-none',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.title}</span>
                    {column.sortable && onSortingChange && getSortIcon(String(column.key))}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const value = column.dataIndex ? row[column.dataIndex] : row[column.key];
                    const cellContent = column.render ? column.render(value, row, index) : value;
                    
                    return (
                      <TableCell
                        key={String(column.key)}
                        className={cn(
                          column.className,
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && onPaginationChange && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              Showing {Math.min((currentPage - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
              {Math.min(currentPage * pagination.pageSize, pagination.total)} of {pagination.total} entries
            </span>
            {pagination.showSizeChanger && (
              <div className="flex items-center space-x-2 ml-4">
                <span>Show</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>entries</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}