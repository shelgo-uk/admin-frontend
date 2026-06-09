import * as XLSX from 'xlsx';

export function downloadExcel(filename: string, headers: string[], rows: any[][]): void {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function downloadCsv(filename: string, headers: string[], rows: any[][]): void {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseSpreadsheetFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export const PRODUCT_IMPORT_HEADERS = [
  'name', 'slug', 'description', 'price', 'salePrice',
  'categoryName', 'brandName', 'imageUrls', 'tags', 'isActive', 'sortOrder'
];

export const PRODUCT_IMPORT_DEMO_ROW = [
  'Shelgo Cotton T-Shirt',
  'shelgo-cotton-t-shirt',
  'Soft cotton everyday tee',
  '29.99',
  '24.99',
  'Clothing',
  'Shelgo',
  'https://example.com/image1.jpg|https://example.com/image2.jpg',
  'Summer|New',
  'true',
  '0'
];
