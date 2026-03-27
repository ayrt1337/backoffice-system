<script setup lang="ts">
import { api } from '../services/api';
import { ref } from 'vue';
import Container from '../components/container.vue';
import router from '../router';

const user = ref<string>("");
const password = ref<string>("");

const handleLogin = async (): Promise<void> => {
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
    } catch (error) {
        console.error("Erro ao fazer login: ", error);
        // MOSTRAR ERRO
    }
}
</script>

<template>
    <Container>
        <div class="flex flex-col bg-[#cccccc] gap-2 rounded-[8px] text-center p-5">
            <div class="flex flex-col">
                <label for="user">Usuário</label>
                <input v-model="user" class="border" type="text" name="user" id="user">
            </div>

            <div class="flex flex-col">
                <label for="password">Senha</label>
                <input v-model="password" class="border" type="password" name="password" id="password">
            </div>

            <div class="flex flex-col mt-4">
                <input @click="handleLogin" class="border cursor-pointer" type="submit" value="Login">
            </div>
        </div>
    </Container>
</template>