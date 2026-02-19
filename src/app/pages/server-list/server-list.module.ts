import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { ButtonModule, CheckboxModule, DropdownModule, InputModule, IconModule } from '@zhannam85/ui-kit';

import { ServerListComponent } from './server-list.component';
import { AddServerDialogComponent } from './add-server-dialog/add-server-dialog.component';
import { HighlightPipe } from './highlight.pipe';

const routes: Routes = [{ path: '', component: ServerListComponent }];

@NgModule({
    declarations: [ServerListComponent, AddServerDialogComponent, HighlightPipe],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        CheckboxModule,
        DropdownModule,
        InputModule,
        IconModule,
    ],
})
export class ServerListModule {}
