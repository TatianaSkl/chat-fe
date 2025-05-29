import type { Socket } from 'socket.io-client';

export interface Message {
  _id: string;
  text: string;
  chatId: string;
  createdAt: string;
  isAutoResponse: boolean;
  updatedAt?: string;
  __v?: number;
}

export interface Chat {
  _id: string;
  firstName: string;
  lastName: string;
  lastMessage?: Message;
}

export interface ChatDialogProps {
  chatId: string;
  chatName: string;
  socket: Socket | null;
}

export interface SearchProps {
  onSearch: (query: string) => void;
}

export interface EditChatFormProps {
  chatId: string;
  currentFirstName: string;
  currentLastName: string;
  onClose: () => void;
  onChatUpdated: () => void;
  socket: Socket | null;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface AddChatProps {
  onChatAdded: () => void;
  socket: Socket | null;
}
