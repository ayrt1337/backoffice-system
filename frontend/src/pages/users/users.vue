<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import { resources } from '../../config/resources';
import List from '../../components/list.vue';
import type { User } from '../../types/user';
import { verifyApiError } from '../../services/verifyApiError';

const metadata = resources.users;

const users = ref<any>([]);

const user =  ref<User>({
    name: ''
});

onMounted(async () => {
    try {
        const response = await api({
            url: "/users",
            method: "get",
        });
        
        user.value = response.data.user;
        users.value = response.data.users;
    } catch (error: any) {
        console.error("Erro ao buscar usuários: ", error);
        verifyApiError(error.response.status);
    } finally {
        // showLoading(false);
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