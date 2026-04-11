<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import { resources } from '../../config/resources';
import List from '../../components/list.vue';
import type { User } from '../../types/user';

const metadata = resources.users;

const users = ref<any>([]);
const loading = ref(true);

const user =  ref<User>({
    name: ''
});

onMounted(async () => {
    try {
        const response = await api({
            url: "/users",
            method: "get",
        });
        
        if (response.status === 200) {
            user.value = response.data.user;
            users.value = response.data.users;
        }
    } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
    } finally {
        loading.value = false;
    }
})
</script>

<template>
    <TemplatePage :name="user.name">
        <List 
            :data="users"
            :label="metadata.label"
            :pluralLabel="metadata.pluralLabel"
            :labels="metadata.tableLabels"
            :resource="metadata.name"
        />
    </TemplatePage>
</template>