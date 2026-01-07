// ============================================
// DATE FORMATTER UTILITIES
// ============================================

/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA)
 * Aceita strings em formato YYYY-MM-DD, MM/DD/YYYY ou objetos Date
 */
export const formatDateBR = (date: string | Date): string => {
  if (!date) return '';
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Verifica se está no formato YYYY-MM-DD (padrão do banco)
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    }
    // Verifica se está no formato MM/DD/YYYY (formato americano)
    else if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [month, day, year] = date.split('/').map(Number);
      dateObj = new Date(year, month - 1, day);
    }
    // Tenta criar diretamente
    else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }
  
  // Verifica se a data é válida
  if (isNaN(dateObj.getTime())) {
    return String(date);
  }
  
  // Formata para DD/MM/AAAA
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formata data e hora para o padrão brasileiro (DD/MM/AAAA às HH:MM)
 */
export const formatDateTimeBR = (date: string | Date): string => {
  if (!date) return '';
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return String(date);
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
};
