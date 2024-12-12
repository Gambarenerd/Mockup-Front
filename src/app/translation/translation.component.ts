import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {MatToolbar} from "@angular/material/toolbar";
import {MatTab, MatTabGroup} from "@angular/material/tabs";

@Component({
 selector: 'app-translation',
 standalone: true,
 imports: [MatCardModule, FormsModule, CommonModule, MatGridListModule, MatButtonModule, MatInputModule, MatToolbar, MatTabGroup, MatTab],
 templateUrl: './translation.component.html',
 styleUrls: ['./translation.component.css'],
 encapsulation: ViewEncapsulation.None
})
export class TranslationComponent {
 originalText: string = '';
 amendedText: string = '';
 translatedText: string = '';
 synonyms: string[] = [];
 originalSegments: string[] = [];
 amendedSegments: string[] = [];

 constructor(private http: HttpClient) {}

 translateText() {
   const backendUrl = 'http://127.0.0.1:8000/translate';
   this.http.post<any>(backendUrl, { text: this.originalText }).subscribe(
     (response) => {
       this.translatedText = response.translated_text;
     },
     (error) => {
       console.error('Errore durante la traduzione:', error);
     }
   );
 }

 // Keep it for later
 highlightWord(event: MouseEvent) {
   const selection = window.getSelection();
   const selectedWord = selection ? selection.toString().trim() : '';

   if (selectedWord) {
     const backendUrl = 'http://127.0.0.1:8000/synonyms'; // Modifica con il tuo endpoint
     this.http.post<any>(backendUrl, { word: selectedWord }).subscribe(
       (response) => {
         this.synonyms = response.synonyms || [];
       },
       (error) => {
         console.error('Errore durante il recupero dei sinonimi:', error);
       }
     );
   }
 }

 onFileUpload(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Invia il file al back-end
    const backendUrl = 'http://127.0.0.1:8000/upload/';
    this.http.post<any>(backendUrl, formData).subscribe(
      (response) => {
        console.log('Risultato Analisi:', response);
        // Puoi aggiornare il testo nella UI
        this.originalSegments = response.segmented_original || [];
        this.amendedSegments = response.segmented_amended || [];
      },
      (error) => {
        console.error('Errore durante l\'upload del file:', error);
      }
    );
  }
}

highlightSegment(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (target) {
    target.style.backgroundColor = '#e4aa3e';
  }
}

clearHighlight(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (target) {
    target.style.backgroundColor = '';
  }
}


processSegment(segment: string): void {
  console.log('Segmento selezionato:', segment);
  // Add more logic here
}

}
