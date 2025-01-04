<template>
  <section
    v-if="props.loading"
  >
    <q-markup-table>
      <thead>
        <tr>
          <th
            class="text-left"
            style="width: 150px"
          >
            <q-skeleton
              animation="blink"
              type="text"
            />
          </th>
          <th class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
            />
          </th>
          <th class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
            />
          </th>
          <th class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
            />
          </th>
          <th class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
            />
          </th>
          <th class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
            />
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="n in 5"
          :key="n"
        >
          <td class="text-left">
            <q-skeleton
              animation="blink"
              type="text"
              width="85px"
            />
          </td>
          <td class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
              width="50px"
            />
          </td>
          <td class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
              width="35px"
            />
          </td>
          <td class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
              width="65px"
            />
          </td>
          <td class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
              width="25px"
            />
          </td>
          <td class="text-right">
            <q-skeleton
              animation="blink"
              type="text"
              width="85px"
            />
          </td>
        </tr>
        <slot />
      </tbody>
    </q-markup-table>
  </section>
</template>

<script setup>
let props = defineProps({
  loading: {
    type: Boolean,
    required: false,
    default: true
  }
});
</script>

