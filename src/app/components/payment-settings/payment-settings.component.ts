import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../shared/services/shared.service';
import { urlConstant } from '../../shared/constant/urlConst';

@Component({
    selector: 'app-payment-settings',
    standalone: false,
    templateUrl: './payment-settings.component.html',
    styleUrls: ['./payment-settings.component.scss']
})
export class PaymentSettingsComponent implements OnInit {

    isLoading: boolean = false;
    isSaving: boolean = false;

    settings = {
        razorpayKeyId: '',
        razorpayKeySecret: '',
        isTestMode: true,
        isActive: true
    };

    constructor(
        public sharedService: SharedService,
        private http: HttpClient
    ) {}

    ngOnInit(): void {
        this.loadSettings();
    }

    loadSettings(): void {
        this.isLoading = true;
        this.http.get<any>(urlConstant.PaymentSettingsAPI.getAdmin).subscribe(
            res => {
                if (res.data) {
                    this.settings.razorpayKeyId    = res.data.razorpayKeyId || '';
                    this.settings.razorpayKeySecret = res.data.razorpayKeySecret || '';
                    this.settings.isTestMode        = !!res.data.isTestMode;
                    this.settings.isActive          = !!res.data.isActive;
                }
                this.isLoading = false;
            },
            () => { this.isLoading = false; }
        );
    }

    saveSettings(): void {
        if (!this.settings.razorpayKeyId.trim()) {
            this.sharedService.showAlert(2, 'Razorpay Key ID is required');
            return;
        }
        if (!this.settings.razorpayKeySecret.trim()) {
            this.sharedService.showAlert(2, 'Razorpay Key Secret is required');
            return;
        }
        this.isSaving = true;
        this.http.post<any>(urlConstant.PaymentSettingsAPI.update, this.settings).subscribe(
            () => {
                this.isSaving = false;
                this.sharedService.showAlert(1, 'Payment settings saved successfully');
            },
            () => {
                this.isSaving = false;
                this.sharedService.showAlert(2, 'Failed to save settings');
            }
        );
    }
}
