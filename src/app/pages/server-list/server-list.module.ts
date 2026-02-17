import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { ButtonModule, CheckboxModule, DropdownModule, InputModule } from '@zhannam85/ui-kit';

import { ServerListComponent } from './server-list.component';
import { AddServerDialogComponent } from './add-server-dialog/add-server-dialog.component';

const routes: Routes = [{ path: '', component: ServerListComponent }];

@NgModule({
    declarations: [ServerListComponent, AddServerDialogComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        CheckboxModule,
        DropdownModule,
        InputModule,
    ],
})
export class ServerListModule {}
