import { Routes } from '@angular/router';
import { ConversationListComponent } from './pages/conversations/conversations.component';
import { ChatComponent } from './pages/chat/chat.component';

export const MESSAGING_ROUTES: Routes = [
  { path: '', component: ConversationListComponent },
  { path: ':id', component: ChatComponent }
];
