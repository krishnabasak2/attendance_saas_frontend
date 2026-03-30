interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, pages, total, limit, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
      <span>
        Showing {from}–{to} of {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md px-3 py-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Prev
        </button>

        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .reduce<(number | '…')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="px-2">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`min-w-8 rounded-md px-3 py-1.5 font-medium
                  ${p === page ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}
              >
                {p}
              </button>
            )
          )}

        <button
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md px-3 py-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
