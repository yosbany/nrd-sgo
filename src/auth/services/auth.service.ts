import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../../config/firebase';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authStateReady: Promise<void>;
  private authStateResolver!: () => void;

  constructor() {
    if (AuthService.instance) {
      return AuthService.instance;
    }
    
    this.authStateReady = new Promise((resolve) => {
      this.authStateResolver = resolve;
    });

    // Initialize auth state listener
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      console.log('Auth state initialized:', { 
        user: user?.email,
        isAuthenticated: !!user 
      });
      this.authStateResolver();
    });

    AuthService.instance = this;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    await this.authStateReady;
    return !!this.currentUser;
  }

  async waitForAuthReady(): Promise<void> {
    return this.authStateReady;
  }
} 