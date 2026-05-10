<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useToast } from '../../composables/useToast';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import Input from '../../components/input.vue';
import { resources } from '../../config/resources';
import Dropdown from '../../components/dropdown.vue';
import type { UserMetadata } from '../../types/user';
import { verifyApiError } from '../../services/verifyApiError';
import { useLoading } from '../../composables/useLoading';
import BaseButton from '../../components/base-button.vue';
import router from '../../router';
import * as z from 'zod';

const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resources.users;

const userSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório").min(3, "O nome deve ter pelo menos 3 caracteres"),
    role: z.string().min(1, "O cargo é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal(''))
});

interface Roles {
    label: string,
    value: string
};

interface Props {
    name: string
};

const props = defineProps<Props>();
const userData = ref<Partial<UserMetadata>>({});
const formErrors = ref<Record<string, string>>({});
const roles = ref<Roles[]>([]);
const loadingBtn = ref<boolean>(false);

const roleOptions = computed(() => {
    if (!Array.isArray(roles.value)) return [];
    return roles.value.map((role: any) => ({
        label: role.name,
        value: role.name
      }));
});

const loadData = async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: `/users/edit/${props.name}`,
            method: 'get'
        });

        userData.value = {
            name: response.data.userData.name,
            role: response.data.userData.role.name,
            password: "",
            created_at: response.data.userData.created_at,
            updated_at: response.data.userData.updated_at
        };

        roles.value = response.data.roles;
    } catch (error: any) {
        console.error("Erro em buscar usuário: ", error);
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
    const result = userSchema.safeParse(userData.value);
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
            url: `/users/edit/${props.name}`,
            method: "patch",
            data: {
                userName: userData.value.name,
                roleName: userData.value.role,
                password: userData.value.password
            }
        });
        
        await router.push(`/users/${userData.value.name}`);
        showToast('Usuário atualizado com sucesso!', 'success', true);
    } catch (error: any) {    
        console.error("Erro ao editar usuário: ", error);
        const hasMessage = verifyApiError(error.response?.status, false);

        if (hasMessage) {
            const apiMessage = error.response?.data;
            if (typeof apiMessage === 'string' && apiMessage.toLowerCase().includes('usuário')) {
                formErrors.value.name = apiMessage;
            } else {
                showToast(apiMessage || "Erro ao atualizar usuário", "error");
            }
            return;
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
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}`, path: `/users/${name}` }, { label: 'Editar' },]"
        />

        <template v-if="userData.name != undefined">
            <div class="mt-12">
                <Input 
                    label="Usuário"
                    v-model="userData.name"
                    class="max-w-[400px]"
                    :error=formErrors.name
                />
                
                <Dropdown 
                    label="Cargo"
                    v-model="userData.role"
                    :options="roleOptions"
                    class="max-w-[400px] mt-8"
                    :error=formErrors.role
                />

                <Input 
                    label="Senha"
                    v-model="userData.password"
                    password
                    class="max-w-[400px] mt-8"
                    :error=formErrors.password
                />

                <BaseButton 
                    @click="handleEdit()"
                    :loading="loadingBtn"
                    class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700"
                >
                    Salvar
                </BaseButton>
            </div>
        </template>

        <div v-else>
            <p class="text-[18px]">Usuário não encontrado</p>
        </div>
    </TemplatePage>
</template>