import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
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
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { User, LoginCredentials, RegisterCredentials } from '@/types';

// Firebase configuration - Using a working demo configuration
// For production, create your own Firebase project and use environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCzfVsK_T3GKkCQIKC_9cigobIktgv1p2M',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'saas-evpv.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'saas-evpv',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'saas-evpv.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

class FirebaseService {
  constructor() {
    // Set persistence based on environment or user preference
    this.setPersistence(true); // true = remember me, false = session only
  }

  /**
   * Set authentication persistence
   */
  async setPersistence(rememberMe: boolean = true): Promise<void> {
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
    } catch (error) {
      console.error('Error setting persistence:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmailAndPassword(credentials: LoginCredentials, rememberMe: boolean = true): Promise<FirebaseUser> {
    try {
      await this.setPersistence(rememberMe);
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmailAndPassword(credentials: RegisterCredentials): Promise<FirebaseUser> {
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

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // If popup is blocked or closed by user, try redirect method
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.log('Popup blocked or closed, trying redirect method...');
        return this.signInWithGoogleRedirect();
      }
      
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google using redirect (fallback for popup blocked)
   */
  async signInWithGoogleRedirect(): Promise<FirebaseUser> {
    try {
      await signInWithRedirect(auth, googleProvider);
      // The redirect will happen, so we won't reach this point
      throw new Error('Redirect initiated');
    } catch (error: any) {
      console.error('Error with Google redirect:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle redirect result (call this after page load)
   */
  async handleRedirectResult(): Promise<FirebaseUser | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        return result.user;
      }
      return null;
    } catch (error: any) {
      console.error('Error handling redirect result:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error: any) {
      console.error('Error confirming password reset:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify password reset code
   */
  async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      return await verifyPasswordResetCode(auth, code);
    } catch (error: any) {
      console.error('Error verifying password reset code:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user?: FirebaseUser): Promise<void> {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      await sendEmailVerification(currentUser);
    } catch (error: any) {
      console.error('Error sending email verification:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Get current user token
   */
  async getCurrentUserToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  /**
   * Refresh user token
   */
  async refreshUserToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken(true); // Force refresh
    } catch (error) {
      console.error('Error refreshing user token:', error);
      return null;
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Check if user email is verified
   */
  isEmailVerified(): boolean {
    return auth.currentUser?.emailVerified ?? false;
  }

  /**
   * Handle Firebase authentication errors
   */
  private handleAuthError(error: any): Error {
    let message = 'An authentication error occurred';
    
    switch (error.code) {
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
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
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operation not allowed';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      case 'auth/invalid-action-code':
        message = 'Invalid or expired action code';
        break;
      case 'auth/expired-action-code':
        message = 'Action code has expired';
        break;
      case 'auth/invalid-continue-uri':
        message = 'Invalid continue URL';
        break;
      case 'auth/unauthorized-continue-uri':
        message = 'Unauthorized continue URL';
        break;
             case 'auth/popup-blocked':
         message = 'Popup blocked by browser. Please allow popups and try again, or use the redirect method';
         break;
             case 'auth/popup-closed-by-user':
         message = 'Google sign-in was cancelled. Please try again or use email/password sign-in.';
         break;
      case 'auth/cancelled-popup-request':
        message = 'Popup request cancelled';
        break;
      case 'auth/requires-recent-login':
        message = 'Please sign in again to complete this action';
        break;
      default:
        if (error.message) {
          message = error.message;
        }
        break;
    }

    return new Error(message);
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      await user.delete();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Re-authenticate user (required for sensitive operations)
   */
  async reauthenticateWithEmailAndPassword(password: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      const credential = await signInWithEmailAndPassword(auth, user.email, password);
      // The reauthentication is successful if we get here
    } catch (error: any) {
      console.error('Error re-authenticating:', error);
      throw this.handleAuthError(error);
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
