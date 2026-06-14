import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductsService } from '../products.service';
import { CategoriesService } from '../../categories/categories.service';
import { BrandsService } from '../../brands/brands.service';
import { SharedService } from '../../../shared/services/shared.service';
import {
  downloadCsv,
  downloadExcel,
  parseSpreadsheetFile,
  parseProductImportRow,
  PRODUCT_IMPORT_DEMO_ROWS,
  PRODUCT_IMPORT_HEADERS
} from '../../../shared/utils/excel.util';

export interface ImportPreviewRow {
  rowNum: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  imageCount: number;
  tags: string[];
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  valid: boolean;
  errors: string[];
  payload: any;
}

type ImportStep = 'setup' | 'preview' | 'importing' | 'done';

@Component({
  selector: 'app-products-bulk-import',
  standalone: false,
  templateUrl: './products-bulk-import.component.html',
  styleUrl: './products-bulk-import.component.scss'
})
export class ProductsBulkImportComponent implements OnInit {

  step: ImportStep = 'setup';
  selectedFile: File | null = null;
  isParsing = false;
  isImporting = false;
  parseError = '';
  showHelp = false;

  previewRows: ImportPreviewRow[] = [];
  importResult: any = null;

  categoryId: number | null = null;
  brandId: number | null = null;
  allCategories: any[] = [];
  allBrands: any[] = [];
  metaLoading = true;

  constructor(
    public activeModal: NgbActiveModal,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private brandsService: BrandsService,
    public sharedservice: SharedService
  ) {}

  ngOnInit(): void {
    this.categoriesService.getAll().subscribe({
      next: (res: any) => { this.allCategories = res.data || []; this.metaLoading = false; },
      error: () => { this.metaLoading = false; }
    });
    this.brandsService.getAll().subscribe((res: any) => { this.allBrands = res.data || []; });
  }

  get selectedCategoryName(): string {
    return this.allCategories.find(c => c.id === this.categoryId)?.name || '';
  }

  get selectedBrandName(): string {
    const b = this.allBrands.find(x => x.id === this.brandId);
    return b ? b.name : '';
  }

  get previewStats() {
    const total = this.previewRows.length;
    const valid = this.previewRows.filter(r => r.valid).length;
    const invalid = total - valid;
    const images = this.previewRows.reduce((s, r) => s + r.imageCount, 0);
    return { total, valid, invalid, images };
  }

  get canReview(): boolean {
    return !!this.categoryId && !!this.selectedFile && !this.isParsing;
  }

  get canConfirmImport(): boolean {
    return this.step === 'preview' && this.previewStats.valid > 0 && this.previewStats.invalid === 0 && !this.isImporting;
  }

  get stepIndex(): number {
    if (this.step === 'setup') return 0;
    if (this.step === 'preview') return 1;
    return 2;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
    this.parseError = '';
    this.importResult = null;
    this.previewRows = [];
    if (this.step !== 'setup') this.step = 'setup';
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      this.parseError = 'Only CSV or Excel files are allowed';
      return;
    }
    this.selectedFile = file;
    this.parseError = '';
    this.importResult = null;
    this.previewRows = [];
    this.step = 'setup';
  }

  preventDrop(event: DragEvent) {
    event.preventDefault();
  }

  downloadDemoCsv() {
    downloadCsv('shelgo-products-demo.csv', PRODUCT_IMPORT_HEADERS, PRODUCT_IMPORT_DEMO_ROWS);
  }

  downloadDemoExcel() {
    downloadExcel('shelgo-products-demo.xlsx', PRODUCT_IMPORT_HEADERS, PRODUCT_IMPORT_DEMO_ROWS);
  }

  private validateRow(product: any, rowNum: number): ImportPreviewRow {
    const errors: string[] = [];
    if (!product.name?.trim()) errors.push('Name is required');
    if (!product.price || product.price <= 0) errors.push('Price must be > 0');
    if (product.salePrice != null && product.salePrice >= product.price) {
      errors.push('Sale price must be less than price');
    }
    if (product.avgRating < 0 || product.avgRating > 5) errors.push('Rating must be 0–5');
    if (product.reviewCount < 0) errors.push('Review count cannot be negative');

    return {
      rowNum,
      name: product.name || '(empty)',
      slug: product.slug || '—',
      price: product.price || 0,
      salePrice: product.salePrice,
      imageCount: product.images?.length || 0,
      tags: product.tags || [],
      isActive: product.isActive !== false,
      avgRating: product.avgRating || 0,
      reviewCount: product.reviewCount || 0,
      valid: errors.length === 0,
      errors,
      payload: product
    };
  }

  async goToPreview() {
    if (!this.categoryId) {
      this.sharedservice.showAlert(2, 'Please select a category first.');
      return;
    }
    if (!this.selectedFile) {
      this.sharedservice.showAlert(2, 'Please upload a CSV or Excel file.');
      return;
    }

    this.isParsing = true;
    this.parseError = '';
    this.previewRows = [];

    try {
      const rawRows = await parseSpreadsheetFile(this.selectedFile);
      if (!rawRows.length) {
        this.parseError = 'File is empty or has no data rows.';
        this.isParsing = false;
        return;
      }

      this.previewRows = rawRows.map((row, i) => {
        const product = parseProductImportRow(row, this.categoryId, this.brandId);
        return this.validateRow(product, i + 1);
      }).filter(r => r.name !== '(empty)' || r.errors.length);

      if (!this.previewRows.length) {
        this.parseError = 'No product rows found. Each row needs at least a name.';
        this.isParsing = false;
        return;
      }

      this.step = 'preview';
    } catch {
      this.parseError = 'Could not read file. Use the demo CSV format.';
    }
    this.isParsing = false;
  }

  backToSetup() {
    this.step = 'setup';
    this.importResult = null;
  }

  confirmImport() {
    if (!this.canConfirmImport) return;

    const products = this.previewRows.filter(r => r.valid).map(r => r.payload);
    this.isImporting = true;
    this.step = 'importing';

    this.productsService.bulkImport(products).subscribe({
      next: (res: any) => {
        this.importResult = res;
        this.isImporting = false;
        this.step = 'done';
      },
      error: (err) => {
        this.isImporting = false;
        this.step = 'preview';
        this.sharedservice.showAlert(2, err?.error?.error || 'Bulk import failed');
      }
    });
  }

  importAnother() {
    this.step = 'setup';
    this.selectedFile = null;
    this.previewRows = [];
    this.importResult = null;
    this.parseError = '';
  }

  close(refresh = false) {
    this.activeModal.close(refresh || this.importResult?.totalCreated > 0);
  }
}
