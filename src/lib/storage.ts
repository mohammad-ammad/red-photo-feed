import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  createdAt: string;
  role?: 'viewer' | 'creator';
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
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
  role: 'creator',
};

export const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]));
  }
  if (!localStorage.getItem(POSTS_KEY)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(samplePosts));
  }

  if (!supabase) return;

  // sync session and cache profile locally
  (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, user.id);
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
                role: (profile as any).role || 'viewer',
              });
              localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
  })();

  supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user || null;
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, user.id);
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
                role: (profile as any).role || 'viewer',
              });
              localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }
          }
        } catch (e) {
          // ignore
        }
      })();
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  });
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// synchronous helper used by UI to access cached posts when supabase not configured
const getPostsSync = (): Post[] => {
  const posts = localStorage.getItem(POSTS_KEY);
  return posts ? JSON.parse(posts) : [];
};

export const getPosts = async (): Promise<Post[]> => {
  if (!supabase) return getPostsSync();

  try {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (postsError || !postsData) return [];

    const postIds = postsData.map((p: any) => p.id);
    // cache profiles for authors of these posts so UI can resolve usernames
    try {
      const userIds = Array.from(new Set((postsData || []).map((p: any) => p.user_id)));
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds as string[]);
        if (profiles && profiles.length) {
          const users = getUsers();
          profiles.forEach((pr: any) => {
            if (!users.find(u => u.id === pr.id)) {
              users.push({
                id: pr.id,
                username: pr.username || '',
                email: '',
                password: '',
                avatar: pr.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${pr.username}`,
                bio: pr.bio || '',
                createdAt: pr.created_at || new Date().toISOString(),
                role: pr.role || 'viewer',
              });
            }
          });
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      }
    } catch (e) {
      // ignore profile caching errors
    }
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .in('post_id', postIds)
      .order('created_at', { ascending: true });

    // cache profiles for any commenters so UI can resolve their usernames
    try {
      const commenterIds = Array.from(new Set((commentsData || []).map((c: any) => c.user_id)));
      const authorIds = Array.from(new Set((postsData || []).map((p: any) => p.user_id)));
      const idsToFetch = Array.from(new Set([...authorIds, ...commenterIds]));
      if (idsToFetch.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', idsToFetch as string[]);
        if (profiles && profiles.length) {
          const users = getUsers();
          profiles.forEach((pr: any) => {
            if (!users.find(u => u.id === pr.id)) {
              users.push({
                id: pr.id,
                username: pr.username || '',
                email: '',
                password: '',
                avatar: pr.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${pr.username}`,
                bio: pr.bio || '',
                createdAt: pr.created_at || new Date().toISOString(),
                role: pr.role || 'viewer',
              });
            }
          });
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      }
    } catch (e) {
      // ignore
    }

    const commentsByPost: Record<string, Comment[]> = {};
    (commentsData || []).forEach((c: any) => {
      const cm: Comment = {
        id: c.id,
        userId: c.user_id,
        text: c.text,
        createdAt: c.created_at,
      };
      commentsByPost[c.post_id] = commentsByPost[c.post_id] || [];
      commentsByPost[c.post_id].push(cm);
    });

    const posts: Post[] = (postsData || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      imageUrl: p.image_url,
      caption: p.caption || '',
      likes: p.likes || [],
      comments: commentsByPost[p.id] || [],
      createdAt: p.created_at,
    }));

    return posts;
  } catch (e) {
    return [];
  }
};

export const getCurrentUser = (): User | null => {
  const userId = localStorage.getItem(CURRENT_USER_KEY);
  if (!userId) return null;
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

export type SignUpResult = {
  success: boolean;
  user?: User;
  needsVerification?: boolean;
};

export const signUp = async (username: string, email: string, password: string): Promise<SignUpResult> => {
  if (!supabase) {
    const users = getUsers();
    if (users.find(u => u.username === username)) return { success: false };
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      bio: '',
      createdAt: new Date().toISOString(),
      role: 'viewer',
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    return { success: true, user: newUser };
  }

  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
  if (error || !data?.user) return { success: false };
  const user = data.user;
  try {
    await supabase.from('profiles').insert({ id: user.id, username, avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`, role: 'viewer' });
  } catch (e) {
    // ignore
  }

  // Do NOT sign the user in locally — require email verification step.
  // Return a success flag indicating verification is needed.
  return { success: true, needsVerification: true };
};

export const signIn = async (email: string, password: string): Promise<User | null> => {
  if (!supabase) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, user.id);
      return user;
    }
    return null;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.user) return null;
  const user = data.user;
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    const fallbackUsername = profile?.username || (user.email ? user.email.split('@')[0] : '');
    const entry = {
      id: user.id,
      username: fallbackUsername,
      email: user.email || '',
      password: '',
      avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${fallbackUsername}`,
      bio: profile?.bio || '',
      createdAt: profile?.created_at || new Date().toISOString(),
      role: (profile as any)?.role || 'viewer',
    };
    if (existingIndex === -1) {
      users.push(entry);
    } else {
      users[existingIndex] = { ...users[existingIndex], ...entry };
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    // ignore
  }
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return getUsers().find(u => u.id === user.id) || null;
};

export const signOut = async () => {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
  }
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const createPost = async (imageUrl: string, caption: string): Promise<Post | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  if (!supabase) {
    const posts = getPostsSync();
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
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: currentUser.id, image_url: imageUrl, caption })
      .select()
      .single();
    if (error || !data) return null;
    const post: Post = {
      id: data.id,
      userId: data.user_id,
      imageUrl: data.image_url,
      caption: data.caption || '',
      likes: data.likes || [],
      comments: [],
      createdAt: data.created_at,
    };
    return post;
  } catch (e) {
    return null;
  }
};

