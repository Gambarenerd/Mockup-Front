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
import { MatIconModule } from '@angular/material/icon';


@Component({
 selector: 'app-translation',
 standalone: true,
 imports: [MatCardModule, FormsModule, CommonModule, MatGridListModule, MatButtonModule, MatInputModule, MatToolbar, MatTabGroup, MatTab, MatIconModule],
 templateUrl: './translation.component.html',
 styleUrls: ['./translation.component.css'],
 encapsulation: ViewEncapsulation.None
})
export class TranslationComponent {
 originalText: string = '';
 amendedText: string = '';
 synonyms: string[] = [];
 originalSegments: string[] = [];
 amendedSegments: string[] = [];
 firstTabContent: string = '';
 amendments: { segmented_original: string[]; segmented_amended: string[] }[] = [];
 currentPageIndex: number = 0;

 constructor(private http: HttpClient) {}

 translateText(segment: string) {
   const backendUrl = 'http://127.0.0.1:8000/translate';
   this.http.post<any>(backendUrl, { text: segment }).subscribe(
     (response) => {
       this.firstTabContent = response.translated_text;
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
        this.amendments = response || [];
        this.currentPageIndex = 0;
        this.updatePage()
      },
      (error) => {
        console.error('Errore durante l\'upload del file:', error);
      }
    );
  }
}

updatePage(): void {
  if (this.amendments.length > 0 && this.currentPageIndex < this.amendments.length) {
    const wrappers = document.querySelectorAll('.page-wrapper') as NodeListOf<HTMLElement>;

    wrappers.forEach((wrapper) => {
      wrapper.classList.add('animate');

      setTimeout(() => {
        wrapper.classList.remove('animate');

        
        if (wrapper.classList.contains('original')) {
          this.originalSegments = this.amendments[this.currentPageIndex].segmented_original;
        } else if (wrapper.classList.contains('amended')) {
          this.amendedSegments = this.amendments[this.currentPageIndex].segmented_amended;
        }
      }, 300);
    });
  }
}


nextPage(): void {
  if (this.currentPageIndex < this.amendments.length - 1) {
    this.currentPageIndex++;
    this.updatePage();
  }
}

previousPage(): void {
  if (this.currentPageIndex > 0) {
    this.currentPageIndex--;
    this.updatePage();
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
  this.translateText(segment)
}

}
