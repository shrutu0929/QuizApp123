interface StoredUser {
  _id: string;
  username: string;
  email: string;
  password: string; // Hashed password
  role: 'admin' | 'player';
  level: number;
  experience: number;
  totalQuizzesAttempted: number;
  averageScore: number;
  highestScore: number;
  badges: any[];
  joinDate: Date;
}

class UserStore {
  private users: Map<string, StoredUser> = new Map();
  private userCounter = 1;

  // Register a new user
  async registerUser(username: string, email: string, password: string): Promise<StoredUser> {
    // Check if user already exists
    for (const user of this.users.values()) {
      if (user.email === email || user.username === username) {
        throw new Error('User already exists');
      }
    }

    // Create new user
    const newUser: StoredUser = {
      _id: `user-${this.userCounter++}`,
      username,
      email,
      password, // We'll hash this in the auth route
      role: 'player',
      level: 1,
      experience: 0,
      totalQuizzesAttempted: 0,
      averageScore: 0,
      highestScore: 0,
      badges: [],
      joinDate: new Date()
    };

    this.users.set(newUser._id, newUser);
    return newUser;
  }

  // Find user by email
  async findByEmail(email: string): Promise<StoredUser | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  // Find user by ID
  async findById(id: string): Promise<StoredUser | null> {
    return this.users.get(id) || null;
  }

  // Get all users (for debugging)
  async getAllUsers(): Promise<StoredUser[]> {
    return Array.from(this.users.values());
  }

  // Clear all users (for testing)
  async clearAll(): Promise<void> {
    this.users.clear();
    this.userCounter = 1;
  }
}

export default new UserStore();
