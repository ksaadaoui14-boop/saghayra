import React, { useState } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    // Réponse simple du bot
    setTimeout(() => {
      const botMessage: Message = {
        sender: 'bot',
        text: "Bonjour ! Comment puis-je vous aider ?"
      };
      setMessages(msgs => [...msgs, botMessage]);
    }, 500);
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 320, background: '#fff' }}>
      <h3>Chatbot</h3>
      <div style={{ height: 200, overflowY: 'auto', marginBottom: 8, background: '#f9f9f9', padding: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '4px 0' }}>
            <span style={{ background: msg.sender === 'user' ? '#d1e7dd' : '#e2e3e5', borderRadius: 4, padding: '4px 8px', display: 'inline-block' }}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: 4 }}
          placeholder="Votre message..."
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} style={{ padding: '4px 12px' }}>Envoyer</button>
      </div>
    </div>
  );
};

export default Chatbot;
