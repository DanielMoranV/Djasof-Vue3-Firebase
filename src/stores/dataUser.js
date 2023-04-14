import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc } from 'firebase/firestore/lite';
import { db } from '../firebaseConfig';
import { defineStore } from 'pinia';
import { auth } from '../firebaseConfig';
import { nanoid } from 'nanoid';

export const useDataUserStore = defineStore('dataUserStore', {
    state: () => ({
        dataUser: [],
        loadingDataUser: false
    }),
    actions: {
        async getUsers() {
            if (this.dataUser.length === 0) {
                this.loadingDataUser = true;
                try {
                    const q = query(collection(db, 'users'));
                    const querySnapshot = await getDocs(q);
                    this.dataUser = querySnapshot.docs.map((doc) => {
                        return {
                            id: doc.id,
                            ...doc.data()
                        };
                    });
                } catch (error) {
                    console.log(error);
                } finally {
                    this.loadingDataUser = false;
                }
            }
        },
        async addUsers(name) {
            try {
                const objetoDoc = {
                    name: name,
                    short: nanoid(6),
                    user: auth.currentUser.uid
                };
                const docRef = await addDoc(collection(db, 'users'), objetoDoc);
                // console.log(docRef.id);
                this.documents.push({
                    ...objetoDoc,
                    id: docRef.id
                });
            } catch (error) {
                console.log(error);
            } finally {
                console.log('hola');
            }
        },
        async profileUser(id) {
            try {
                const docRef = doc(db, 'users', id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    throw new Error('No existe el usuario');
                }
                return docSnap.data();
            } catch (error) {
                console.log(error.message);
            } finally {
                console.log('Finalizada la carga de datos del perfil');
            }
        },
        async updateUser(id, data) {
            try {
                const docRef = doc(db, 'users', id);

                const docSpan = await getDoc(docRef);
                if (!docSpan.exists()) {
                    throw new Error('El usuario no existe');
                }

                await updateDoc(docRef, data);

                this.dataUser = this.dataUser.map((item) => (item.id === id ? { ...item, ...data } : item));
            } catch (error) {
                console.log(error.message);
            }
        },
        async deleteUser(id) {
            try {
                const docRef = doc(db, 'urls', id);

                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    throw new Error('no existe el doc');
                }

                if (docSnap.data().user !== auth.currentUser.uid) {
                    throw new Error('no le pertenece ese documento');
                }

                await deleteDoc(docRef);
                this.dataUser = this.dataUser.filter((item) => item.id !== id);
            } catch (error) {
                console.log(error.message);
            } finally {
                console.log('hola');
            }
        }
    }
});
