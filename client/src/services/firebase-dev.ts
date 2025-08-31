import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updatePassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';

// Development Firebase configuration (using emulators)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id",
  measurementId: "demo-measurement-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Connect to Firebase Auth Emulator for development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Firebase Auth Emulator');
  } catch (error) {
    console.log('Firebase Auth Emulator not available, using production');
  }
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

class FirebaseService {
  constructor() {
    this.setPersistence(true);
  }

  async setPersistence(rememberMe: boolean = true): Promise<void> {
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
    } catch (error) {
      console.error('Error setting persistence:', error);
    }
  }

  async signInWithEmailAndPassword(credentials: { email: string; password: string }, rememberMe: boolean = true): Promise<FirebaseUser> {
    try {
      await this.setPersistence(rememberMe);
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw this.handleAuthError(error);
    }
  }

  async signUpWithEmailAndPassword(credentials: { email: string; password: string; fullName?: string }): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Send email verification
      await this.sendEmailVerification(userCredential.user);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw this.handleAuthError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw this.handleAuthError(error);
    }
  }

  async sendEmailVerification(user: FirebaseUser): Promise<void> {
    try {
      await sendEmailVerification(user);
    } catch (error: any) {
      console.error('Error sending email verification:', error);
      throw this.handleAuthError(error);
    }
  }

  async getCurrentUser(): Promise<FirebaseUser | null> {
    return auth.currentUser;
  }

  async getCurrentUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      try {
        return await user.getIdToken();
      } catch (error) {
        console.error('Error getting user token:', error);
        return null;
      }
    }
    return null;
  }

  async refreshUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      try {
        return await user.getIdToken(true);
      } catch (error) {
        console.error('Error refreshing user token:', error);
        return null;
      }
    }
    return null;
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  private handleAuthError(error: any): Error {
    let message = 'An authentication error occurred';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password authentication is not enabled. Please contact support.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign-in popup was closed';
        break;
      case 'auth/popup-blocked':
        message = 'Sign-in popup was blocked by browser';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Sign-in was cancelled';
        break;
      default:
        message = error.message || 'Authentication failed';
    }
    
    return new Error(message);
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
