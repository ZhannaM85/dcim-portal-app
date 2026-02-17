import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import { ButtonModule, InputModule, DropdownModule } from '@zhannam85/ui-kit';

import { ServerDetailComponent } from './server-detail.component';
import { ServerDetailChartComponent } from './server-detail-chart.component';

const routes: Routes = [{ path: '', component: ServerDetailComponent }];

@NgModule({
    declarations: [ServerDetailComponent, ServerDetailChartComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        HighchartsChartModule,
        ButtonModule,
        InputModule,
        DropdownModule,
    ],
})
export class ServerDetailModule {}
