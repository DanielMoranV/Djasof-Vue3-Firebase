<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useUserStore } from '../../../stores/auth';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const router = useRouter();
const { layoutConfig, contextPath } = useLayout();
const email = ref('');
const password = ref('');
const password1 = ref('');

const logoUrl = computed(() => {
    return `${contextPath}layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const userStore = useUserStore();
const toast = useToast();

const register = async () => {
    // Verificar si el correo electrónico y la contraseña son campos requeridos
    if (!email.value || !password.value || !password1.value) {
        return toast.add({ severity: 'warn', summary: 'Por favor complete los campos requeridos', life: 3000 });
    }

    // Verificar si las contraseñas son iguales
    if (password.value != password1.value) {
        return toast.add({ severity: 'warn', summary: 'Las contraseñas no coinciden', life: 3000 });
    }

    // Verificar si los campos contienen espacios en blanco
    if (/\s/.test(email.value) || /\s/.test(password.value)) {
        return toast.add({ severity: 'warn', summary: 'Los campos no pueden contener espacios en blanco', life: 3000 });
    }

    // Verificar si la contraseña tiene al menos 6 caracteres
    if (password.value.length < 6) {
        return toast.add({ severity: 'warn', summary: 'La contraseña debe tener al menos 6 caracteres', life: 3000 });
    }

    // Verificar si el correo electrónico es un correo electrónico válido
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.value)) {
        return toast.add({ severity: 'warn', summary: 'El correo electrónico no es válido', life: 3000 });
    }
    const error = await userStore.registerUser(email.value, password.value);
    if (!error) {
        toast.add({ severity: 'success', summary: 'Registrado correctamente, Verifica tu correo para la validación', life: 4000 });
        // Retrasar la redirección por 3 segundos (3000 ms)
        setTimeout(() => {
            if (userStore.sessionUser) {
                router.push('/');
            }
        }, 3000);

        return null;
    }

    switch (error) {
        case 'auth/email-already-in-use':
            toast.add({ severity: 'warn', summary: 'Email ya registrado en nuestro sistema', life: 3000 });
            break;
        case 'auth/wrong-password':
            toast.add({ severity: 'warn', summary: 'Error de contraseña', life: 3000 });
            break;
        default:
            toast.add({ severity: 'error', summary: 'Ocurrió un error en el servidor intentelo más tarde.', life: 3000 });
            break;
    }
};
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-6 px-4 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Registrarse</div>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                        <label for="password" class="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password" v-model="password" placeholder="Contraseña" :toggleMask="true" class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem"></Password>

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Confirmar Contraseña</label>
                        <Password id="password1" v-model="password1" placeholder="Confirmar Contraseña" :toggleMask="true" class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem"></Password>

                        <div class="text-center mt-5">
                            <Toast />
                            <Button label="Registrarse" class="p-button-success w-full text-xl mb-2" @click="register"></Button>
                            <router-link to="/"><Button label="Cancelar" class="w-full text-xl"></Button></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
