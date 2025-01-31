import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common'; // Per NgFor e ngClass
import { FormsModule } from '@angular/forms'; // Per ngModel
import { MatIconModule } from '@angular/material/icon'; // Per mat-icon
import { MatButtonModule } from '@angular/material/button'; 
import { MatProgressBarModule } from '@angular/material/progress-bar'; 


@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
})
export class ChatComponent {
  userMessage: string = ''; 
  messages: { text: string; sender: 'user' | 'assistant' }[] = []; 
  isLoading: boolean = false;

  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef; 

  baseUrl: string = 'http://127.0.0.1:8000'; 

  constructor(private http: HttpClient) {}

  handleKeydown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      if (!keyboardEvent.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    }
  }

  sendMessage(): void {
    if (this.userMessage.trim()) {
      this.messages.push({ text: this.userMessage, sender: 'user' });

      this.isLoading = true;

      this.scrollToBottom();

      const backendUrl = `${this.baseUrl}/query`; 
      const payload = { query: this.userMessage };

      this.http.post<any>(backendUrl, payload).subscribe(
        (response) => {
          this.isLoading = false;
          this.messages.push({ text: response.results, sender: 'assistant' });

          this.scrollToBottom();
        },
        (error) => {
          console.error('Errore durante la chiamata REST:', error);
          this.isLoading = false;
          this.messages.push({
            text: 'Error: Unable to process your request at the moment.',
            sender: 'assistant',
          });

          this.scrollToBottom();
        }
      );

      this.userMessage = '';
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatMessagesContainer) {
        this.chatMessagesContainer.nativeElement.scrollTop =
          this.chatMessagesContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }
}