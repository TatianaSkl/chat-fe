import { useState } from 'react';
import { toast } from 'react-toastify';
import { createChat } from '../../services/chatService';
import styles from './AddChat.module.css';
import type { AddChatProps } from '../../types';

export const AddChat = ({ onChatAdded }: AddChatProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!firstName.trim() && !lastName.trim()) {
      toast.error('Please fill in both name and surname');
      return false;
    }

    if (!firstName.trim()) {
      toast.error('Name is required');
      return false;
    }

    if (!lastName.trim()) {
      toast.error('Surname is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      await createChat(firstName.trim(), lastName.trim());
      setFirstName('');
      setLastName('');
      toast.success('Chat created successfully!');
      onChatAdded();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        placeholder="Name*"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        disabled={isLoading}
        className={styles.input}
        required
      />
      <input
        type="text"
        placeholder="Surname*"
        value={lastName}
        onChange={e => setLastName(e.target.value)}
        disabled={isLoading}
        className={styles.input}
        required
      />
      <button type="submit" disabled={isLoading} className={styles.btn}>
        {isLoading ? 'Creation...' : 'Add chat'}
      </button>
    </form>
  );
};
