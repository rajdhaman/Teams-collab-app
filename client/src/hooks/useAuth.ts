import { useEffect, useState, useRef } from "react";
import { auth } from "@services/firebase";
import { authService, User } from "@services/authService";
import { onAuthStateChanged } from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    // Check stored user first
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
    } else {
      setLoading(false);
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMountedRef.current) return;

      if (firebaseUser) {
        // Prevent multiple concurrent verification requests
        if (isVerifyingRef.current) return;
        isVerifyingRef.current = true;

        const token = await firebaseUser.getIdToken();
        authService.setStoredToken(token);

        try {
          const response = await authService.getMe();
          if (isMountedRef.current && response.success && response.data) {
            authService.setStoredUser(response.data);
            setUser(response.data);
            setError(null);
          }
        } catch (err) {
          if (isMountedRef.current) {
            const message =
              err instanceof Error ? err.message : "Failed to fetch user";
            setError(message);
            setUser(null);
            authService.logout();
          }
        } finally {
          isVerifyingRef.current = false;
        }
      } else {
        setUser(null);
        authService.logout();
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };
};
