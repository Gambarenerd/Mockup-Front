import { Component } from '@angular/core';
import { TranslationComponent } from './translation/translation.component';

@Component({
  selector: 'app-root',
  imports: [ TranslationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'translation-app';
}
