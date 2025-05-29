import { useEffect, useState } from 'react';
import { addHours, format } from 'date-fns';
import {
  fetchMessages,
  joinChatRoom,
  leaveChatRoom,
  sendMessage,
} from '../../services/messageService';
import styles from './ChatDialog.module.css';
import type { ChatDialogProps, Message } from '../../types';

export const ChatDialog = ({ chatId, chatName, socket }: ChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [waitingForAutoResponse, setWaitingForAutoResponse] = useState(false);

  useEffect(() => {
    if (!socket) return;

    joinChatRoom(socket, chatId);

    const loadMessages = async () => {
      try {
        const data = await fetchMessages(chatId);
        setMessages(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading messages', err);
        setIsLoading(false);
      }
    };

    loadMessages();

    const handleNewMessage = (message: Message) => {
      if (message.chatId !== chatId) return;

      setMessages(prev => {
        const exists = prev.some(msg => msg._id === message._id);
        return exists ? prev : [...prev, message];
      });

      if (message.isAutoResponse) {
        setWaitingForAutoResponse(false);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      leaveChatRoom(socket, chatId);
      socket.off('newMessage', handleNewMessage);
    };
  }, [chatId, socket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    setWaitingForAutoResponse(true);

    try {
      await sendMessage(chatId, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message', err);
      setWaitingForAutoResponse(false);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className={styles.chatDialog}>
      <div className={styles.name}>
        <div className="avatar">
          <svg
            width="35"
            height="35"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3>{chatName}</h3>
      </div>
      <div className={styles.dialog}>
        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div>No messages. Start a conversation!</div>
          ) : (
            messages.map(msg => (
              <div
                key={msg._id}
                className={styles.messages}
                style={{
                  justifyContent: msg.isAutoResponse ? 'flex-end' : 'flex-start',
                }}
              >
                <div className={styles.message}>
                  <div className="flex">
                    {!msg.isAutoResponse && (
                      <div className="avatar">
                        <svg
                          width="30"
                          height="30"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className={styles.text}
                      style={{
                        backgroundColor: msg.isAutoResponse ? '#a0a1a0' : '#333435',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <div
                    className={styles.date}
                    style={{
                      textAlign: msg.isAutoResponse ? 'right' : 'left',
                    }}
                  >
                    {format(addHours(new Date(msg.createdAt), 12), 'M/d/yyyy, h:mm a')}
                  </div>
                </div>
              </div>
            ))
          )}
          {waitingForAutoResponse && (
            <div className={styles.auto}>Waiting for auto-reply with quote (3 seconds)...</div>
          )}
        </div>
        <form onSubmit={handleSendMessage}>
          <div className={styles.form}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message"
              disabled={isSending}
              className={styles.input}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className={styles.btn}
              style={{
                cursor: isSending ? 'not-allowed' : 'pointer',
              }}
            >
              <svg
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
