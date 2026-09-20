import { cn } from '@/shared/lib/utils';

interface ParameterTableProps {
  headers?: string[];
  rows?: string[][];
  description?: string;
}

export function ParameterTable({
  headers,
  rows,
  description,
}: ParameterTableProps) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="space-y-2">
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="overflow-x-auto rounded-lg border border-border bg-card/40">
        <table className="w-full text-left text-xs border-collapse">
          {headers && headers.length > 0 && (
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-mono">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-3.5 py-2.5 font-medium tracking-wider uppercase text-[10px]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-border/50">
            {rows.map((row) => (
              <tr key={row[0]} className="hover:bg-secondary/30 transition-colors">
                {row.map((cell, cIdx) => {
                  const headerName = headers?.[cIdx] || cell;
                  return (
                    <td
                      key={`${row[0]}-${headerName}`}
                      className={cn(
                        'px-3.5 py-2 text-foreground/90',
                        cIdx === 0 && 'font-mono text-primary font-medium',
                        cIdx === 2 && 'font-mono text-muted-foreground',
                      )}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
