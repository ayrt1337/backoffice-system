<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../components/template-page.vue';
import { api } from '../services/api';
import router from '../router';

const users = ref<any>([]);

onMounted(async () => {
    try {
        const response = await api({
            url: "/users",
            method: "get",
        });
        
        if (response.status === 200) {
            users.value = response.data.users;
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
        // MOSTRAR ERRO
    }
})
</script>

<template>
    <TemplatePage>
        <div class="mb-3">
            <p class="cursor-pointer" @click="router.push('/users/create')">Criar Usuário</p>
        </div>

        <div>
            <div v-for="user in users" class="flex border">
                <p>Usuário: {{ user.name }}</p>
                <p class="ml-5">Cargo: {{ user.role.name }}</p>
            </div>
        </div>
    </TemplatePage>
</template>