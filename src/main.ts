import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'src/app/core/extensions/register-routes';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
(async () => {
  console.time()
  const response = await fetch('./assets/json/config.json');
  const json = await response.json();
  Object.entries(json).forEach(([key, value]) => {
    environment[key] = value;
  });
  console.timeEnd()

  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

})();