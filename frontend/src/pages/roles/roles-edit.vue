<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Input from '../../components/input.vue';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import type { User } from '../../types/user';
import type { Error } from '../../types/error';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';
import ErrorMessage from '../../components/error-message.vue';
import { useLoading } from '../../composables/useLoading';

const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resourcesMetadata.roles;

interface Data {
    role: string,
    rolePermissions: string[],
    resources: any
}

interface Props {
    name: string
};

const props = defineProps<Props>();

const user = ref<User>({
    name: ""
});

const data = ref<Data>({
    role: "",
    rolePermissions: [],
    resources: []
});

const errorData = ref<Error>({
    show: false,
    message: ""
});

const loadingBtn = ref<boolean>(false);

onMounted(async () => {
    try {
        const response = await api({
            url: `/roles/edit/${props.name}`,
            method: "get",
        });
        
        data.value = {
            role: response.data.role.name,
            rolePermissions: response.data.rolePermissions,
            resources: response.data.resources
        }

        user.value = response.data.user;
    } catch (error: any) {
        console.error("Erro ao buscar cargos: ", error);
        verifyApiError(error.response.status);
    } finally {
        showLoadingPage(false);
    }
})

const handleEdit = async () => {
    if (!data.value.role) {
        errorData.value = {
            show: true,
            message: "Preencha os campos!"
        };
        return;
    }
    
    errorData.value = {
        show: false,
    };

    loadingBtn.value = !loadingBtn.value;

    try {
        await api({
            url: `/roles/edit/${props.name}`,
            method: "patch",
            data: {
                roleName: data.value.role,
                permissions: data.value.rolePermissions
            }
        });
        
        showToast("Cargo editado com sucesso!", "success");
    } catch (error: any) {
        console.error("Erro ao buscar cargos: ", error);
        const hasMessage = verifyApiError(error.response.status, false);

        if (hasMessage) {
            errorData.value = {
                show: true,
                message: error.response.data
            };
            return;
        }
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
};
</script>

<template>
    <TemplatePage :name="user.name">
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}`, path: `/roles/${name}` }, { label: 'Editar' },]"
        />

        <div class="mt-15">
            <ErrorMessage 
                :show="errorData.show"
                :message="errorData.message"
            />

            <Input 
                label="Nome do Cargo"
                v-model="data.role"
                class="max-w-[400px] mt-8"
                :disabled="name === 'admin' ? true : false"
            />

            <div class="mt-10">
                <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
            
                <CheckboxPanel 
                    :role="name"
                    :selected-permissions="data.rolePermissions"
                    :resources="data.resources"
                />
            </div>

            <button 
                @click="handleEdit()"
                :disabled="loadingBtn"
                class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span v-if="!loadingBtn">Salvar</span>
                <span v-else class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
            </button>
        </div>
    </TemplatePage>
</template>