import * as XLSX from 'xlsx';

export function downloadExcel(filename: string, headers: string[], rows: any[][]): void {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
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

/** CSV columns — category & brand are chosen in the import modal, not in the file */
export const PRODUCT_IMPORT_HEADERS = [
  'name',
  'slug',
  'description',
  'price',
  'salePrice',
  'imageUrls',
  'image1',
  'image2',
  'image3',
  'image4',
  'image5',
  'image6',
  'image7',
  'image8',
  'image9',
  'image10',
  'tags',
  'isActive',
  'sortOrder',
  'avgRating',
  'reviewCount'
];

export const PRODUCT_IMPORT_DEMO_ROWS: string[][] = [
  [
    'Velvet Footstool',
    'velvet-footstool',
    'Soft velvet footstool with solid wooden legs. Perfect for living room or bedroom.',
    '58.00',
    '49.99',
    'https://example.com/footstool-main.jpg|https://example.com/footstool-side.jpg|https://example.com/footstool-detail.jpg',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Home|New',
    'true',
    '1',
    '4.7',
    '86'
  ],
  [
    'Lipsy Gold Clutch Bag',
    'lipsy-gold-clutch-bag',
    'Elegant gold weave grab handle clutch — ideal for evenings and special occasions.',
    '38.00',
    '',
    'https://example.com/clutch-front.jpg',
    'https://example.com/clutch-back.jpg',
    'https://example.com/clutch-inside.jpg',
    'https://example.com/clutch-model.jpg',
    '',
    '',
    '',
    '',
    '',
    '',
    'Accessories|Party',
    'true',
    '2',
    '4.5',
    '142'
  ],
  [
    'Classic Cotton Tee',
    'classic-cotton-tee',
    'Everyday cotton t-shirt. Breathable fabric with a relaxed fit.',
    '24.99',
    '19.99',
    '',
    'https://example.com/tee-white.jpg',
    'https://example.com/tee-navy.jpg',
    'https://example.com/tee-grey.jpg',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Summer|Basics',
    'true',
    '3',
    '0',
    '0'
  ]
];

export const PRODUCT_IMPORT_IMAGE_HELP = [
  'Images — use ANY of these methods (they combine):',
  '1) imageUrls column: separate URLs with | (pipe) — unlimited images in one cell',
  '2) image1, image2 … image10 columns: one URL per column',
  '3) Mix both — all URLs are merged in order, duplicates removed',
  'First image becomes the main product thumbnail.'
].join('\n');

export function cell(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/** Merge imageUrls (pipe-separated) + image1…image10 + image11…image20 */
export function parseProductImportImages(row: Record<string, string>): string[] {
  const urls: string[] = [];
  const pipeField = cell(row, 'imageUrls', 'ImageUrls', 'images', 'Images');
  if (pipeField) {
    urls.push(...pipeField.split('|').map(s => s.trim()).filter(Boolean));
  }
  for (let i = 1; i <= 20; i++) {
    const val = cell(row, `image${i}`, `Image${i}`);
    if (val) urls.push(val);
  }
  return [...new Set(urls)];
}

export function parseProductImportRow(row: Record<string, string>, categoryId: number | null, brandId: number | null) {
  const tagsRaw = cell(row, 'tags', 'Tags');
  const tags = tagsRaw ? tagsRaw.split('|').map(s => s.trim()).filter(Boolean) : [];
  const isActiveRaw = cell(row, 'isActive', 'IsActive') || 'true';
  const isActive = !(isActiveRaw === 'false' || isActiveRaw === '0' || isActiveRaw.toLowerCase() === 'no');

  return {
    name: cell(row, 'name', 'Name'),
    slug: cell(row, 'slug', 'Slug'),
    description: cell(row, 'description', 'Description'),
    price: parseFloat(cell(row, 'price', 'Price')) || 0,
    salePrice: (() => {
      const v = cell(row, 'salePrice', 'SalePrice', 'sale_price');
      return v ? parseFloat(v) : null;
    })(),
    categoryId,
    brandId,
    images: parseProductImportImages(row),
    tags,
    isActive,
    sortOrder: parseInt(cell(row, 'sortOrder', 'SortOrder') || '0', 10) || 0,
    avgRating: parseFloat(cell(row, 'avgRating', 'AvgRating', 'rating') || '0') || 0,
    reviewCount: parseInt(cell(row, 'reviewCount', 'ReviewCount', 'reviews') || '0', 10) || 0
  };
}
