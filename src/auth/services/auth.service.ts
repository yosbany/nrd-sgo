import { 
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Firestore 
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { 
  AuthUser, 
  LoginCredentials, 
  RegisterUserData, 
  UserRole, 
  Permission 
} from '../interfaces/auth.interface';

export class AuthService {
  private auth: Auth;
  private db: Firestore;
  private currentUser: AuthUser | null = null;

  constructor() {
    this.auth = auth;
    this.db = db;
    this.initAuthListener();
  }

  private initAuthListener(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const authUser = await this.getUserData(user);
        this.currentUser = authUser;
      } else {
        this.currentUser = null;
      }
    });
  }

  async login({ email, password }: LoginCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const authUser = await this.getUserData(userCredential.user);
      
      if (!authUser.isActive) {
        await this.logout();
        throw new Error('User account is disabled');
      }

      // Update last login
      await this.updateLastLogin(authUser.uid);
      
      return authUser;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async register(userData: RegisterUserData): Promise<AuthUser> {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        userData.email,
        userData.password
      );

      // Create user document in Firestore
      const user: Omit<AuthUser, 'uid'> = {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        permissions: userData.permissions || this.getDefaultPermissions(userData.role),
        isActive: true,
        lastLogin: new Date()
      };

      await setDoc(doc(this.db, 'users', userCredential.user.uid), user);

      return {
        ...user,
        uid: userCredential.user.uid
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser = null;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can update user roles');
    }

    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        role,
        permissions: this.getDefaultPermissions(role)
      });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async updateUserPermissions(uid: string, permissions: Permission[]): Promise<void> {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can update user permissions');
    }

    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, { permissions });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can toggle user status');
    }

    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, { isActive });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  private async getUserData(firebaseUser: FirebaseUser): Promise<AuthUser> {
    const userDoc = await getDoc(doc(this.db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data() as Omit<AuthUser, 'uid'>;
    return {
      ...userData,
      uid: firebaseUser.uid
    };
  }

  private async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(this.db, 'users', uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
  }

  private getDefaultPermissions(role: UserRole): Permission[] {
    const basePermissions: Record<UserRole, Permission[]> = {
      admin: [
        { resource: '*', actions: ['create', 'read', 'update', 'delete', 'list'] }
      ],
      manager: [
        { resource: 'workers', actions: ['create', 'read', 'update', 'list'] },
        { resource: 'products', actions: ['create', 'read', 'update', 'list'] },
        { resource: 'orders', actions: ['create', 'read', 'update', 'list'] },
        { resource: 'incidents', actions: ['create', 'read', 'update', 'list'] }
      ],
      worker: [
        { resource: 'products', actions: ['read', 'list'] },
        { resource: 'orders', actions: ['read', 'list'] },
        { resource: 'incidents', actions: ['create', 'read', 'list'] }
      ],
      viewer: [
        { resource: 'products', actions: ['read', 'list'] },
        { resource: 'orders', actions: ['read', 'list'] }
      ]
    };

    return basePermissions[role];
  }

  private handleAuthError(error: any): Error {
    console.error('Auth error:', error);
    
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return new Error('User not found');
        case 'auth/wrong-password':
          return new Error('Invalid password');
        case 'auth/email-already-in-use':
          return new Error('Email already registered');
        case 'auth/weak-password':
          return new Error('Password is too weak');
        case 'auth/invalid-email':
          return new Error('Invalid email format');
        default:
          return new Error('Authentication failed');
      }
    }

    return error instanceof Error ? error : new Error('Authentication failed');
  }
} 