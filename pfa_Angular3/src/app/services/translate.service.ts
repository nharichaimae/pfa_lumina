import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class MyTranslateService {
  public translate = inject(TranslateService);
  currentLang: string | undefined;

   initLanguage() {
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');

    // 1. localStorage en priorité
    // 2. sinon langue du navigateur
    // 3. sinon 'fr' par défaut
    const savedLang = localStorage.getItem('lang');
    const browserLang = this.translate.getBrowserLang();
    const langToUse = savedLang || (browserLang?.match(/fr|en/) ? browserLang : 'fr');

    this.translate.use(langToUse);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  getCurrentLang() {
    return this.translate.currentLang;
  }
}