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
 inputText: string = '';
 additionalInputText: string = '';
 translatedText: string = '';
 synonyms: string[] = [];


 constructor(private http: HttpClient) {}


 translateText() {
   const backendUrl = 'http://127.0.0.1:8000/translate';
   this.http.post<any>(backendUrl, { text: this.inputText }).subscribe(
     (response) => {
       this.translatedText = response.translated_text;
     },
     (error) => {
       console.error('Errore durante la traduzione:', error);
     }
   );
 }


 // Funzione per evidenziare una parola e recuperare i sinonimi
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
}
