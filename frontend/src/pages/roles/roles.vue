<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
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
const route = useRoute();
const metadata = resources.roles;

interface FilterProps {
    name: string,
    created_at: string,
    updated_at: string
};

const filter = ref<FilterProps>({
    name: "",
    created_at: "",
    updated_at: ""
});

const roles = ref<any>([]);
const pagination = ref<any>({ current_page: 1, last_page: 1 });
const isFilterOpen = ref<boolean>(false);

const loadData = async () => {
    showLoadingPage(true);
    const urlQuery = new URLSearchParams(route.query as Record<string, string>).toString();

    if (urlQuery) {
        var search = urlQuery;
        const filterObj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replaceAll('+', ' ') + '"}');
        delete filterObj["page"];
        filter.value = filterObj as FilterProps;
    }
    try {
        const response = await getData(urlQuery);
        setUser(response.data.user);
    } catch (error: any) {
        console.error("Erro ao buscar cargos: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
};

onMounted(() => {
    loadData();
});

const clearFilterFields = () => {
    filter.value = { name: "", created_at: "", updated_at: "" };
};

const resetFilters = async () => {
    clearFilterFields();
    await getData();
};

const getData = async (query = "") => {
    const response = await api({
        url: `/roles${query ? "?" + query : query}`,
        method: "get",
    });

    roles.value = response.data.data;
    pagination.value = {
        current_page: response.data.pagination.currentPage || 1,
        last_page: response.data.pagination.pages || 1
    };
    return response;
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
            :reload="getData"
            :open-filter="() => isFilterOpen = true"
            :load-data="loadData"
            :pagination="pagination"
        />

        <FilterSidebar 
            :isOpen="isFilterOpen"
            :close="() => isFilterOpen = false" 
            :reset="resetFilters"
            :apply-filter="getData"
            :resource="metadata.name"
            :data="filter"
            :clear-fields="clearFilterFields"
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
