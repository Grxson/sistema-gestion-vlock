import React, { useState } from 'react';
import IngresosHeader from '../components/ingresos/IngresosHeader';
import IngresosFilters from '../components/ingresos/IngresosFilters';
import IngresosTable from '../components/ingresos/IngresosTable';
import IngresoModal from '../components/ingresos/IngresoModal';
import IngresosStatsCards from '../components/ingresos/IngresosStatsCards';
import Pagination from '../components/ui/Pagination';
import ConfirmModal from '../components/ui/ConfirmModal';
import useIngresosData from '../hooks/ingresos/useIngresosData';

export default function Ingresos() {
  const { ingresos, loading, error, proyectos, filters, setFilters, reload, createIngreso, updateIngreso, deleteIngreso, page, setPage, limit, setLimit, total, stats } = useIngresosData();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  return (
    <div className="space-y-6">
      <IngresosHeader onNew={() => { setEditing(null); setShowModal(true); }} onRefresh={reload} />

      {/* Stats */}
      <div className="bg-white dark:bg-dark-100 shadow sm:rounded-md p-4">
        <IngresosStatsCards stats={stats} />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-100 shadow sm:rounded-md p-4">
        <IngresosFilters
          filters={filters}
          proyectos={proyectos}
          onChange={setFilters}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-100 shadow sm:rounded-md">
        <IngresosTable
          data={ingresos}
          loading={loading}
          error={error}
          onEdit={(row) => { setEditing(row); setShowModal(true); }}
          onDelete={(row) => { setRowToDelete(row); setConfirmOpen(true); }}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil((total || 0) / (limit || 10)))}
        itemsPerPage={limit}
        totalItems={total || 0}
        onPageChange={(p) => setPage(p)}
        onItemsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        showItemsPerPage={true}
        forceShow={true}
      />

      {showModal && (
        <IngresoModal
          open={showModal}
          onClose={() => setShowModal(false)}
          proyectos={proyectos}
          initialData={editing}
          onSubmit={async (payload) => {
            if (editing) {
              await updateIngreso(editing.id_ingreso, payload);
            } else {
              await createIngreso(payload);
            }
            setShowModal(false);
          }}
        />
      )}

      {/* Confirm deletion */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setRowToDelete(null); }}
        onConfirm={async () => {
          if (rowToDelete) {
            await deleteIngreso(rowToDelete.id_ingreso);
          }
          setConfirmOpen(false);
          setRowToDelete(null);
        }}
        title="Eliminar ingreso"
        message={rowToDelete ? `¿Seguro que deseas eliminar el ingreso de ${new Date(rowToDelete.fecha).toLocaleDateString('es-ES')} por ${Number(rowToDelete.monto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}?` : ''}
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
}
