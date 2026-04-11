<script setup lang="ts">
import { api } from '../../services/api';
import { ref } from 'vue';
import Container from '../../components/container.vue';
import router from '../../router';
import Input from '../../components/input.vue';

const user = ref<string>("");
const password = ref<string>("");
const loading = ref<boolean>(false);
const errorMsg = ref<string>("");

const handleLogin = async (): Promise<void> => {
    if (!user.value || !password.value) {
        errorMsg.value = "Please fill in all fields.";
        return;
    }
    
    loading.value = true;
    errorMsg.value = "";
    
    try {
        const response = await api({
            url: "/login",
            method: "post",
            data: {
                name: user.value,
                password: password.value
            }
        });
        
        if (response.data) {
            router.push("/users");
        }
    } catch (error: any) {
        console.error("Erro ao fazer login: ", error);
        errorMsg.value = error.response?.data?.message || "Invalid credentials. Please try again.";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <Container class="bg-slate-50 font-sans">
        <div class="bg-white w-full max-w-[500px] py-12 px-15 rounded-[20px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-slate-100">
            <header class="text-center mb-10">
                <h1 class="text-[1.75rem] font-bold text-slate-800 tracking-tight">Backoffice System</h1>
            </header>

            <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
                <div v-if="errorMsg" class="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
                    {{ errorMsg }}
                </div>

                <Input 
                    label="Usuário"
                    v-model="user"
                />

                <Input 
                    label="Senha"
                    :password="true"     
                    v-model="password"
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

