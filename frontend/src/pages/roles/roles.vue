<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../../services/api';
import TemplatePage from '../../components/template-page.vue';
import { resources } from '../../config/resources';
import List from '../../components/list.vue';
import { verifyApiError } from '../../services/verifyApiError';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';

const { setUser } = useUser();
const { showLoadingPage } = useLoading();
const metadata = resources.roles;

const roles = ref<any>([]);

const loadData = async () => {
    showLoadingPage(true);
    try {
        const response = await api({
            url: "/roles",
            method: "get",
        });

        setUser(response.data.user);
        roles.value = response.data.roles;
    } catch (error: any) {
        console.error("Erro ao buscar cargos: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
};

onMounted(() => {
    loadData();
})
</script>

<template>
    <TemplatePage>
        <List 
            :data="roles"
            :label="metadata.label"
            :pluralLabel="metadata.pluralLabel"
            :labels="metadata.tableLabels"
            :resource="metadata.name"
            @reload="loadData"
        />
    </TemplatePage>
</template>
