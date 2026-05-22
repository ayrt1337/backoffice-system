<script setup lang="ts">
import { api } from '../../services/api';
import { ref } from 'vue';
import Container from '../../components/container.vue';
import router from '../../router';
import Input from '../../components/input.vue';
import type { Error } from '../../types/error';
import ErrorMessage from '../../components/error-message.vue';
import type { UserMetadata } from '../../types/user';
import * as z from 'zod';

const loginSchema = z.object({
    name: z.string().min(1, "O usuário é obrigatório"),
    password: z.string().min(1, "A senha é obrigatória")
});

const errorData = ref<Error>({
    show: false,
    message: ""
});

const user = ref<Partial<UserMetadata>>({
    name: "",
    password: ""
});
const formErrors = ref<Record<string, string>>({});
const loading = ref<boolean>(false);

const handleLogin = async (): Promise<void> => {
    formErrors.value = {};
    const result = loginSchema.safeParse(user.value);

    if (!result.success) {
        result.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            if (!formErrors.value[field]) {
                formErrors.value[field] = issue.message;
            }
        });
        return;
    }

    loading.value = !loading.value;
    
    try {
        await api({
            url: "/login",
            method: "post",
            data: {
                name: user.value.name,
                password: user.value.password
            }
        });
        
        router.push("/home");
    } catch (error: any) {
        console.error("Erro ao fazer login: ", error);
        const apiMessage = error.response?.data;
        errorData.value = {
            show: true,
            message: apiMessage || "Ops! Algo deu errado"
        };
    } finally {
        loading.value = !loading.value;
    }
}
</script>

<template>
    <Container class="bg-slate-50 font-sans">
        <div class="max-[550px]:mx-5 max-[440px]:px-7 bg-white w-full max-w-[500px] max-[550px]:max-w-[400px] max-[550px]:px-10 py-12 px-15 rounded-[20px] border border-slate-100">
            <header class="text-center max-[550px]:mb-5 mb-8">
                <h1 class="max-[550px]:text-[22px] text-[1.75rem] font-bold text-slate-800 tracking-tight">Backoffice System</h1>
            </header>

            <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
                <ErrorMessage 
                    :show="errorData.show"
                    :message="errorData.message"
                    class="text-center"  
                />
                
                <Input 
                    label="Usuário"
                    v-model="user.name"
                    :error="formErrors.name"
                />

                <Input 
                    label="Senha"
                    :password="true"     
                    v-model="user.password"
                    :error="formErrors.password"
                />

                <button 
                    type="submit" 
                    :disabled="loading"
                    class="mt-2 p-3.5 rounded-xl bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 hover:shadow-blue-600/20 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span v-if="!loading">Login</span>
                    <span v-else class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
                </button>
            </form>
        </div>
    </Container>
</template>

