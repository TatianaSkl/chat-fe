import { useState } from 'react';
import { toast } from 'react-toastify';
import { updateChat } from '../../services/chatService';
import styles from './EditChat.module.css';
import type { EditChatFormProps } from '../../types';

export const EditChatForm = ({
  chatId,
  currentFirstName,
  currentLastName,
  onClose,
  onChatUpdated,
}: EditChatFormProps) => {
  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);
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
      await updateChat(chatId, firstName.trim(), lastName.trim());
      toast.success('Chat updated successfully!');
      onChatUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.сontainer}>
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="Name*"
          className={styles.input}
          disabled={isLoading}
          required
        />
        <input
          type="text"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          placeholder="Surname*"
          className={styles.input}
          disabled={isLoading}
          required
        />
      </div>
      <div className={styles.сontainer}>
        <button type="submit" className={styles.btn} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className={styles.btn} onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
      </div>
    </form>
  );
};
