import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

/**
 * Bootstrap PolicyQuote application with standalone components.
 * 
 * Configuration:
 * - HttpClient with ErrorInterceptor for global error handling
 * - Standalone component bootstrap (no NgModule)
 * - Environment-based API configuration
 */
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
  ]
}).catch(err => console.error(err));
