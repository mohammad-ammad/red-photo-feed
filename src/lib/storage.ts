export interface User {
  id: string;
  username: string;
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

export const signUp = (username: string, password: string): User | null => {
  const users = getUsers();
  if (users.find(u => u.username === username)) {
    return null;
  }
  const newUser: User = {
    id: Date.now().toString(),
    username,
    password,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    bio: '',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, newUser.id);
  return newUser;
};

export const signIn = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    return user;
  }
  return null;
};

export const signOut = () => {
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
