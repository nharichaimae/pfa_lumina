import { enableProdMode, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { translateProviders } from './app/translate.config';

if (environment.production) enableProdMode();

bootstrapApplication(AppComponent, {
 providers: [
    provideHttpClient(), // 1️⃣ INDISPENSABLE de le mettre en premier
    translateProviders,   // 2️⃣ La config i18n utilise HttpClient
    importProvidersFrom(BrowserModule),
    provideRouter(routes),
    provideAnimations()
  ]
}).catch(err => console.error(err));