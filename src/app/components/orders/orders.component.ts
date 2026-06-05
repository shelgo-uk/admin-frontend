import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../shared/services/shared.service';
import { urlConstant } from '../../shared/constant/urlConst';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-orders',
    standalone: false,
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

    orders: any[] = [];
    isLoading = false;
    isTechnicalIssue = false;
    totalOrders = 0;
    currentPage = 1;
    pageSize = 20;

    // Filters
    filterStatus = '';
    filterSearch = '';
    filterDateFrom = '';
    filterDateTo = '';

    selectedOrder: any = null;

    statusOptions = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    constructor(
        public sharedService: SharedService,
        private http: HttpClient,
        private modalService: NgbModal
    ) {}

    ngOnInit(): void { this.loadOrders(); }

    loadOrders(): void {
        this.isLoading = true;
        this.isTechnicalIssue = false;
        let url = `${urlConstant.OrderAPI.getAllOrders}?page=${this.currentPage}&limit=${this.pageSize}`;
        if (this.filterStatus)   url += `&status=${this.filterStatus}`;
        if (this.filterSearch)   url += `&search=${encodeURIComponent(this.filterSearch)}`;
        if (this.filterDateFrom) url += `&dateFrom=${this.filterDateFrom}`;
        if (this.filterDateTo)   url += `&dateTo=${this.filterDateTo}`;

        this.http.get<any>(url).subscribe(
            res => {
                this.orders = res.orders || [];
                this.totalOrders = res.total || 0;
                this.isLoading = false;
            },
            () => { this.isLoading = false; this.isTechnicalIssue = true; }
        );
    }

    filterData() { this.currentPage = 1; this.loadOrders(); }

    clearFilters() {
        this.filterStatus = '';
        this.filterSearch = '';
        this.filterDateFrom = '';
        this.filterDateTo = '';
        this.currentPage = 1;
        this.loadOrders();
    }

    get hasActiveFilters(): boolean {
        return !!(this.filterStatus || this.filterSearch || this.filterDateFrom || this.filterDateTo);
    }

    onPageChange(page: number): void { this.currentPage = page; this.loadOrders(); }

    viewOrder(order: any, content: any): void {
        this.selectedOrder = { ...order };
        this.selectedOrder._items   = this.parseJSON(order.items, []);
        this.selectedOrder._address = this.parseJSON(order.deliveryAddress, {});
        this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
    }

    updateStatus(order: any, status: string): void {
        this.http.put<any>(`${urlConstant.OrderAPI.updateStatus}${order.id}`, { status }).subscribe(
            res => {
                order.status = res.data?.status || status;
                this.sharedService.showAlert(1, 'Status updated');
            },
            () => this.sharedService.showAlert(2, 'Failed to update status')
        );
    }

    exportCSV(): void {
        const headers = ['Order #', 'Customer', 'Email', 'Date', 'Items', 'Subtotal', 'Delivery', 'Total', 'Status', 'Payment'];
        const rows = this.orders.map(o => [
            o.orderNumber,
            `${o.firstName || ''} ${o.lastName || ''}`.trim(),
            o.email || '',
            new Date(o.created_at).toLocaleDateString(),
            this.parseJSON(o.items, []).length,
            o.subtotal,
            o.deliveryCharge,
            o.total,
            o.status,
            o.paymentMethod || ''
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    parseJSON(val: any, fallback: any): any {
        try { return typeof val === 'string' ? JSON.parse(val) : (val || fallback); }
        catch { return fallback; }
    }

    getStatusClass(status: string): string {
        const map: any = {
            pending: 'yellow', confirmed: 'blue',
            processing: 'blue', shipped: 'green',
            delivered: 'green', cancelled: 'red'
        };
        return map[status] || 'yellow';
    }

    get currency(): string { return this.sharedService.siteConfig?.currency || '£'; }

    getOptionEntries(options: any): { key: string; value: string }[] {
        return Object.entries(options || {}).map(([key, value]) => ({ key, value: value as string }));
    }
}
