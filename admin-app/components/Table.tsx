'use client';

import { ReactNode } from 'react';

type Column<T> = {
  header: string;
  render: (item: T, index: number) => ReactNode;
};

type TableProps<T> = {
  caption: string;
  columns: Column<T>[];
  data: T[];
  empty: ReactNode;
};

export function Table<T>({ caption, columns, data, empty }: TableProps<T>) {
  return (
    <table className="table-card">
      <caption style={{ captionSide: 'top', textAlign: 'left', padding: '1rem', fontWeight: 600 }}>
        {caption}
      </caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ padding: '1.5rem' }}>
              {empty}
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.header}>{column.render(item, index)}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
