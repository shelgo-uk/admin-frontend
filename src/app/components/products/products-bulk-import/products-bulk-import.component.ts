import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductsService } from '../products.service';
import { SharedService } from '../../../shared/services/shared.service';
import {
  downloadCsv,
  downloadExcel,
  parseSpreadsheetFile,
  PRODUCT_IMPORT_DEMO_ROW,
  PRODUCT_IMPORT_HEADERS
} from '../../../shared/utils/excel.util';

@Component({
  selector: 'app-products-bulk-import',
  standalone: false,
  templateUrl: './products-bulk-import.component.html',
  styleUrl: './products-bulk-import.component.scss'
})
export class ProductsBulkImportComponent {

  selectedFile: File | null = null;
  isImporting = false;
  importResult: any = null;
  parseError = '';

  constructor(
    public activeModal: NgbActiveModal,
    private productsService: ProductsService,
    public sharedservice: SharedService
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
    this.importResult = null;
    this.parseError = '';
  }

  downloadDemoCsv() {
    downloadCsv('shelgo-products-demo.csv', PRODUCT_IMPORT_HEADERS, [PRODUCT_IMPORT_DEMO_ROW]);
  }

  downloadDemoExcel() {
    downloadExcel('shelgo-products-demo.xlsx', PRODUCT_IMPORT_HEADERS, [PRODUCT_IMPORT_DEMO_ROW]);
  }

  async importFile() {
    if (!this.selectedFile) {
      this.sharedservice.showAlert(2, 'Please select a CSV or Excel file');
      return;
    }

    this.isImporting = true;
    this.parseError = '';
    this.importResult = null;

    try {
      const rows = await parseSpreadsheetFile(this.selectedFile);
      if (!rows.length) {
        this.parseError = 'File is empty or has no data rows';
        this.isImporting = false;
        return;
      }

      const products = rows.map(row => ({
        name: row['name'] || row['Name'] || '',
        slug: row['slug'] || row['Slug'] || '',
        description: row['description'] || row['Description'] || '',
        price: row['price'] || row['Price'] || 0,
        salePrice: row['salePrice'] || row['SalePrice'] || row['sale_price'] || '',
        categoryName: row['categoryName'] || row['CategoryName'] || row['category'] || '',
        brandName: row['brandName'] || row['BrandName'] || row['brand'] || '',
        imageUrls: row['imageUrls'] || row['ImageUrls'] || row['images'] || '',
        tags: row['tags'] || row['Tags'] || '',
        isActive: row['isActive'] ?? row['IsActive'] ?? 'true',
        sortOrder: row['sortOrder'] || row['SortOrder'] || 0
      }));

      this.productsService.bulkImport(products).subscribe(
        (res: any) => {
          this.importResult = res;
          this.isImporting = false;
          this.sharedservice.showAlert(1, `${res.totalCreated || 0} product(s) imported successfully`);
        },
        () => {
          this.isImporting = false;
          this.sharedservice.showAlert(2, 'Bulk import failed');
        }
      );
    } catch {
      this.parseError = 'Could not read file. Use demo CSV/Excel format.';
      this.isImporting = false;
    }
  }

  close(refresh = false) {
    this.activeModal.close(refresh);
  }
}
