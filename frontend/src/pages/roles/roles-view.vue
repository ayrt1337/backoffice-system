<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';

interface Props {
    name: string
};

const props = defineProps<Props>();

const role = ref<any>({});
const resources = ref<any[]>([]);
const selectedPermissions = ref<string[]>([]);

onMounted(async () => {
    try {
        const response = await api({
            url: `/roles/${props.name}`,
            method: "get",
        });
        
        if (response.status === 200) {
            role.value = response.data.role;
            resources.value = response.data.resources;
            selectedPermissions.value = response.data.rolePermissions;
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro ao buscar cargos: ", error);
    }
})

const hasPermission = (slug: string): boolean => {
  return selectedPermissions.value.includes(slug);
};

const togglePermission = (slug: string): void => {  
  const index = selectedPermissions.value.indexOf(slug);
  
  if (index > -1) {
    selectedPermissions.value.splice(index, 1);
  } else {
    selectedPermissions.value.push(slug);
  }
};

const handleEdit = async () => {
    try {
        const response = await api({
            url: `/roles/${props.name}`,
            method: "post",
            data: {
                permissions: selectedPermissions.value
            }
        });
        
        if (response.status === 200) {
            
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro ao buscar cargos: ", error);
    }
};
</script>

<template>
    <TemplatePage>
        <div class="flex flex-col">
            <label for="name">Nome Cargo</label>
            <input v-model="role.name" class="border" type="text" name="name" id="name">
        </div>

        <div class="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <table class="w-full text-left border-collapse">
            <tbody>
                <tr v-for="resource in resources" :key="resource.label" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-4 px-4 text-gray-600 font-medium">
                    {{ resource.label }}
                </td>
                
                <td v-for="action in resource.actions" :key="action" class="py-4 px-2 text-center">
                    <p>{{ action.label }}</p>

                    <input 
                    type="checkbox" 
                    :checked="hasPermission(action.slug) || props.name === 'admin'"
                    @change="togglePermission(action.slug)"
                    class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                    />
                </td>
                </tr>
            </tbody>
            </table>
        </div>

        <div class="flex flex-col mt-4">
            <input @click="handleEdit()" class="border cursor-pointer" type="submit" value="Salvar">
        </div>
    </TemplatePage>
</template>