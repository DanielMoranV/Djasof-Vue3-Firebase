import { defineStore } from 'pinia';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore/lite';
import router from '../router';
import { useDataUserStore } from './dataUser';

export const useUserStore = defineStore('userStore', {
    state: () => ({
        authData: null,
        loadingUser: false,
        loadingSession: false,
        sessionUser: false
    }),
    actions: {
        async registerUser(email, password) {
            this.loadingUser = true;
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(auth.currentUser);
                // Todo Usuario registrado es un invitado.
                const position = 'Invitado';
                this.setUser(auth.currentUser, position);
                this.sessionUser = true;
            } catch (error) {
                console.log(error.code);
                return error.code;
            } finally {
                this.loadingUser = false;
            }
        },
        async updateUser(imagen) {
            this.loadingUser = true;
            try {
                if (imagen) {
                    const storageRef = ref(storage, `perfiles/${this.authData.uid}`);
                    console.log(imagen.originFileObj);
                    await uploadBytes(storageRef, imagen);
                    const photoURL = await getDownloadURL(storageRef);
                    await updateProfile(auth.currentUser, {
                        photoURL
                    });
                    console.log(auth.currentUser.uid);
                    // Actualizar la foto de perfil en la base de datos.
                    const docRef = doc(db, 'users', auth.currentUser.uid);
                    await setDoc(docRef, { photoURL }, { merge: true });
                }
            } catch (error) {
                console.log(error);
                return error.code;
            } finally {
                this.loadingUser = false;
            }
        },
        async setUser(user, position) {
            try {
                const docRef = doc(db, 'users', user.uid);

                this.authData = {
                    email: user.email,
                    uid: user.uid,
                    position
                };
                await setDoc(docRef, this.authData);
            } catch (error) {
                console.log(error);
            }
        },
        async loginUser(email, password) {
            this.loadingUser = true;
            try {
                await signInWithEmailAndPassword(auth, email, password);
                // Actualizar el estado del usuario en la base de datos.
                const docRef = doc(db, 'users', auth.currentUser.uid);
                await setDoc(docRef, { status: 'online' }, { merge: true });
                console.log('Usuario logueado');
                this.sessionUser = true;
            } catch (error) {
                console.log(error.code);
                return error.code;
            } finally {
                this.loadingUser = false;
            }
        },
        async logoutUser() {
            const databaseStore = useDataUserStore();
            databaseStore.$reset();
            try {
                // Actualizar el estado del usuario en la base de datos.
                const docRef = doc(db, 'users', auth.currentUser.uid);
                await setDoc(docRef, { status: 'offline' }, { merge: true });
                router.push('/');
                await signOut(auth);
            } catch (error) {
                console.log(error);
            }
        },
        currentUser() {
            return new Promise((resolve, reject) => {
                const unsuscribe = onAuthStateChanged(
                    auth,
                    async (user) => {
                        if (user) {
                            console.log(user);
                            // await this.setUser(user);
                            this.authData = {
                                email: user.email,
                                uid: user.uid,
                                displayName: user.displayName,
                                photoURL: user.photoURL
                            };
                        } else {
                            this.authData = null;
                            const databaseStore = useDataUserStore();
                            databaseStore.$reset();
                        }
                        resolve(user);
                    },
                    (e) => reject(e)
                );
                unsuscribe();
            });
        }
    }
});
