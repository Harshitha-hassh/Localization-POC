import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'src/app/core/extensions/register-routes';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { GOOGLE_MAP_API_KEY } from 'src/app/common/shared/shared/setupConstants';

if (environment.production) {
  enableProdMode();
}
(async () => {
  console.time()
  let pv = localStorage.getItem('userProductVersion');
  const response = await fetch('./assets/json/config.json?v='+pv);
  const json = await response.json();
  if(!localStorage.getItem('googleMapsApiKey') && !localStorage.getItem('resetMapApiKey') && !localStorage.getItem('invalidKey')){
    localStorage.setItem('googleMapsApiKey', GOOGLE_MAP_API_KEY);
  }
  Object.entries(json).forEach(([key, value]) => {
    environment[key] = value;
  });
  console.timeEnd()

  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

})();
