<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import { resources } from '../../config/resources';
import List from '../../components/list.vue';
import FilterSidebar from '../../components/filter-sidebar.vue';
import { verifyApiError } from '../../services/verifyApiError';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';
import Input from '../../components/input.vue';
import DateInput from '../../components/date-input.vue';

const { setUser } = useUser();
const { showLoadingPage } = useLoading();
const metadata = resources.users;

const users = ref<any>([]);
const isFilterOpen = ref<boolean>(false);

interface FilterProps {
    name: string,
    role: string,
    created_at: string,
    updated_at: string
};

const filter = ref<FilterProps>({
    name: "",
    role: "",
    created_at: "",
    updated_at: ""
});

const loadData = async () => {
    showLoadingPage(true);
    const urlQuery = new URLSearchParams(window.location.search).toString();
    try {
        const response = await getData(urlQuery);
        setUser(response.data.user);
    } catch (error: any) {
        console.error("Erro ao buscar usuários: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
};

onMounted(() => {
    loadData();
})

const resetFilters = async () => {
    filter.value = { name: "", role: "", created_at: "", updated_at: "" };
    await getData();
};

const getData = async (query = "") => {
    const response = await api({
        url: `/users${query ? "?" + query : query}`,
        method: "get",
    });

    users.value = response.data.data;
    return response;
};
</script>

<template>
    <TemplatePage>
        <List 
            :data="users"
            :label="metadata.label"
            :pluralLabel="metadata.pluralLabel"
            :labels="metadata.tableLabels"
            :resource="metadata.name"
            :reload="getData"
            :open-filter="() => isFilterOpen = true"
        />

        <FilterSidebar 
            :isOpen="isFilterOpen"
            :close="() => isFilterOpen = false"
            :reset="resetFilters"
            :apply-filter="getData"
            :resource="metadata.name"
            :data="filter"
        >
            <div class="flex flex-col gap-6">
                <Input 
                    label="Usuário"
                    v-model="filter.name"
                    placeholder="Ex: Ayrton"
                />

                <Input 
                    label="Cargo"
                    v-model="filter.role"
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