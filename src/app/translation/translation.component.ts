import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatToolbar } from "@angular/material/toolbar";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
selector: 'app-translation',
standalone: true,
imports: [MatCardModule, FormsModule, CommonModule, MatGridListModule, MatButtonModule, MatInputModule, MatToolbar, MatTabGroup, MatTab, MatIconModule, MatProgressSpinnerModule],
templateUrl: './translation.component.html',
styleUrls: ['./translation.component.css'],
encapsulation: ViewEncapsulation.None
})
export class TranslationComponent {
synonyms: string[] = [];

originalSegments: string[] = [];
amendedSegments: string[] = [];
translatedSegments: string[] = [];
translatedAmendedSegments: string[] = [];

firstTabContent: string = '';
amendments: { seg_ori: string[]; seg_am_ori: string[]; seg_tra: string[]; seg_am_tra: string[] }[] = [];
currentPageIndex: number = 0;

isExpanded: boolean = false;
isEditing: boolean = false;

isLoading: boolean = false;

textareas: HTMLTextAreaElement[] = [];

baseUrl: string = 'http://127.0.0.1:8000';

constructor(private http: HttpClient) { }

translateText(segment: string) {
    const backendUrl = `${this.baseUrl}/translate`;
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
      const backendUrl = `${this.baseUrl}/synonyms`;
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

this.isLoading = true;

      const backendUrl = `${this.baseUrl}/upload/`;
this.http.post<any>(backendUrl, formData).subscribe(
(response) => {
console.log('Risultato Analisi:', response);

this.amendments = response || [];
this.currentPageIndex = 0;
this.updatePage()
this.isLoading = false;
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
this.originalSegments = this.amendments[this.currentPageIndex].seg_ori;
} else if (wrapper.classList.contains('amended')) {
this.amendedSegments = this.amendments[this.currentPageIndex].seg_am_ori;
} else if (wrapper.classList.contains('translated')) {
this.translatedSegments = this.amendments[this.currentPageIndex].seg_tra;
} else if (wrapper.classList.contains('translated_amended')) {
this.translatedAmendedSegments = this.amendments[this.currentPageIndex].seg_am_tra;
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


// Toggle per espandere/ridurre e attivare/disattivare editing
toggleExpand(): void {
this.isEditing = !this.isEditing;
}

saveSegment(index: number) {
// Logica opzionale per salvare il segmento modificato
console.log('Salvato segmento', index, this.translatedAmendedSegments[index]);
}

saveTextareaRef(index: number, element: EventTarget | null): void {
  if (element instanceof HTMLTextAreaElement) {
    this.textareas[index] = element;
  } else {
    console.warn(`Element at index ${index} is not a valid HTMLTextAreaElement`);
  }
}

updateSegment(index: number): void {
  console.log(`Updated segment at index ${index}: ${this.translatedAmendedSegments[index]}`);

  // Riassegna il focus dopo l'aggiornamento
  setTimeout(() => {
    if (this.textareas[index]) {
      this.textareas[index].focus();
    }
  }, 0);
}

trackByIndex(index: number, item: string): number {
  return index;
}

}