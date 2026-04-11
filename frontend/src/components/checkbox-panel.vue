<script setup lang="ts">
interface Props {
    role: any,
    resources: any,
    selectedPermissions: string[],
    disabled?: boolean,
};

const props = defineProps<Props>();

const hasPermission = (slug: string): boolean => {
  return props.selectedPermissions.includes(slug);
};

const togglePermission = (slug: string): void => {  
  const index = props.selectedPermissions.indexOf(slug);
  
  if (index > -1) {
    props.selectedPermissions.splice(index, 1);
  } else {
    props.selectedPermissions.push(slug);
  }
};
</script>

<template>
    <div>
        <div class="p-6 overflow-x-auto mt-3 bg-white rounded-lg border border-gray-200">
            <table class="w-full text-left border-collapse">
            <tbody>
                <tr v-for="resource in resources" :key="resource.label" class="border-b border-gray-50">
                <td class="py-4 px-4 text-gray-600 font-medium">
                    {{ resource.label }}
                </td>
                    
                <td v-for="action in resource.actions" :key="action" class="py-4 px-2 text-center">
                    <p>{{ action.label }}</p>

                    <input 
                        type="checkbox" 
                        :checked="hasPermission(action.slug) || props.role.name === 'admin'"
                        @change="togglePermission(action.slug)"
                        :disabled="disabled || props.role.name === 'admin' ? true : false"
                        class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                    />
                </td>
                </tr>
            </tbody>
            </table>
        </div>
    </div>
</template>