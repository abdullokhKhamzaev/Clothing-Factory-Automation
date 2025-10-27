<script setup>
const props = defineProps({
  lists: {
    type: Array,
    required: true,
  }
})
</script>

<template>
  <div
    v-for="order in props.lists"
    :key="order.id"
  >
    <q-badge class="q-mb-xs" outline :color="order.status === 'accepted' ? 'green' : 'red' " :label="$t('statuses.' + order.status)" />
    <div class="text-bold">
      {{ order.productModel.name }}:
      <span
        v-for="size in order.productSize"
        :key="size"
        class="q-pl-xs text-primary"
      >
        {{ size.size }} : {{ size.quantity }},
      </span>
    </div>
    <div class="text-bold text-subtitle2 q-mt-xs rounded-borders	">
      {{ $t('tables.unripeMaterialOrder.columns.consumed') }}:
    </div>
    <div
      v-for="consume in order.outlayRipeMaterial"
      :key="consume"
    >
      <div>
        - {{ consume.cutterRipeMaterialWarehouse?.ripeMaterial?.name }} {{ Number(consume?.quantity) }} {{consume?.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
        <div>
          - {{$t('forms.modelOrder.fields.wasteSort1.label')}}: {{ Number(consume.wasteSort1) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
        </div>
      </div>
      <div v-if="Number(consume.quantitySort2)">
        - {{$t('forms.modelOrder.fields.consumedQuantitySort2.label')}}: {{ Number(consume.quantitySort2) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
        <div>
          - {{$t('forms.modelOrder.fields.wasteSort2.label')}}: {{ Number(consume.wasteSort2) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
        </div>
      </div>
      <div v-if="Number(consume.remainingSort1)">
        - {{$t('forms.modelOrder.fields.remainingSort1.label')}}: {{ Number(consume.remainingSort1) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
        <div>
          - {{$t('forms.modelOrder.fields.wasteRemainingSort1.label')}}: {{ Number(consume.wasteRemainingSort1) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
        </div>
      </div>
      <div v-if="Number(consume.remainingSort2)">
        - {{$t('forms.modelOrder.fields.remainingSort2.label')}}: {{ Number(consume.remainingSort2) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
        <div>
          - {{$t('forms.modelOrder.fields.wasteRemainingSort2.label')}}: {{ Number(consume.wasteRemainingSort1) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
        </div>
      </div>
      <div v-if="Number(consume.newRemainingSort1)">
        - {{$t('forms.modelOrder.fields.newRemainingSort1.label')}}: {{ Number(consume.newRemainingSort1) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
      </div>
      <div v-if="Number(consume.newRemainingSort2)">
        - {{$t('forms.modelOrder.fields.newRemainingSort2.label')}}: {{ Number(consume.newRemainingSort2) }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}
      </div>
      <div>
        Total: {{
          Number(consume.quantity) +
          Number(consume.wasteSort1) +
          Number(consume.quantitySort2) +
          Number(consume.wasteSort2) +
          Number(consume.remainingSort1) +
          Number(consume.wasteRemainingSort1) +
          Number(consume.remainingSort2) +
          Number(consume.wasteRemainingSort2) +
          Number(consume.newRemainingSort1) +
          Number(consume.newRemainingSort2)
        }} {{consume.cutterRipeMaterialWarehouse?.ripeMaterial?.measurement }}.
      </div>
    </div>
    <q-separator class="q-my-sm" />
  </div>
</template>
