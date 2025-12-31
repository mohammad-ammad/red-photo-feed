export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

import { supabase } from '@/lib/supabase';

const USERS_KEY = 'gallery_users';
const POSTS_KEY = 'gallery_posts';
const CURRENT_USER_KEY = 'gallery_current_user';

// Sample posts for demo
const samplePosts: Post[] = [
  {
    id: '1',
    userId: 'demo',
    imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600',
    caption: 'Beautiful sunset views 🌅',
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'demo',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
    caption: 'Nature at its finest 🌲',
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'demo',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    caption: 'City lights ✨',
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  },
];

const demoUser: User = {
  id: 'demo',
  username: 'demo_user',
  email: 'demo_user@example.com',
  password: 'demo123',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  bio: 'Welcome to the gallery! 📸',
  createdAt: new Date().toISOString(),
};

export const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]));
  }
  if (!localStorage.getItem(POSTS_KEY)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(samplePosts));
  }
  // If Supabase is configured, sync current auth state to local storage and
  // ensure a cached profile exists for quick lookups in the UI.
  if (supabase) {
    // initial session sync
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (user) {
          localStorage.setItem(CURRENT_USER_KEY, user.id);
          // try to fetch profile and cache it locally
          try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (profile) {
              const users = getUsers();
              const exists = users.find(u => u.id === profile.id);
              if (!exists) {
                users.push({
                  id: profile.id,
                  username: profile.username || '',
                  email: user.email || '',
                  password: '',
                  avatar: profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`,
                  bio: profile.bio || '',
                  createdAt: profile.created_at || new Date().toISOString(),
                });
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
              }
            }
          } catch (e) {
            // ignore profile fetch errors
          }
        }
      } catch (e) {
        // ignore session fetch errors
      }
    })();

    // listen to auth changes and keep local cache in sync
    supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, user.id);
        // fetch profile and cache it
        (async () => {
          try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (profile) {
              const users = getUsers();
              const exists = users.find(u => u.id === profile.id);
              if (!exists) {
                users.push({
                  id: profile.id,
                  username: profile.username || '',
                  email: user.email || '',
                  password: '',
                  avatar: profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`,
                  bio: profile.bio || '',
                  createdAt: profile.created_at || new Date().toISOString(),
                });
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
              }
            }
          } catch (e) {
            // ignore profile fetch errors
          }
        })();
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    });
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const getPosts = (): Post[] => {
  const posts = localStorage.getItem(POSTS_KEY);
  return posts ? JSON.parse(posts) : [];
};

export const getCurrentUser = (): User | null => {
  const userId = localStorage.getItem(CURRENT_USER_KEY);
  if (!userId) return null;
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};


export const signUp = async (username: string, email: string, password: string): Promise<User | null> => {
  if (!supabase) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
      return null;
    }
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      bio: '',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    return newUser;
  }

  // Use Supabase auth (map username to an email for auth reasons)
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
  if (error || !data?.user) return null;

  const user = data.user;
  // create profile row
  try {
    await supabase.from('profiles').insert({ id: user.id, username, avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${username}` });
  } catch (e) {
    // ignore insert errors
  }

  // cache minimal profile locally for UI usage
  const users = getUsers();
  users.push({
    id: user.id,
    username,
    email: email,
    password: '',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    bio: '',
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, user.id);

  return users[users.length - 1];
};


export const signIn = async (email: string, password: string): Promise<User | null> => {
  if (!supabase) {
    const users = getUsers();
    const user = users.find(u => (u.username === email || u.email === email) && u.password === password);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, user.id);
      return user;
    }
    return null;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.user) return null;

  const user = data.user;
  // fetch profile and cache locally
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const users = getUsers();
  const existing = users.find(u => u.id === user.id);
  if (!existing) {
    const fallbackUsername = profile?.username || (user.email ? user.email.split('@')[0] : '');
    users.push({
      id: user.id,
      username: fallbackUsername,
      email: user.email || '',
      password: '',
      avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${fallbackUsername}`,
      bio: profile?.bio || '',
      createdAt: profile?.created_at || new Date().toISOString(),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  localStorage.setItem(CURRENT_USER_KEY, user.id);

  return getUsers().find(u => u.id === user.id) || null;
};


export const signOut = async () => {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore signOut errors
    }
  }
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const createPost = (imageUrl: string, caption: string): Post | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const posts = getPosts();
  const newPost: Post = {
    id: Date.now().toString(),
    userId: currentUser.id,
    imageUrl,
    caption,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return newPost;
};

export const toggleLike = (postId: string): Post | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return null;
  
  const likeIndex = post.likes.indexOf(currentUser.id);
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push(currentUser.id);
  }
  
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return post;
};

export const addComment = (postId: string, text: string): Post | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return null;
  
  const newComment: Comment = {
    id: Date.now().toString(),
    userId: currentUser.id,
    text,
    createdAt: new Date().toISOString(),
  };
  post.comments.push(newComment);
  
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return post;
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

export const getPostsByUserId = (userId: string): Post[] => {
  const posts = getPosts();
  return posts.filter(p => p.userId === userId);
};
