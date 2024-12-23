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

  baseUrl: string = 'https://aitrad-backend-5bf8513366a4.herokuapp.com';

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
          console.log('File uploaded, process ID:', response.process_id);
          this.connectWebSocket(response.process_id);
        },
        (error) => {
          console.error('Errore durante l\'upload del file:', error);
          this.isLoading = false;
        }
      );
    }
  }

  //webSocket connection to avoid timeout due to heroku limit to 30s
  connectWebSocket(processId: string): void {
    const ws = new WebSocket(`wss://aitrad-backend-5bf8513366a4.herokuapp.com/ws`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(processId);
    };

    ws.onmessage = (event) => {
      const status = JSON.parse(event.data);
      console.log('WebSocket message received:', status);

      if (status.status === 'completed') {
        console.log('Process completed:', status.result);
        this.amendments = status.result;
        this.currentPageIndex = 0;
        this.updatePage();
        this.isLoading = false;
        ws.close();
      } else if (status.status === 'error') {
        console.error('Errore durante l\'elaborazione:', status.error);
        this.isLoading = false;
        ws.close();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isLoading = false;
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
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

}
