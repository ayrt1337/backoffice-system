<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../services/api';
import TemplatePage from '../components/template-page.vue';
import router from '../router';

const roles = ref<any>();

onMounted(async () => {
    try {
        const response = await api({
            url: "/roles",
            method: "get",
        });
        
        if (response.status === 200) {
            roles.value = response.data.roles;
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro ao buscar cargos:", error);
    }
})
</script>

<template>
    <TemplatePage>
        <div class="mb-3">
            <p class="cursor-pointer" @click="router.push('/roles/create')">Criar Cargo</p>
        </div>

        <div>
            <div v-for="role in roles" class="flex border">
                <p @click="">Cargo: {{ role.name }}</p>
            </div>
        </div>
    </TemplatePage>
</template>