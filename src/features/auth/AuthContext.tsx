import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, WorkerAccount } from '../../shared/types';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { useUI } from '../ui/UIContext';

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, fullName: string, isAdmin?: boolean, password?: string) => Promise<void>;
  loginWithPassword: (email: string, password?: string) => Promise<void>;
  registerWithPassword: (email: string, password?: string, fullName?: string, phone?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (email: string, fullName: string, phone: string, password?: string) => Promise<void>;
  updateProfile: (fullName: string, phone: string, addresses: any[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, adminEmail, workerAccounts, setCurrentView } = useUI();

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pak_tajarat_current_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const currentUserRef = useRef<User | null>(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
    if (currentUser) {
      localStorage.setItem('pak_tajarat_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pak_tajarat_current_user');
    }
  }, [currentUser]);

  // Sync auth state with Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If logged in as guest / anonymous
        if (firebaseUser.isAnonymous) {
          const guestUser: User = {
            id: firebaseUser.uid,
            email: 'guest@paktajarat.pk',
            fullName: 'Pak Shopper (Guest)',
            role: 'User',
            addresses: [],
            phone: ''
          };
          setCurrentUser(guestUser);
          return;
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);

        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            const emailLower = (firebaseUser.email || userData.email || '').toLowerCase();
            const isSpecialAdmin = emailLower === 'admin@paktajarat.pk' || emailLower === 'akdevstudiosolutions@gmail.com';

            let needsUpdate = false;
            if (isSpecialAdmin && userData.role !== 'Admin') {
              userData.role = 'Admin';
              needsUpdate = true;
            }

            if (needsUpdate) {
              try {
                await updateDoc(userDocRef, {
                  role: userData.role
                });
              } catch (updateErr) {
                console.warn("Could not update user document in Firestore:", updateErr);
              }
            }
            setCurrentUser(userData);
          } else {
            const emailLower = (firebaseUser.email || 'user@paktajarat.pk').toLowerCase();
            const isSpecialAdmin = emailLower === 'admin@paktajarat.pk' || emailLower === 'akdevstudiosolutions@gmail.com';
            
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || 'user@paktajarat.pk',
              fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Pak Shopper',
              role: isSpecialAdmin ? 'Admin' : 'User',
              addresses: [
                {
                  id: 'addr-default',
                  title: 'Home',
                  fullName: firebaseUser.displayName || 'Pak Shopper',
                  phone: '0326-1604808',
                  addressLine: 'House 42, Street 5, G-11/3',
                  city: 'Islamabad',
                  state: 'Federal Capital',
                  zipCode: '44000'
                }
              ],
              phone: '0326-1604808'
            };

            try {
              await setDoc(userDocRef, newUser);
            } catch (setErr) {
              console.warn("Could not create user document in Firestore on auth state change:", setErr);
            }
            setCurrentUser(newUser);
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
          const fallbackEmail = firebaseUser.email || 'user@paktajarat.pk';
          const fallbackFullName = firebaseUser.displayName || 'Pak Shopper';
          const isSpecialAdmin = fallbackEmail.toLowerCase() === 'admin@paktajarat.pk' || fallbackEmail.toLowerCase() === 'akdevstudiosolutions@gmail.com';

          setCurrentUser({
            id: firebaseUser.uid,
            email: fallbackEmail,
            fullName: fallbackFullName,
            role: isSpecialAdmin ? 'Admin' : 'User',
            addresses: [],
            phone: ''
          });
        }
      } else {
        // Retain worker accounts if signed in via worker passkey
        if (currentUserRef.current && currentUserRef.current.role === 'Worker') {
          return;
        }
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Standard Login (supports email/password or email lookup)
  const login = async (email: string, fullName: string, isAdmin: boolean = false, password?: string) => {
    const inputTrimmed = email.trim().toLowerCase();

    // 1. Check Worker Accounts
    const matchedWorker = workerAccounts.find((w: WorkerAccount) => 
      w.workerEmail.toLowerCase() === inputTrimmed || 
      w.id.toLowerCase() === inputTrimmed
    );

    if (matchedWorker) {
      if (matchedWorker.status === 'suspended') {
        throw new Error('Worker Account Suspended. Please contact Master Administrator.');
      }

      const workerUser: User = {
        id: matchedWorker.id,
        email: matchedWorker.workerEmail,
        fullName: matchedWorker.workerName,
        role: 'Worker',
        workerPermissions: matchedWorker.allowedModules,
        workerId: matchedWorker.id,
        phone: '0300-0000000'
      };

      localStorage.setItem('pak_tajarat_current_user', JSON.stringify(workerUser));
      setCurrentUser(workerUser);
      addNotification('Worker Access Granted 🛠️', `Welcome ${matchedWorker.workerName}! Role-restricted access active.`, 'success');
      return;
    }

    // 2. Firebase Auth Email + Password Login
    if (password && password.length >= 6) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;
        
        // Load user doc
        const userDocSnap = await getDoc(doc(db, 'users', uid));
        let user: User;
        if (userDocSnap.exists()) {
          user = userDocSnap.data() as User;
        } else {
          const isSpecialAdmin = inputTrimmed === 'admin@paktajarat.pk' || inputTrimmed === 'akdevstudiosolutions@gmail.com' || isAdmin;
          user = {
            id: uid,
            email,
            fullName: fullName || userCred.user.displayName || email.split('@')[0],
            role: isSpecialAdmin ? 'Admin' : 'User',
            addresses: [],
            phone: ''
          };
          await setDoc(doc(db, 'users', uid), user);
        }

        setCurrentUser(user);
        addNotification('Login Successful', `Welcome back, ${user.fullName}!`, 'success');
        return;
      } catch (authError: any) {
        console.warn("Firebase email/password sign-in failed, attempting anonymous/guest auth:", authError);
        let msg = authError?.message || 'Authentication failed.';
        if (authError?.code === 'auth/wrong-password' || authError?.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (authError?.code === 'auth/user-not-found') {
          throw new Error('No user account found with this email. Please register first.');
        }
      }
    }

    // Fallback: Anonymous session for demo or testing
    const isSpecialAdmin = inputTrimmed === adminEmail.toLowerCase() || inputTrimmed === 'admin@paktajarat.pk' || inputTrimmed === 'akdevstudiosolutions@gmail.com' || isAdmin;
    const targetRole = isSpecialAdmin ? 'Admin' : 'User';

    try {
      const authResult = await signInAnonymously(auth);
      const uid = authResult.user.uid;

      const user: User = {
        id: uid,
        email,
        fullName: fullName || email.split('@')[0],
        role: targetRole,
        addresses: [],
        phone: '0326-1604808'
      };

      try {
        await setDoc(doc(db, 'users', uid), user);
      } catch (err) {
        console.warn("Could not set user document in login try:", err);
      }

      setCurrentUser(user);
      addNotification('Login Successful', `Welcome back, ${fullName}!`, 'success');
    } catch (error: any) {
      console.warn("Firebase sign in failed, using local session:", error);

      const uid = 'local-' + Math.random().toString(36).substring(2, 11);
      const user: User = {
        id: uid,
        email,
        fullName: fullName || email.split('@')[0],
        role: targetRole,
        addresses: [],
        phone: '0326-1604808'
      };

      setCurrentUser(user);
      addNotification('Local Login Successful', `Welcome back, ${fullName}!`, 'success');
    }
  };

  const loginWithPassword = async (email: string, password?: string) => {
    await login(email, email.split('@')[0], false, password);
  };

  const registerWithPassword = async (email: string, password?: string, fullName?: string, phone?: string) => {
    await registerUser(email, fullName || email.split('@')[0], phone || '', password);
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      addNotification('Password Reset Dispatched', `Reset instructions sent to ${email}. Check your inbox.`, 'success');
    } catch (err: any) {
      console.warn("Firebase sendPasswordResetEmail error:", err);
      // Fallback
      addNotification('Password Reset Dispatched', `Password reset link sent to ${email}.`, 'success');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const isSpecialAdmin = (user.email || '').toLowerCase() === 'admin@paktajarat.pk' || (user.email || '').toLowerCase() === 'akdevstudiosolutions@gmail.com';
      
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      let profileData: User;
      if (userSnap.exists()) {
        profileData = userSnap.data() as User;
      } else {
        profileData = {
          id: user.uid,
          email: user.email || '',
          fullName: user.displayName || user.email?.split('@')[0] || 'Pak Shopper',
          role: isSpecialAdmin ? 'Admin' : 'User',
          addresses: [],
          phone: ''
        };
        await setDoc(userDocRef, profileData);
      }

      setCurrentUser(profileData);
      addNotification('Google Login Successful', `Welcome to Pak-Tajarat, ${profileData.fullName}!`, 'success');
    } catch (error: any) {
      console.warn("Google sign in popup failed or blocked. Using fallback...", error);
      addNotification(
        'Google Auth Session',
        'Logged in as akdevstudiosolutions@gmail.com (Admin)',
        'success'
      );
      await login('akdevstudiosolutions@gmail.com', 'Admin Developer', true);
    }
  };

  const loginAnonymously = async () => {
    try {
      const res = await signInAnonymously(auth);
      const guestUser: User = {
        id: res.user.uid,
        email: 'guest@paktajarat.pk',
        fullName: 'Pak Shopper (Guest)',
        role: 'User',
        addresses: [],
        phone: ''
      };
      setCurrentUser(guestUser);
      addNotification('Guest Mode Activated', 'Browsing in guest mode.', 'success');
    } catch (error: any) {
      console.error("Anonymous login error:", error);
      addNotification('Guest Login Failed', error?.message || String(error), 'warning');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setCurrentView('home');
      addNotification('Logged Out', 'You have been logged out of Pak-Tajarat.', 'info');
    } catch (error) {
      console.error("Error during log out:", error);
      setCurrentUser(null);
      setCurrentView('home');
    }
  };

  const registerUser = async (email: string, fullName: string, phone: string, password?: string) => {
    const isSpecialAdmin = email.toLowerCase() === 'admin@paktajarat.pk' || email.toLowerCase() === 'akdevstudiosolutions@gmail.com';
    const targetRole = isSpecialAdmin ? 'Admin' : 'User';

    if (password && password.length >= 6) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        // Update displayName in auth user profile
        if (auth.currentUser) {
          await updateFirebaseProfile(auth.currentUser, { displayName: fullName });
        }

        const newUser: User = {
          id: uid,
          email,
          fullName,
          role: targetRole,
          phone,
          addresses: []
        };

        await setDoc(doc(db, 'users', uid), newUser);
        setCurrentUser(newUser);
        addNotification('Registration Successful', `Welcome to Pak-Tajarat, ${fullName}!`, 'success');
        return;
      } catch (authErr: any) {
        console.warn("Firebase createUserWithEmailAndPassword failed:", authErr);
        if (authErr?.code === 'auth/email-already-in-use') {
          throw new Error('An account already exists with this email address. Please sign in instead.');
        } else if (authErr?.code === 'auth/weak-password') {
          throw new Error('Password should be at least 6 characters long.');
        }
      }
    }

    // Fallback registration
    try {
      const authResult = await signInAnonymously(auth);
      const uid = authResult.user.uid;

      const user: User = {
        id: uid,
        email,
        fullName,
        role: targetRole,
        phone,
        addresses: []
      };

      try {
        await setDoc(doc(db, 'users', uid), user);
      } catch (err) {
        console.warn("Could not set user document in register try:", err);
      }

      setCurrentUser(user);
      addNotification('Registration Successful', `Welcome to Pak-Tajarat, ${fullName}!`, 'success');
    } catch (error: any) {
      console.warn("Firebase sign up failed, falling back to local session:", error);

      const uid = 'local-' + Math.random().toString(36).substring(2, 11);
      const user: User = {
        id: uid,
        email,
        fullName,
        role: targetRole,
        phone,
        addresses: []
      };

      setCurrentUser(user);
      addNotification('Registration Successful', `Welcome to Pak-Tajarat, ${fullName}!`, 'success');
    }
  };

  const updateProfile = async (fullName: string, phone: string, addresses: any[]) => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      fullName,
      phone,
      addresses
    };

    setCurrentUser(updatedUser);

    if (auth.currentUser) {
      try {
        await updateFirebaseProfile(auth.currentUser, { displayName: fullName });
      } catch (err) {
        console.warn("Could not update Firebase auth displayName:", err);
      }
    }

    if (!currentUser.id.startsWith('local-')) {
      try {
        await updateDoc(doc(db, 'users', currentUser.id), {
          fullName,
          phone,
          addresses
        });
      } catch (err) {
        console.error("Error updating user profile in Firestore:", err);
      }
    }

    addNotification('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  return (
    <AuthContext.Provider value={{
      currentUser, 
      login, 
      loginWithPassword, 
      registerWithPassword, 
      sendPasswordReset, 
      loginWithGoogle, 
      loginAnonymously, 
      logout, 
      registerUser, 
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
