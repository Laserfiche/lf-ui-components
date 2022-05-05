import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const link = document.createElement('link');
link.rel = "stylesheet";
link.id = "lf-stylesheet";
link.href = "./lf-laserfiche-lite.css";

document.head.appendChild(link);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
