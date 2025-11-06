// Utilidad central para calcular el total monetario de un suministro
// Regla: preferir costo_total si viene desde BD; si no, usar cantidad * precio_unitario
export const computeGastoFromItem = (item) => {
  const costo = parseFloat(item?.costo_total);
  if (!isNaN(costo) && costo > 0) {
    return Math.round(costo * 100) / 100;
  }
  const cantidad = parseFloat(item?.cantidad) || 0;
  const precio = parseFloat(item?.precio_unitario) || 0;
  return Math.round((cantidad * precio) * 100) / 100;
};

export default computeGastoFromItem;
