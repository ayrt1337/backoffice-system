<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Input from '../../components/input.vue';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';
import { useLoading } from '../../composables/useLoading';
import type { Role, RoleData } from '../../types/role';
import BaseButton from '../../components/base-button.vue';
import router from '../../router';
import * as z from 'zod';
import { useUser } from '../../composables/useUser';

const { showUser } = useUser();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resourcesMetadata.roles;

const roleSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório").min(3, "O nome deve ter pelo menos 3 caracteres")
});

interface Props {
    name: string
};

const props = defineProps<Props>();
const data = ref<Partial<RoleData>>({});
const formErrors = ref<Record<string, string>>({});
const loadingBtn = ref<boolean>(false);

const loadData = async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: `/roles/edit/${props.name}`,
            method: "get",
        });
        
        data.value = {
            role: response.data.role,
            rolePermissions: response.data.rolePermissions,
            resources: response.data.resources
        }
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

watch(() => props.name, () => {
    loadData();
});

const handleEdit = async () => {
    formErrors.value = {};
    const result = roleSchema.safeParse(data.value.role);
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
            url: `/roles/edit/${props.name}`,
            method: "patch",
            data: {
                roleName: (data.value.role as Role).name,
                permissions: data.value.rolePermissions
            }
        });

        await router.push(`/roles/${(data.value.role as Role).name}`);
        showToast("Cargo editado com sucesso!", "success", true);
    } catch (error: any) {
        console.error("Erro ao editar cargo: ", error);
        const apiMessage = error.response?.data;
        if (typeof apiMessage === 'string' && apiMessage.toLowerCase().includes('cargo')) {
            formErrors.value.name = apiMessage;
        } else {
            showToast(apiMessage || "Erro ao atualizar cargo", "error");
        }
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
};
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}`, path: `/roles/${name}` }, { label: 'Editar' },]"
        />

        <div class="mt-12">
            <template v-if="data.role">
                <Input 
                    label="Nome do Cargo"
                    v-model="(data.role as Role).name"
                    class="max-w-[400px] mt-8"
                    :disabled="data.role && (showUser.role === name || name === 'admin') ? true : false"
                    :error="formErrors.name"
                />

                <div class="mt-10">
                    <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
                
                    <CheckboxPanel 
                        :role="name"
                        :selected-permissions="data.rolePermissions || []"
                        :resources="data.resources || []"
                        :disabled="showUser.role === name"
                    />
                </div>

                <BaseButton
                    :disabled="data.role && (showUser.role === name || name === 'admin') ? true : false"
                    @click="handleEdit()"
                    :loading="loadingBtn"
                    class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700"
                >
                    Salvar
                </BaseButton>
            </template>

            <div v-else>
                <p class="text-[18px]">Cargo não encontrado</p>
            </div>
        </div>
    </TemplatePage>
</template>