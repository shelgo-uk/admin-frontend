import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../shared/services/shared.service';
import { urlConstant } from '../../shared/constant/urlConst';

@Component({
    selector: 'app-contact-leads',
    standalone: false,
    templateUrl: './contact-leads.component.html',
    styleUrls: ['./contact-leads.component.scss']
})
export class ContactLeadsComponent implements OnInit {

    leads: any[] = [];
    total = 0;
    isLoading = false;

    page = 1;
    limit = 20;
    filterStatus = '';

    selectedLead: any = null;

    statusOptions = [
        { value: '',        label: 'All' },
        { value: 'new',     label: 'New' },
        { value: 'read',    label: 'Read' },
        { value: 'replied', label: 'Replied' },
        { value: 'closed',  label: 'Closed' },
    ];

    constructor(
        public sharedService: SharedService,
        private http: HttpClient
    ) {}

    ngOnInit(): void { this.load(); }

    load(): void {
        this.isLoading = true;
        const params: any = { page: this.page, limit: this.limit };
        if (this.filterStatus) params.status = this.filterStatus;
        this.http.get<any>(urlConstant.ContactAPI.getLeads, { params }).subscribe(
            res => {
                this.leads = res.data || [];
                this.total = res.total || 0;
                this.isLoading = false;
            },
            () => { this.isLoading = false; }
        );
    }

    applyFilter(status: string): void {
        this.filterStatus = status;
        this.page = 1;
        this.load();
    }

    viewLead(lead: any): void {
        this.selectedLead = lead;
        // Auto-mark as read
        if (lead.status === 'new') {
            this.updateStatus(lead, 'read', false);
        }
    }

    closeDetail(): void { this.selectedLead = null; }

    updateStatus(lead: any, status: string, reload = true): void {
        this.http.put(`${urlConstant.ContactAPI.updateStatus}${lead.id}/status`, { status }).subscribe(
            res => {
                lead.status = status;
                if (this.selectedLead?.id === lead.id) this.selectedLead.status = status;
                if (reload) this.load();
            }
        );
    }

    deleteLead(lead: any): void {
        if (!confirm(`Delete message from "${lead.name}"?`)) return;
        this.http.delete(`${urlConstant.ContactAPI.delete}${lead.id}`).subscribe(
            () => {
                if (this.selectedLead?.id === lead.id) this.selectedLead = null;
                this.load();
                this.sharedService.showAlert(1, 'Lead deleted');
            },
            () => this.sharedService.showAlert(2, 'Failed to delete')
        );
    }

    get totalPages(): number { return Math.ceil(this.total / this.limit); }

    prevPage(): void { if (this.page > 1) { this.page--; this.load(); } }
    nextPage(): void { if (this.page < this.totalPages) { this.page++; this.load(); } }

    getStatusClass(status: string): string {
        const map: any = { new: 'badge-new', read: 'badge-read', replied: 'badge-replied', closed: 'badge-closed' };
        return map[status] || 'badge-new';
    }

    get newCount(): number { return this.leads.filter(l => l.status === 'new').length; }
}
