import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const adminLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const isAdmin = await checkAdminRole(userCredential.user.uid);

    if (!isAdmin) {
      await signOut(auth);
      throw new Error("Akses tidak diizinkan. Hanya admin yang dapat login.");
    }

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const checkAdminRole = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() && userSnap.data().role === "admin";
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};

export const adminLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};
