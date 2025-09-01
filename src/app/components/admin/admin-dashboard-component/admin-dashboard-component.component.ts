import { Component, computed, effect, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageStates } from '../../../common/models/pageStates';
import { fadeIn400 } from '../../../common/const/animations';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { CountUpComponent } from '../../shared/count-up/count-up.component';
import { ApiService } from '../../../services/api.service';

export interface SystemKpis {
    totalAccounts: number;
    newAccountsLast30Days: number;
    totalUsers: number;
    totalOrdersLast30Days: number;
}

@Component({
  selector: 'app-admin-dashboard-component',
  standalone: true,
  imports: [CommonModule, LoaderComponent, CountUpComponent],
  templateUrl: './admin-dashboard-component.component.html',
  styleUrl: './admin-dashboard-component.component.css',
  animations: [fadeIn400]
})
export class AdminDashboardComponentComponent implements OnInit {
    private apiService = inject(ApiService);

    readonly PageStates = PageStates;
    pageState = signal<PageStates>(PageStates.Loading);
    kpis = signal<SystemKpis | null>(null);

    ngOnInit(): void {
        this.loadKpis();
    }

    loadKpis(force = false): void {
        this.pageState.set(PageStates.Loading);
        this.apiService.getSystemKpis().subscribe({ // נצטרך להוסיף את זה ל-ApiService
            next: (response) => {
                if (response.success && response.result) {
                    this.kpis.set(response.result);
                    this.pageState.set(PageStates.Ready);
                } else {
                    this.pageState.set(PageStates.Error);
                }
            },
            error: () => this.pageState.set(PageStates.Error)
        });
    }
}