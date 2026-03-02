import { useState } from 'react';
import { supabase, type User } from '../lib/supabase';

interface PostFormProps {
  currentUser: User;
  onPostCreated: () => void;
}

export function PostForm({ currentUser, onPostCreated }: PostFormProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'update' | 'question' | 'announcement'>('update');
  const [marketplace, setMarketplace] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const postData: any = {
      user_id: currentUser.id,
      content: content.trim(),
      category,
    };

    if (marketplace) {
      postData.marketplace = marketplace;
    }

    if (category === 'question') {
      postData.status = 'open';
    }

    const { error } = await supabase.from('posts').insert([postData]);

    if (!error) {
      setContent('');
      setMarketplace('');
      onPostCreated();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="post-form">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="form-tabs">
            <button
              type="button"
              className={`form-tab ${category === 'update' ? 'active' : ''}`}
              onClick={() => setCategory('update')}
            >
              Update
            </button>
            <button
              type="button"
              className={`form-tab ${category === 'question' ? 'active' : ''}`}
              onClick={() => setCategory('question')}
            >
              Question
            </button>
            <button
              type="button"
              className={`form-tab ${category === 'announcement' ? 'active' : ''}`}
              onClick={() => setCategory('announcement')}
            >
              Announcement
            </button>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Share ${category === 'update' ? 'an update' : category === 'question' ? 'a question' : 'an announcement'}...`}
          rows={4}
          required
        />
        <div className="form-footer">
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className="marketplace-select"
          >
            <option value="">All Marketplaces</option>
            <option value="US">US</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <option value="Europe">Europe</option>
          </select>
          <button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
