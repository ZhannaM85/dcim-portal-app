import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'servers', pathMatch: 'full' },
    {
        path: 'servers',
        loadChildren: () =>
            import('./pages/server-list/server-list.module').then(
                (m) => m.ServerListModule
            ),
    },
    {
        path: 'servers/:id',
        loadChildren: () =>
            import('./pages/server-detail/server-detail.module').then(
                (m) => m.ServerDetailModule
            ),
    },
    { path: '**', redirectTo: 'servers' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
