<template>
  <div>
    <label
      v-if="label"
      :for="$attrs.id"
      class="block text-sm font-medium text-gray-700"
      >{{ label }}</label
    >
    <div class="mt-1 relative rounded-md shadow-md">
      <input
        :id="$attrs.id"
        :value="modelValue"
        type="text"
        @input="updateInput"
        class="
          block
          w-full
          pr-10
          border-gray-300
          text-gray-900
          focus:outline-none focus:ring-gray-500 focus:border-gray-500
          sm:text-sm
          rounded-md
        "
        :placeholder="$attrs.placeholder"
        :class="$attrs.class"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: () => "",
      required: true,
    },
    label: {
      type: String,
      default: () => "",
      required: false,
    },
  },
  emits: ["update:modelValue"],
  setup(_, { emit }) {
    const updateInput = (event) => {
      emit("update:modelValue", event.target.value);
    };

    return {
      updateInput,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>