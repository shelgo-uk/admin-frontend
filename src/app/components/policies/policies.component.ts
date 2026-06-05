import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../shared/services/shared.service';
import { urlConstant } from '../../shared/constant/urlConst';

const POLICY_SLUGS = [
    { slug: 'shipping-policy',     label: 'Shipping Policy' },
    { slug: 'return-refund-policy', label: 'Return & Refund Policy' },
    { slug: 'privacy-policy',      label: 'Privacy Policy' },
    { slug: 'terms-conditions',    label: 'Terms & Conditions' },
];

@Component({
    selector: 'app-policies',
    standalone: false,
    templateUrl: './policies.component.html',
    styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit {

    slugs = POLICY_SLUGS;
    selectedSlug: string = POLICY_SLUGS[0].slug;
    selectedLabel: string = POLICY_SLUGS[0].label;

    policy: any = {
        title: '',
        lastUpdated: '',
        sections: []
    };

    isLoading = false;
    isSaving = false;

    constructor(
        public sharedService: SharedService,
        private http: HttpClient
    ) {}

    ngOnInit(): void {
        this.loadPolicy(this.selectedSlug);
    }

    selectPolicy(item: { slug: string; label: string }): void {
        this.selectedSlug = item.slug;
        this.selectedLabel = item.label;
        this.loadPolicy(item.slug);
    }

    loadPolicy(slug: string): void {
        this.isLoading = true;
        this.http.get<any>(`${urlConstant.PolicyAPI.getBySlug}${slug}`).subscribe(
            res => {
                if (res.data) {
                    this.policy = {
                        title: res.data.title || '',
                        lastUpdated: res.data.lastUpdated || '',
                        sections: res.data.sections || []
                    };
                } else {
                    this.policy = { title: this.selectedLabel, lastUpdated: '', sections: [] };
                }
                this.isLoading = false;
            },
            () => {
                this.policy = { title: this.selectedLabel, lastUpdated: '', sections: [] };
                this.isLoading = false;
            }
        );
    }

    addSection(): void {
        this.policy.sections.push({ heading: '', content: '' });
    }

    removeSection(i: number): void {
        this.policy.sections.splice(i, 1);
    }

    moveSectionUp(i: number): void {
        if (i === 0) return;
        const tmp = this.policy.sections[i - 1];
        this.policy.sections[i - 1] = this.policy.sections[i];
        this.policy.sections[i] = tmp;
    }

    moveSectionDown(i: number): void {
        if (i >= this.policy.sections.length - 1) return;
        const tmp = this.policy.sections[i + 1];
        this.policy.sections[i + 1] = this.policy.sections[i];
        this.policy.sections[i] = tmp;
    }

    save(): void {
        this.isSaving = true;
        this.http.post<any>(`${urlConstant.PolicyAPI.save}${this.selectedSlug}`, this.policy).subscribe(
            () => {
                this.isSaving = false;
                this.sharedService.showAlert(1, 'Policy saved successfully');
            },
            () => {
                this.isSaving = false;
                this.sharedService.showAlert(2, 'Failed to save policy');
            }
        );
    }
}
