<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../../services/api';
import TemplatePage from '../../components/template-page.vue';
import { resources } from '../../config/resources';
import List from '../../components/list.vue';
import { verifyApiError } from '../../services/verifyApiError';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';
import FilterSidebar from '../../components/filter-sidebar.vue';
import Input from '../../components/input.vue';
import DateInput from '../../components/date-input.vue';

const { setUser } = useUser();
const { showLoadingPage } = useLoading();
const metadata = resources.roles;

const roles = ref<any>([]);

const isFilterOpen = ref<boolean>(false);
const filter = ref<any>({
    name: "",
    created_at: "",
    updated_at: ""
});

const loadData = async () => {
    showLoadingPage(true);
    try {
        const response = await api({
            url: "/roles",
            method: "get",
        });

        setUser(response.data.user);
        roles.value = response.data.data;
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

const resetFilters = (data: any) => {
    filter.value = { name: "", role: "", created_at: "", updated_at: "" };
    roles.value = data;
};

const applyFilters = (data: any) => {
    roles.value = data;
};
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
            @openFilter="isFilterOpen = true"
        />

        <FilterSidebar 
            v-model:isOpen="isFilterOpen" 
            @reset="resetFilters"
            @apply-filter="applyFilters"
            :resource="metadata.name"
            :data="filter"
        >
            <div class="flex flex-col gap-6">
                <Input 
                    label="Cargo"
                    v-model="filter.name"
                    placeholder="Ex: admin"
                />

                <DateInput 
                    label="Criação (A partir de)"
                    v-model="filter.created_at"
                />

                <DateInput 
                    label="Última Alteração (A partir de)"
                    v-model="filter.updated_at"
                />
            </div>
        </FilterSidebar>
    </TemplatePage>
</template>
