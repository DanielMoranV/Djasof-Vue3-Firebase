<script setup>
import { useUserStore } from '../../stores/auth';
import { useDataUserStore } from '../../stores/dataUser';
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import ProgressBar from 'primevue/progressbar';
import { auth } from '../../firebaseConfig';

const userStore = useUserStore();
const dataUserStore = useDataUserStore();
const toast = useToast();
const dataProfile = ref({
    name: '',
    surname: '',
    dni: '',
    email: '',
    phone: '',
    position: ''
});
const timestamp = ref(Date.now()); // Obtén el timestamp actual
const showProgress = ref(false); // Bandera para mostrar el progreso

// Variable para almacenar la imagen seleccionada
const selectedImage = ref(null);

// Manejar el cambio de archivo
const onFileChange = (event) => {
    const file = event.target.files[0];
    // Comprobar si el archivo es una imagen y no excede los 2MB
    if (file && /\.(jpg|png)$/i.test(file.name) && file.size <= 2 * 1024 * 1024) {
        selectedImage.value = file;
    } else {
        toast.add({ severity: 'warn', summary: 'Error', detail: 'Por favor selecciona una imagen JPG o PNG que no supere los 2MB.' });
    }
    console.log(file);
};
// Actualizar datos de usuario
const updateProfileData = async () => {
    try {
        await dataUserStore.updateUser(auth.currentUser.uid, dataProfile.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Los datos de usuario se han actualizado correctamente.', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Ha ocurrido un error al actualizar los datos de usuario.', life: 3000 });
        console.log(error);
    }
};

// Actualizar foto de perfil
const updateProfilePhoto = async () => {
    if (selectedImage.value) {
        // Muestra el progreso
        showProgress.value = true;

        try {
            await userStore.updateUser(selectedImage.value);
            // Espera a que loadingUser sea falso
            //await userStore.loadingUser;
            // Actualiza el timestamp para invalidar la caché de la imagen
            timestamp.value = Date.now();
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'La foto de perfil se ha actualizado correctamente.', life: 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Ha ocurrido un error al actualizar la foto de perfil.', life: 3000 });
            console.log(error);
        } finally {
            // Oculta el progreso
            selectedImage.value = ref(null);
            showProgress.value = false;
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Error', detail: 'Por favor selecciona una imagen para actualizar la foto de perfil.', life: 3000 });
    }
};

// Cargar datos del perfil
onMounted(async () => {
    dataProfile.value = await dataUserStore.profileUser(auth.currentUser.uid);
});
</script>

<template>
    <div class="grid">
        <div class="col-12 md:col-7">
            <div class="card p-fluid">
                <h5>Datos de usuario</h5>
                <div class="field grid">
                    <label for="name" class="col-12 mb-2 md:col-2 md:mb-0">Nombre</label>
                    <div class="col-12 md:col-10">
                        <InputText id="name" type="text" v-model="dataProfile.name" />
                    </div>
                </div>
                <div class="field grid">
                    <label for="surname" class="col-12 mb-2 md:col-2 md:mb-0">Apellido</label>
                    <div class="col-12 md:col-10">
                        <InputText id="surname" type="text" v-model="dataProfile.surname" />
                    </div>
                </div>
                <div class="field grid">
                    <label for="dni" class="col-12 mb-2 md:col-2 md:mb-0">DNI</label>
                    <div class="col-12 md:col-10">
                        <InputText id="dni" type="number" v-model="dataProfile.dni" />
                    </div>
                </div>
                <div class="field grid">
                    <label for="phone" class="col-12 mb-2 md:col-2 md:mb-0">Teléfono</label>
                    <div class="col-12 md:col-10">
                        <InputText id="phone" type="number" v-model="dataProfile.phone" />
                    </div>
                </div>
                <div class="field grid">
                    <label for="position" class="col-12 mb-2 md:col-2 md:mb-0">Cargo</label>
                    <div class="col-12 md:col-10">
                        <InputText id="position" type="text" v-model="dataProfile.position" disabled />
                    </div>
                </div>
                <Button label="Actualizar Datos" icon="pi pi-save" class="p-button p-button-success mr-2 mb-2" @click="updateProfileData" />
            </div>
        </div>
        <div class="col-12 md:col-5">
            <div class="card p-fluid" style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 20%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img :src="userStore.authData.photoURL + '?v=' + timestamp" alt="Image" height="90" class="mb-3 avatar" />
                        <div class="text-900 text-2xl mb-3">
                            <p>{{ dataProfile.name }} {{ dataProfile.surname }}</p>
                        </div>
                        <div>
                            <!-- Actualización de perfil -->
                            <label for="fileInput" class="custom-file-upload"> <i class="pi pi-image" style="margin-right: 0.5rem"></i>Seleccionar Imagen </label>
                            <input id="fileInput" type="file" @change="onFileChange" accept=".jpg, .png" style="display: none" />
                            <span class="file-name-label" v-if="selectedImage" style="margin-left: 0.5rem; font-size: 14px">
                                {{ selectedImage.name }}
                            </span>

                            <Toast></Toast>
                            <Button label="Actualizar Foto de Perfil" icon="pi pi-upload" class="p-button p-button-success mr-2 mb-2" @click="updateProfilePhoto" :disabled="userStore.loadingUser"></Button>
                            <Dialog header="Subiendo archivo..." v-model:visible="showProgress" modal="true" append-to="body" :style="{ width: '30vw' }">
                                <ProgressBar mode="indeterminate"></ProgressBar>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.file-name-label {
    /* Estilos para el label que muestra el nombre de la imagen cargada */
    display: inline-block; /* Muestra el label en línea con el botón */
    margin-left: 1rem; /* Espaciado a la izquierda del label */
    font-size: 1rem; /* Tamaño de fuente del label */
    color: var(--primary-color); /* Color del texto del label */
}
.custom-file-upload {
    background-color: var(--primary-color); /* Color de fondo del botón */
    color: #ffffff; /* Color del texto del botón */
    padding: 0.5rem 1rem; /* Espaciado interno del botón */
    border-radius: 3rem; /* Radio de borde del botón */
    font-size: 1rem; /* Tamaño de fuente del botón */
    cursor: pointer; /* Cambia el cursor al pasar por encima del botón */
    transition: background-color 0.3s ease-in-out; /* Transición suave del color de fondo */
}

.custom-file-upload:hover {
    background-color: var(--hover-color); /* Cambia el color de fondo al pasar por encima del botón */
}

#fileInput {
    display: none; /* Oculta el input de tipo file por defecto */
}

.p-button-success {
    margin-top: 1rem; /* Espaciado superior del botón */
    font-size: 1rem; /* Tamaño de fuente del botón */
    transition: background-color 0.3s ease-in-out; /* Transición suave del color de fondo */
}

.p-button-success:hover {
    background-color: var(--success-hover-color); /* Cambia el color de fondo al pasar por encima del botón */
}
.avatar {
    height: 150px;
    width: 150px;
    background-repeat: no-repeat;
    background-position: 50%;
    border-radius: 50%;
    background-size: 100% auto;
}
</style>
