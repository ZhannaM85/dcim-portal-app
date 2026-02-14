import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule, CheckboxModule, DropdownModule } from '@zhannam85/ui-kit';

import { ServerListComponent } from './server-list.component';

const routes: Routes = [{ path: '', component: ServerListComponent }];

@NgModule({
    declarations: [ServerListComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ButtonModule,
        CheckboxModule,
        DropdownModule,
    ],
})
export class ServerListModule {}
