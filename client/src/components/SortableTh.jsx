import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export const SortableTh = ({ label, sortKey, sort, onSort, className = '' }) => {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th
      className={className}
      aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 uppercase tracking-wider font-bold hover:text-ink transition"
      >
        <span>{label}</span>
        <Icon className={`w-3 h-3 ${active ? 'text-venice-blue' : 'opacity-40'}`} />
      </button>
    </th>
  );
};

export default SortableTh;