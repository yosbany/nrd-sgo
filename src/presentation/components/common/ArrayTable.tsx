import React from 'react';

interface ArrayTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
  }[];
  emptyMessage?: string;
}

export function ArrayTable<T>({ data, columns, emptyMessage = 'No hay datos' }: ArrayTableProps<T>) {
  if (!data?.length) return <div className="text-muted-foreground">{emptyMessage}</div>;

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {columns.map((column, index) => (
                <th key={index} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr key={rowIndex} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-4 align-middle">
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : <div className="font-medium">{String(item[column.accessor])}</div>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 