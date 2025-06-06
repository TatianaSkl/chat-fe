import type { Socket } from 'socket.io-client';

export const fetchMessages = async (chatId: string) => {
  const response = await fetch(`https://chat-be-yu3g.onrender.com/messages/${chatId}`);
  if (!response.ok) {
    throw new Error('Error loading messages');
  }
  return await response.json();
};

export const sendMessage = async (chatId: string, text: string) => {
  const response = await fetch(`https://chat-be-yu3g.onrender.com/messages/${chatId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Error sending message');
  }

  return await response.json();
};

export const joinChatRoom = (socket: Socket, chatId: string) => {
  socket.emit('joinChat', chatId);
};

export const leaveChatRoom = (socket: Socket, chatId: string) => {
  socket.emit('leaveChat', chatId);
};
