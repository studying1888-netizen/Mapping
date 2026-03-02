import { useState } from 'react';

interface UserSetupProps {
  onSetup: (name: string) => void;
}

export function UserSetup({ onSetup }: UserSetupProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSetup(name.trim());
    }
  };

  return (
    <div className="user-setup">
      <div className="user-setup-card">
        <h1>Welcome to Team Updates</h1>
        <p>Enter your name to get started</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            required
          />
          <button type="submit">Continue</button>
        </form>
      </div>
    </div>
  );
}
