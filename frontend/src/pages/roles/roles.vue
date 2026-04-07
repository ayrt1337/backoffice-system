<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../../services/api';
import TemplatePage from '../../components/template-page.vue';
import { resources } from '../../config/resources';
import List from '../../components/list.vue';

const metadata = resources.roles;

const roles = ref<any>([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const response = await api({
            url: "/roles",
            method: "get",
        });
        
        if (response.status === 200) {
            roles.value = response.data.roles;
        }
    } catch (error) {
        console.error("Erro ao buscar cargos: ", error);
    } finally {
        loading.value = false;
    }
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
        />
    </TemplatePage>
</template>
