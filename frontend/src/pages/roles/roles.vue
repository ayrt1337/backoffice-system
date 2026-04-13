<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../../services/api';
import TemplatePage from '../../components/template-page.vue';
import { resources } from '../../config/resources';
import List from '../../components/list.vue';
import type { User } from '../../types/user';
import { verifyApiError } from '../../services/verifyApiError';

const metadata = resources.roles;

const user = ref<User>({
    name: ''
});

const roles = ref<any>([]);

onMounted(async () => {
    try {
        const response = await api({
            url: "/roles",
            method: "get",
        });

        user.value = response.data.user;
        roles.value = response.data.roles;
    } catch (error: any) {
        console.error("Erro ao buscar cargos: ", error);
        verifyApiError(error.response.status);
    } finally {
        // showLoading(false);
    }
})
</script>

<template>
    <TemplatePage :name="user.name">
        <List 
            :data="roles"
            :label="metadata.label"
            :pluralLabel="metadata.pluralLabel"
            :labels="metadata.tableLabels"
            :resource="metadata.name"
        />
    </TemplatePage>
</template>
