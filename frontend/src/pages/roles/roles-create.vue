<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Input from '../../components/input.vue';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';
import router from '../../router';
import { useLoading } from '../../composables/useLoading';
import BaseButton from '../../components/base-button.vue';
import type { RoleData } from '../../types/role';
import * as z from 'zod';

const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resourcesMetadata.roles;

const roleSchema = z.object({
    role: z.string().min(1, "O nome é obrigatório").min(3, "O nome deve ter pelo menos 3 caracteres")
});

const data = ref<RoleData>({
    role: "",
    rolePermissions: [],
    resources: []
});

const formErrors = ref<Record<string, string>>({});
const loadingBtn = ref<boolean>(false);

onMounted(async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: "/roles/create",
            method: "get",
        });
        
        data.value.resources = response.data.resources;
    } catch (error: any) {
        console.error("Erro ao buscar cargos:", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
})

const handleCreate = async () => {
    formErrors.value = {};
    const result = roleSchema.safeParse(data.value);
    if (!result.success) {
        result.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            if (!formErrors.value[field]) {
                formErrors.value[field] = issue.message;
            }
        });
        return;
    }

    loadingBtn.value = !loadingBtn.value;

    try {
        await api({
            url: "/roles/create",
            method: "post",
            data: {
                name: data.value.role,
                rolePermissions: data.value.rolePermissions
            }
        });

        await router.push("/roles?page=1");
        showToast("Cargo criado com sucesso!", "success", true);
    } catch (error: any) {
        console.error("Erro ao criar cargo: ", error);
        const apiMessage = error.response?.data;
        if (typeof apiMessage === 'string' && apiMessage.toLowerCase().includes('cargo')) {
            formErrors.value.role = apiMessage;
        } else {
            showToast(apiMessage || "Erro ao criar cargo", "error");
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
            <Input 
                label="Nome do Cargo"
                v-model="(data.role as string)"
                class="max-w-[400px] mt-8"
                :error=formErrors.role
            />

            <div class="mt-10">
                <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
            
                <CheckboxPanel 
                    role=""
                    :selected-permissions="data.rolePermissions"
                    :resources="data.resources"
                />
            </div>

            <BaseButton 
                @click="handleCreate()"
                :loading="loadingBtn"
                class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700"
            >
                Criar
            </BaseButton>
        </div>
    </TemplatePage>
</template>