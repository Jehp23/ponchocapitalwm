import { cn } from "@/lib/utils";

export type DataColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string | number }>({
  columns,
  data
}: Readonly<{
  columns: DataColumn<T>[];
  data: T[];
}>) {
  return (
    <div className="isolate overflow-hidden rounded-[26px] border border-[#1f4d3a]/10 bg-white/70">
      <table className="w-full table-auto border-separate border-spacing-0 text-left">
        <thead className="bg-[linear-gradient(180deg,rgba(31,77,58,0.05),rgba(31,77,58,0.02))]">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-4 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#7c8e85] sm:px-5">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-10 text-center text-[14px] text-[#7d8f85] sm:px-5" colSpan={columns.length}>
                Todavia no hay registros para mostrar.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="bg-white/72 transition hover:bg-[#fcfbf7]">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      "border-t border-[#1f4d3a]/8 px-4 py-4 align-top text-[14px] leading-6 whitespace-normal break-words text-[#183328] sm:px-5",
                      column.className
                    )}
                  >
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
