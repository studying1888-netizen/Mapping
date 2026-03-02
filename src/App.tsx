import { useEffect, useState } from 'react';
import { supabase, type Post, type User } from './lib/supabase';
import { PostList } from './components/PostList';
import { PostForm } from './components/PostForm';
import { UserSetup } from './components/UserSetup';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'all' | 'update' | 'question' | 'announcement'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      loadUser(userId);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadPosts();

      const channel = supabase
        .channel('posts-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          () => {
            loadPosts();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'comments' },
          () => {
            loadPosts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser, filter]);

  const loadUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      setCurrentUser(data);
    } else {
      localStorage.removeItem('userId');
    }
    setLoading(false);
  };

  const loadPosts = async () => {
    let query = supabase
      .from('posts')
      .select('*, users(*)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('category', filter);
    }

    const { data } = await query;
    setPosts(data || []);
  };

  const handleUserSetup = async (name: string) => {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name }])
      .select()
      .single();

    if (data && !error) {
      setCurrentUser(data);
      localStorage.setItem('userId', data.id);
    }
  };

  const handlePostCreated = () => {
    loadPosts();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <UserSetup onSetup={handleUserSetup} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="logo">Team Updates</h1>
            <span className="workspace-tag">Amazon Operations</span>
          </div>
          <div className="header-right">
            <span className="user-info">{currentUser.name}</span>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Posts
            </button>
            <button
              className={`filter-tab ${filter === 'update' ? 'active' : ''}`}
              onClick={() => setFilter('update')}
            >
              Updates
            </button>
            <button
              className={`filter-tab ${filter === 'question' ? 'active' : ''}`}
              onClick={() => setFilter('question')}
            >
              Questions
            </button>
            <button
              className={`filter-tab ${filter === 'announcement' ? 'active' : ''}`}
              onClick={() => setFilter('announcement')}
            >
              Announcements
            </button>
          </div>

          <PostForm currentUser={currentUser} onPostCreated={handlePostCreated} />
          <PostList posts={posts} currentUser={currentUser} onUpdate={loadPosts} />
        </div>
      </main>
    </div>
  );
}

export default App;
