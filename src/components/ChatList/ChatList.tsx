import { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { deleteChat, fetchChats, toggleRandomMessages } from '../../services/chatService';
import { AddChat } from '../AddChat/AddChat';
import { EditChatForm } from '../EditChatForm/EditChatForm';
import { ChatDialog } from '../ChatDialog/ChatDialog';
import { User } from '../User/User';
import { Search } from '../Search/Search';
import { Modal } from '../Modal/Modal';
import styles from './ChatList.module.css';
import type { Chat, Message } from '../../types';

export const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [editChatId, setEditChatId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [randomMessagesEnabled, setRandomMessagesEnabled] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadChats = () => {
    fetchChats()
      .then(data => setChats(data))
      .catch(err => console.error(err));
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }

    const query = searchQuery.toLowerCase().trim();

    return chats.filter(chat => {
      const fullName = `${chat.firstName} ${chat.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [chats, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    const newSocket = io('https://chat-be-yu3g.onrender.com');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Подключен к серверу');
    });

    newSocket.on('chatCreated', (newChat: Chat) => {
      setChats(prev => [...prev, newChat]);
    });

    newSocket.on('chatUpdated', (updatedChat: Chat) => {
      setChats(prev => prev.map(chat => (chat._id === updatedChat._id ? updatedChat : chat)));
    });

    newSocket.on('chatDeleted', (deletedChatId: string) => {
      setChats(prev => prev.filter(chat => chat._id !== deletedChatId));
      if (deletedChatId === activeChatId) {
        setActiveChatId(null);
      }
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log('Новое сообщение получено:', message);
      if (message.isAutoResponse) {
        toast.info(`Auto reply received for active chat`);
      }
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === message.chatId ? { ...chat, lastMessage: message } : chat
        )
      );
    });

    newSocket.on('randomMessageNotification', (data: { chatId: string; message: Message }) => {
      console.log(
        'Новое случайное сообщение получено (через randomMessageNotification):',
        data.message
      );
      toast.info(`New random message sent`);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === data.chatId ? { ...chat, lastMessage: data.message } : chat
        )
      );
    });

    newSocket.on('disconnect', () => {
      console.log('Отключен от сервера');
    });

    loadChats();

    return () => {
      newSocket.off('connect');
      newSocket.off('chatCreated');
      newSocket.off('chatUpdated');
      newSocket.off('chatDeleted');
      newSocket.off('newMessage');
      newSocket.off('randomMessageNotification');
      newSocket.off('disconnect');
      newSocket.close();
    };
  }, [activeChatId]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this chat?');
    if (!confirmDelete) return;

    try {
      await deleteChat(id);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditForm = (chat: Chat) => {
    setEditChatId(chat._id);
    setEditFirstName(chat.firstName);
    setEditLastName(chat.lastName);
  };

  const handleToggleRandomMessages = async () => {
    try {
      await toggleRandomMessages(!randomMessagesEnabled);
      setRandomMessagesEnabled(!randomMessagesEnabled);
    } catch (err) {
      console.error('Error switching random messages', err);
    }
  };

  const activeChat = chats.find(chat => chat._id === activeChatId);

  return (
    <div className="flex">
      <div className={styles.chatList}>
        <User />
        <Search onSearch={handleSearch} />
        <div className={styles.header}>
          <h2>Chats</h2>
          <button onClick={() => setShowAddForm(true)} className={styles.btnNewChat}>
            New chat
          </button>
          <button
            onClick={handleToggleRandomMessages}
            className={styles.btnRandomMessages}
            style={{
              backgroundColor: randomMessagesEnabled ? '#f44336' : '#2196f3',
            }}
          >
            {randomMessagesEnabled ? 'Stop' : 'Start'} auto messages
          </button>
        </div>
        <ul>
          {filteredChats.length === 0 ? (
            <li className={styles.noResults}>
              {searchQuery ? `No chats found for "${searchQuery}"` : 'No chats available'}
            </li>
          ) : (
            filteredChats.map(chat => (
              <li
                key={chat._id}
                onClick={() => setActiveChatId(chat._id)}
                className={styles.chatItem}
                style={{
                  backgroundColor: activeChatId === chat._id ? '#e3f2fd' : 'white',
                }}
              >
                <div className="flexSB">
                  <div className="flex">
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
                    <div className={styles.nameText}>
                      <h3>
                        {chat.firstName} {chat.lastName}
                      </h3>
                      {chat.lastMessage && (
                        <p className={styles.lastMessageText}>{chat.lastMessage.text}</p>
                      )}
                    </div>
                  </div>
                  <div className="flexColumn">
                    {chat.lastMessage && (
                      <div>{format(new Date(chat.lastMessage.createdAt), 'MMM d, yyyy')}</div>
                    )}
                    <div className="flex">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openEditForm(chat);
                        }}
                        className="btnIcon"
                      >
                        <svg
                          width="16"
                          height="16"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="green"
                          className="size-6"
                        >
                          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                        </svg>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(chat._id);
                        }}
                        className="btnIcon"
                      >
                        <svg
                          width="16"
                          height="16"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="red"
                          className="size-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className={styles.chatDialog}>
        {activeChatId ? (
          <ChatDialog
            chatId={activeChatId}
            chatName={activeChat ? `${activeChat.firstName} ${activeChat.lastName}` : ''}
            socket={socket}
          />
        ) : (
          <h4>
            Select a chat from the list on the left, or create a new one to start a conversation!
          </h4>
        )}
      </div>

      {editChatId && (
        <Modal isOpen={!!editChatId} onClose={() => setEditChatId(null)}>
          <EditChatForm
            chatId={editChatId!}
            currentFirstName={editFirstName}
            currentLastName={editLastName}
            onClose={() => setEditChatId(null)}
            onChatUpdated={() => {}}
            socket={socket}
          />
        </Modal>
      )}

      {showAddForm && (
        <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
          <AddChat
            onChatAdded={() => {
              setShowAddForm(false);
            }}
            socket={socket}
          />
          <button onClick={() => setShowAddForm(false)} className={styles.btnClose}>
            Close
          </button>
        </Modal>
      )}
    </div>
  );
};
