import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { DialogModule } from '@angular/cdk/dialog';
import { provideTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DropdownModule } from '@zhannam85/ui-kit';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        DialogModule,
        DropdownModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: provideTranslateLoader(TranslateHttpLoader),
        }),
    ],
    providers: [
        provideHttpClient(),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
