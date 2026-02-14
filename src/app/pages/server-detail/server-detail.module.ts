import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from '@zhannam85/ui-kit';

import { ServerDetailComponent } from './server-detail.component';

const routes: Routes = [{ path: '', component: ServerDetailComponent }];

@NgModule({
    declarations: [ServerDetailComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ButtonModule,
    ],
})
export class ServerDetailModule {}
