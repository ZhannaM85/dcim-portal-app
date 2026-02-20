import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { DialogModule } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
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
        }),
    ],
    providers: [
        provideHttpClient(),
        ...provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
