<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import { resources } from '../../config/resources';
import List from '../../components/list.vue';
import { verifyApiError } from '../../services/verifyApiError';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';

const { setUser } = useUser();
const { showLoadingPage } = useLoading();
const metadata = resources.users;

const users = ref<any>([]);

onMounted(async () => {
    try {
        const response = await api({
            url: "/users",
            method: "get",
        });
        
        setUser(response.data.user);
        users.value = response.data.users;
    } catch (error: any) {
        console.error("Erro ao buscar usuários: ", error);
        verifyApiError(error.response.status);
    } finally {
        showLoadingPage(false);
    }
})
</script>

<template>
    <TemplatePage>
        <List 
            :data="users"
            :label="metadata.label"
            :pluralLabel="metadata.pluralLabel"
            :labels="metadata.tableLabels"
            :resource="metadata.name"
        />
    </TemplatePage>
</template>