export const fetchChats = async () => {
  const response = await fetch('https://chat-be-yu3g.onrender.com/chats');
  if (!response.ok) {
    throw new Error('Error loading chats');
  }
  return await response.json();
};

export const createChat = async (firstName: string, lastName: string) => {
  const response = await fetch('https://chat-be-yu3g.onrender.com/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName }),
  });

  if (!response.ok) {
    throw new Error('Error creating chat');
  }

  return await response.json();
};

export const deleteChat = async (id: string) => {
  const response = await fetch(`https://chat-be-yu3g.onrender.com/chats/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error deleting chat');
  }

  return await response.json();
};

export const updateChat = async (id: string, firstName: string, lastName: string) => {
  const response = await fetch(`https://chat-be-yu3g.onrender.com/chats/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName }),
  });

  if (!response.ok) {
    throw new Error('Error updating chat');
  }

  return await response.json();
};

export const toggleRandomMessages = async (enabled: boolean) => {
  try {
    const response = await fetch('https://chat-be-yu3g.onrender.com/messages/random/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle random messages');
    }

    const result = await response.json();
    return result.message;
  } catch (error) {
    console.error('Error toggling random messages:', error);
    throw error;
  }
};
