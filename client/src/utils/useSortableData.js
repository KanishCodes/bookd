import { useMemo, useState } from 'react';

export const sortItems = (items, key, direction = 'asc') => {
  if (!key) return items;
  const dir = direction === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return (
      String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' }) * dir
    );
  });
};

export const useSortableData = (items, initial = { key: null, direction: 'asc' }) => {
  const [sort, setSort] = useState(initial);

  const sortedItems = useMemo(
    () => sortItems(items, sort.key, sort.direction),
    [items, sort]
  );

  const requestSort = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return { sortedItems, sort, requestSort };
};