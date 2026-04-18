<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Input from '../../components/input.vue';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import type { Error } from '../../types/error';
import ErrorMessage from '../../components/error-message.vue';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';
import router from '../../router';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';

const { setUser } = useUser();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resourcesMetadata.roles;

interface Data {
    name: string,
    resources: any,
    rolePermissions: string[]
};

const data = ref<Data>({
    name: "",
    rolePermissions: [],
    resources: []
});

const errorData = ref<Error>({
    show: false,
    message: ''
});

const loadingBtn = ref<boolean>(false);

onMounted(async () => {
    try {
        const response = await api({
            url: "/roles/create",
            method: "get",
        });
        
        data.value.resources = response.data.resources;
        setUser(response.data.user);
    } catch (error: any) {
        console.error("Erro ao buscar cargos:", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
})

const handleCreate = async () => {
    if (!data.value.name) {
        errorData.value = {
            show: true,
            message: "Preencha os campos!"
        };
        return;
    }

    errorData.value = {
        show: false
    };

    loadingBtn.value = !loadingBtn.value;

    try {
        await api({
            url: "/roles/create",
            method: "post",
            data: {
                name: data.value.name,
                rolePermissions: data.value.rolePermissions
            }
        });

        showToast("Cargo criado com sucesso!", "success");
        router.push("/roles");
    } catch (error: any) {
        console.error("Erro ao criar cargo: ", error);
        const hasMessage = verifyApiError(error.response?.status, false);

        if (hasMessage) {
            errorData.value = {
                show: true,
                message: error.response?.data
            };
            return;
        }
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
}
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: 'Criar' },]"
        />

        <div class="mt-12">
            <ErrorMessage 
                :show="errorData.show"
                :message="errorData.message"
            />

            <Input 
                label="Nome do Cargo"
                v-model="data.name"
                class="max-w-[400px] mt-8"
            />

            <div class="mt-10">
                <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
            
                <CheckboxPanel 
                    role=""
                    :selected-permissions="data.rolePermissions"
                    :resources="data.resources"
                />
            </div>

            <button 
                @click="handleCreate()"
                :disabled="loadingBtn"
                class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span v-if="!loadingBtn">Criar</span>
                <span v-else class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
            </button>
        </div>
    </TemplatePage>
</template>