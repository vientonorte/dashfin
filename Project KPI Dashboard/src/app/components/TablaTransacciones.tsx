// ============================================================================
// TABLA DE TRANSACCIONES — Visualización y edición manual de transacciones.
// ============================================================================

import { useState, useMemo } from 'react';
import {
  Pencil, Trash2, Undo2, Save, X, ChevronUp, ChevronDown, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './ui/select';
import { useTransactions } from '../contexts/TransactionContext';
import { CATEGORIES } from '../types/transactions';
import type { Transaction, Category } from '../types/transactions';

type SortField = 'date' | 'amount' | 'description' | 'category';
type SortDir = 'asc' | 'desc';

function formatCLP(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

export function TablaTransacciones() {
  const { transactions, batches, updateTransaction, deleteTransaction, undoBatch } = useTransactions();
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Transaction>>({});
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions
      .filter(t =>
        !q ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q) ||
        t.date.includes(q)
      )
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') cmp = a.date.localeCompare(b.date);
        else if (sortField === 'amount') cmp = a.amount - b.amount;
        else if (sortField === 'description') cmp = a.description.localeCompare(b.description);
        else if (sortField === 'category') cmp = a.category.localeCompare(b.category);
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [transactions, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  }

  function startEdit(t: Transaction) {
    setEditId(t.id);
    setEditDraft({ date: t.date, description: t.description, amount: t.amount, category: t.category, notes: t.notes });
  }

  function cancelEdit() {
    setEditId(null);
    setEditDraft({});
  }

  function saveEdit(id: string) {
    updateTransaction(id, editDraft);
    setEditId(null);
    setEditDraft({});
    toast.success('Transacción actualizada');
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta transacción?')) return;
    deleteTransaction(id);
    toast.success('Transacción eliminada');
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle>
            Transacciones
            <Badge variant="secondary" className="ml-2 text-xs font-normal">
              {filtered.length} de {transactions.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-7 h-8 text-xs w-48"
              />
            </div>
          </div>
        </div>
        {/* Batch undo */}
        {batches.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {batches.slice(-3).reverse().map(b => (
              <Button
                key={b.id}
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1"
                onClick={() => { undoBatch(b.id); toast.success(`Lote "${b.fileName}" deshecho`); }}
              >
                <Undo2 className="h-3 w-3" />
                Deshacer: {b.fileName} ({b.count})
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No hay transacciones. Importa un estado de cuenta para comenzar.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium cursor-pointer whitespace-nowrap" onClick={() => toggleSort('date')}>
                      Fecha <SortIcon field="date" />
                    </th>
                    <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={() => toggleSort('description')}>
                      Descripción <SortIcon field="description" />
                    </th>
                    <th className="px-3 py-2 text-right font-medium cursor-pointer whitespace-nowrap" onClick={() => toggleSort('amount')}>
                      Monto <SortIcon field="amount" />
                    </th>
                    <th className="px-3 py-2 text-left font-medium cursor-pointer whitespace-nowrap" onClick={() => toggleSort('category')}>
                      Categoría <SortIcon field="category" />
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Notas</th>
                    <th className="px-3 py-2 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => (
                    <tr key={t.id} className="border-b hover:bg-muted/30 transition-colors">
                      {editId === t.id ? (
                        <>
                          <td className="px-2 py-1">
                            <Input
                              type="date"
                              value={editDraft.date ?? t.date}
                              onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))}
                              className="h-6 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <Input
                              value={editDraft.description ?? t.description}
                              onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                              className="h-6 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <Input
                              type="number"
                              value={editDraft.amount ?? t.amount}
                              onChange={e => setEditDraft(d => ({ ...d, amount: parseFloat(e.target.value) || 0 }))}
                              className="h-6 text-xs text-right"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <Select
                              value={editDraft.category ?? t.category}
                              onValueChange={v => setEditDraft(d => ({ ...d, category: v as Category }))}
                            >
                              <SelectTrigger className="h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(c => (
                                  <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-1">
                            <Input
                              value={editDraft.notes ?? t.notes}
                              onChange={e => setEditDraft(d => ({ ...d, notes: e.target.value }))}
                              placeholder="Notas…"
                              className="h-6 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => saveEdit(t.id)}>
                                <Save className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{t.date}</td>
                          <td className="px-3 py-2 max-w-xs truncate" title={t.description}>{t.description}</td>
                          <td className={`px-3 py-2 text-right font-medium whitespace-nowrap ${t.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {formatCLP(t.amount)}
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-xs font-normal">{t.category}</Badge>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground max-w-xs truncate">{t.notes}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(t)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDelete(t.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-6 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                  <Button variant="outline" size="sm" className="h-6 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