export const toggleLike = async (postId: string): Promise<Post | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  if (!supabase) {
    const posts = getPostsSync();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;
    const likeIndex = post.likes.indexOf(currentUser.id);
    if (likeIndex > -1) post.likes.splice(likeIndex, 1);
    else post.likes.push(currentUser.id);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return post;
  }

  try {
    const { data: postRow } = await supabase.from('posts').select('*').eq('id', postId).maybeSingle();
    if (!postRow) return null;
    const likes: string[] = postRow.likes || [];
    const idx = likes.findIndex((id: string) => id === currentUser.id);
    if (idx > -1) likes.splice(idx, 1);
    else likes.push(currentUser.id);
    const { data: updated } = await supabase.from('posts').update({ likes }).eq('id', postId).select().maybeSingle();
    if (!updated) return null;
    const { data: commentsData } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    const post: Post = {
      id: updated.id,
      userId: updated.user_id,
      imageUrl: updated.image_url,
      caption: updated.caption || '',
      likes: updated.likes || [],
      comments: (commentsData || []).map((c: any) => ({ id: c.id, userId: c.user_id, text: c.text, createdAt: c.created_at })),
      createdAt: updated.created_at,
    };
    return post;
  } catch (e) {
    return null;
  }
};

export const addComment = async (postId: string, text: string): Promise<Post | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  if (!supabase) {
    const posts = getPostsSync();
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
  }

  try {
    const { data: inserted } = await supabase.from('comments').insert({ post_id: postId, user_id: currentUser.id, text }).select().single();
    if (!inserted) return null;
    const { data: postRow } = await supabase.from('posts').select('*').eq('id', postId).maybeSingle();
    if (!postRow) return null;
    const { data: commentsData } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    const post: Post = {
      id: postRow.id,
      userId: postRow.user_id,
      imageUrl: postRow.image_url,
      caption: postRow.caption || '',
      likes: postRow.likes || [],
      comments: (commentsData || []).map((c: any) => ({ id: c.id, userId: c.user_id, text: c.text, createdAt: c.created_at })),
      createdAt: postRow.created_at,
    };
    return post;
  } catch (e) {
    return null;
  }
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

export const setUserRole = async (userId: string, role: 'viewer' | 'creator') => {
  // update remote profile if supabase configured
  if (supabase) {
    try {
      await supabase.from('profiles').update({ role }).eq('id', userId);
    } catch (e) {
      // ignore
    }
  }

  // update local cache
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx > -1) {
    users[idx].role = role;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const getPostsByUserId = async (userId: string): Promise<Post[]> => {
  if (!supabase) {
    return getPostsSync().filter(p => p.userId === userId);
  }
  try {
    const { data: postsData } = await supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!postsData) return [];
    const postIds = postsData.map((p: any) => p.id);
    const { data: commentsData } = await supabase.from('comments').select('*').in('post_id', postIds).order('created_at', { ascending: true });

    // cache profile for the requested user and any commenters so UI shows usernames
    try {
      const commenterIds = Array.from(new Set((commentsData || []).map((c: any) => c.user_id)));
      const idsToFetch = Array.from(new Set([userId, ...commenterIds]));
      if (idsToFetch.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', idsToFetch as string[]);
        if (profiles && profiles.length) {
          const users = getUsers();
          profiles.forEach((pr: any) => {
            if (!users.find(u => u.id === pr.id)) {
              users.push({
                id: pr.id,
                username: pr.username || '',
                email: '',
                password: '',
                avatar: pr.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${pr.username}`,
                bio: pr.bio || '',
                  createdAt: pr.created_at || new Date().toISOString(),
                  role: pr.role || 'viewer',
              });
            }
          });
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      }
    } catch (e) {
      // ignore
    }
    const commentsByPost: Record<string, Comment[]> = {};
    (commentsData || []).forEach((c: any) => {
      const cm: Comment = { id: c.id, userId: c.user_id, text: c.text, createdAt: c.created_at };
      commentsByPost[c.post_id] = commentsByPost[c.post_id] || [];
      commentsByPost[c.post_id].push(cm);
    });
    return postsData.map((p: any) => ({ id: p.id, userId: p.user_id, imageUrl: p.image_url, caption: p.caption || '', likes: p.likes || [], comments: commentsByPost[p.id] || [], createdAt: p.created_at }));
  } catch (e) {
    return [];
  }
};
