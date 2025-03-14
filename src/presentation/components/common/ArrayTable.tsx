import React from 'react';

interface ArrayTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
  }[];
  emptyMessage?: string;
  title?: string;
}

export function ArrayTable<T>({ 
  data, 
  columns, 
  title,
  emptyMessage 
}: ArrayTableProps<T>) {
  if (!data?.length) {
    return (
      <div className="flex items-center gap-2">
        {title && (
          <>
            <span className="text-base font-bold text-muted-foreground whitespace-nowrap">
              {title}:
            </span>
            <span className="text-base font-medium text-muted-foreground">
              No hay registros
            </span>
          </>
        )}
        {!title && (
          <span className="text-base font-medium text-muted-foreground">
            {emptyMessage || "No hay registros"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <div className="text-base font-bold text-muted-foreground whitespace-nowrap">
          {title}:
        </div>
      )}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {columns.map((column, index) => (
                  <th key={index} className="h-9 px-3 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-b-0 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-2 align-middle">
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
    </div>
  );
} 