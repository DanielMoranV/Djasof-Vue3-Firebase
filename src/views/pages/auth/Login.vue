<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import { useUserStore } from '../../../stores/auth';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const router = useRouter();
const { layoutConfig, contextPath } = useLayout();
const email = ref('');
const password = ref('');

const userStore = useUserStore();
const toast = useToast();

const login = async () => {
    // Verificar si el correo electrónico y la contraseña son campos requeridos
    if (!email.value || !password.value) {
        return toast.add({ severity: 'warn', summary: 'Por favor complete los campos requeridos', life: 3000 });
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
    const error = await userStore.loginUser(email.value, password.value);
    if (!error) {
        // Mostrar el toast
        toast.add({ severity: 'success', summary: 'Validación Correcta Bienvenido', life: 3000 });
        if (userStore.sessionUser) {
            router.push('/dashboard');
        }
        return null;
    }

    switch (error) {
        case 'auth/user-not-found':
            toast.add({ severity: 'warn', summary: 'No existe el correo registrado', life: 3000 });
            break;
        case 'auth/wrong-password':
            toast.add({ severity: 'warn', summary: 'Error de contraseña', life: 3000 });
            break;
        default:
            toast.add({ severity: 'error', summary: 'Ocurrió un error en el servidor intentelo más tarde.', life: 3000 });
            break;
    }
};

const logoUrl = computed(() => {
    return `${contextPath}layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Bienvenido al Sistema</div>
                        <span class="text-600 font-medium">Inicie sesión para continuar</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="email" placeholder="Correo Electrónico" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="password" placeholder="Contraseña" :toggleMask="true" class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem" required :feedback="false" />

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <router-link to="/auth/register"> <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">No tiene usuario.? Registrarse</a> </router-link>
                        </div>

                        <Toast />
                        <Button label="Iniciar Sesión" class="w-full p-3 text-xl" @click="login"></Button>
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
