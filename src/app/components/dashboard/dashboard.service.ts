import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { urlConstant } from '../../shared/constant/urlConst';

@Injectable({
    providedIn: 'root'
})


export class DashboardService {
    constructor(private http: HttpClient) { }

    AdminDashboard() {
        return this.http.get(urlConstant.DashboardAPI.dashboard);
    }
}