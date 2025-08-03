import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAgentProperties } from '../../hooks/useAgentProperties';
import { supabase } from '../../lib/supabaseClient';

// Table of the agent's property listings with search, sorting and bulk actions
export default function Listings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: properties, isLoading, error } = useAgentProperties();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'price' | 'status' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!properties) return [];
    const result = properties.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()),
    );
    result.sort((a, b) => {
      let aVal: number | string | null = a[sortField];
      let bVal: number | string | null = b[sortField];
      if (sortField === 'created_at') {
        aVal = a.created_at ? new Date(a.created_at).getTime() : 0;
        bVal = b.created_at ? new Date(b.created_at).getTime() : 0;
      }
      if (aVal == null) return -1;
      if (bVal == null) return 1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [properties, search, sortField, sortOrder]);

  const toggleSort = (field: 'price' | 'status' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filtered.map((p) => p.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkAction = async (status: 'published' | 'draft') => {
    if (selectedIds.length === 0) return;
    await supabase.from('properties').update({ status }).in('id', selectedIds);
    setSelectedIds([]);
    queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 mr-2"
        />
        {selectedIds.length > 0 && (
          <div className="space-x-2">
            <button
              onClick={() => handleBulkAction('published')}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('draft')}
              className="bg-yellow-600 text-white px-3 py-1 rounded"
            >
              Unpublish
            </button>
          </div>
        )}
      </div>
      {isLoading && <p>Loading your properties…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {!isLoading && !error && (
        filtered.length > 0 ? (
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selectedIds.length === filtered.length
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="p-2 text-left">Title</th>
                <th
                  className="p-2 text-left cursor-pointer"
                  onClick={() => toggleSort('price')}
                >
                  Price{' '}
                  {sortField === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="p-2 text-left cursor-pointer"
                  onClick={() => toggleSort('status')}
                >
                  Status{' '}
                  {sortField === 'status'
                    ? sortOrder === 'asc'
                      ? '▲'
                      : '▼'
                    : ''}
                </th>
                <th
                  className="p-2 text-left cursor-pointer"
                  onClick={() => toggleSort('created_at')}
                >
                  Date created{' '}
                  {sortField === 'created_at'
                    ? sortOrder === 'asc'
                      ? '▲'
                      : '▼'
                    : ''}
                </th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="p-2">{p.title}</td>
                  <td className="p-2">
                    £{p.price.toLocaleString()}
                    {p.listing_type === 'rent' ? '/mo' : ''}
                  </td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : ''}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => navigate(`edit/${p.id}`)}
                      className="text-blue-600 underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You haven&apos;t listed any properties yet.</p>
        )
      )}
    </div>
  );
}

