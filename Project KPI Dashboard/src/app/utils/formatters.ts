export const formatChileno = (num: number): string =>
  `$${Math.round(num).toLocaleString('es-CL')}`;

export const formatPorcentaje = (num: number, decimals = 1): string =>
  `${num.toFixed(decimals)}%`;

export const formatFecha = (fechaStr: string): string => {
  const [year, month] = fechaStr.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[parseInt(month) - 1]} ${year}`;
};

export const parsearNumeroChileno = (str: string): number => {
  return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
};
