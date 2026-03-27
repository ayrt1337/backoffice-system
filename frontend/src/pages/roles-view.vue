<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../components/template-page.vue';
import { api } from '../services/api';

interface Props {
    name: string
};

const props = defineProps<Props>();

interface Module {
  name: string;
  label: string;
}

type ActionLabel = 'Visualizar' | 'Criar' | 'Editar' | 'Excluir';
type ActionSlug = 'read' | 'create' | 'update' | 'delete';
const actions: ActionLabel[] = ['Visualizar', 'Criar', 'Editar', 'Excluir'];

const role = ref<any>({});
const modules = ref<Module[]>([]);
const selectedPermissions = ref<string[]>([]);

onMounted(async () => {
    try {
        const response = await api({
            url: `/roles/${props.name}`,
            method: "get",
        });
        
        if (response.status === 200) {
            role.value = response.data.role;
            modules.value = response.data.resources;
            selectedPermissions.value = response.data.rolePermissions;
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro ao buscar cargos: ", error);
    }
})

const actionMap: Record<string, ActionSlug> = {
  'visualizar': 'read',
  'criar': 'create',
  'editar': 'update',
  'excluir': 'delete'
};

const hasPermission = (moduleSlug: string, actionLabel: ActionLabel): boolean => {
  const actionSlug = actionMap[actionLabel.toLowerCase()];
  return selectedPermissions.value.includes(`${moduleSlug}:${actionSlug}`);
};

const togglePermission = (moduleSlug: string, actionLabel: ActionLabel): void => {
  const actionSlug = actionMap[actionLabel.toLowerCase()];
  const fullSlug = `${moduleSlug}:${actionSlug}`;
  
  const index = selectedPermissions.value.indexOf(fullSlug);
  
  if (index > -1) {
    selectedPermissions.value.splice(index, 1);
  } else {
    selectedPermissions.value.push(fullSlug);
  }
};

const handleEdit = async () => {
    console.log(123)
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
            <thead>
                <tr class="border-b border-gray-200">
                <th class="py-4 px-4 font-semibold text-gray-700 uppercase text-sm">Funcionalidades</th>
                <th v-for="action in actions" :key="action" class="py-4 px-2 text-center font-semibold text-gray-700 text-sm">
                    {{ action }}
                </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="module in modules" :key="module.label" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-4 px-4 text-gray-600 font-medium">
                    {{ module.label }}
                </td>
                
                <td v-for="action in actions" :key="action" class="py-4 px-2 text-center">
                    <input 
                    type="checkbox" 
                    :checked="hasPermission(module.name, action) || props.name === 'admin'"
                    @change="togglePermission(module.name, action)"
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