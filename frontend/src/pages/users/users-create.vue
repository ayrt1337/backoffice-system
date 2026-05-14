<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import { resources } from '../../config/resources';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import Input from '../../components/input.vue';
import Dropdown from '../../components/dropdown.vue';
import type { UserMetadata } from '../../types/user';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';
import * as z from 'zod';
import router from '../../router';
import { useLoading } from '../../composables/useLoading';
import BaseButton from '../../components/base-button.vue';

const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resources.users;

const userSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório").min(3, "O nome deve ter pelo menos 3 caracteres"),
    role: z.string().min(1, "O cargo é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

const userData = ref<UserMetadata>({
    name: '',
    password: '',
    role: ''
});

const formErrors = ref<Record<string, string>>({});
const roles = ref<any>([]);
const loadingBtn = ref<boolean>(false);

const roleOptions = computed(() => {
    if (!Array.isArray(roles.value)) return [];
    return roles.value.map((role: any) => ({
        label: role.id,
        value: role.id
    }));
});

onMounted(async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: "/users/create",
            method: "get",
        });

        roles.value = response.data.roles;
    } catch (error: any) {
        console.error("Erro ao buscar cargos:", error);
        verifyApiError(error.response?.status);  
    } finally {
        showLoadingPage(false);
    }
})

const handleCreate = async () => {
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
            url: "/users/create",
            method: "post",
            data: {
                name: userData.value.name,
                password: userData.value.password,
                role: userData.value.role
            }
        });

        await router.push("/users?page=1");
        showToast("Usuário criado com sucesso!", "success", true);
    } catch (error: any) {
        console.error("Erro ao criar usuário: ", error);
        const apiMessage = error.response?.data;
        if (typeof apiMessage === 'string' && apiMessage.toLowerCase().includes('usuário')) {
            formErrors.value.name = apiMessage;
        } else {
            showToast(apiMessage || "Erro ao criar usuário", "error");
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
            :breadcrumbs="[...metadata.breadcrumbs, { label: 'Criar' }]"
        />

        <div class="mt-12">

            <Input 
                label="Usuário"
                v-model="userData.name"
                :error="formErrors.name"
                class="max-w-[400px]"
            />
            
            <Dropdown 
                label="Cargo"
                v-model="userData.role"
                :options="roleOptions"
                :error="formErrors.role"
                placeholder="Selecione um Cargo"
                class="max-w-[400px] mt-8"
            />

            <Input 
                label="Senha"
                v-model="userData.password"
                :error="formErrors.password"
                password
                class="max-w-[400px] mt-8"
            />

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