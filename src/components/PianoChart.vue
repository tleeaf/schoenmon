<template>
  <div>
    <section id="pianoContainer"></section>
  </div>
</template>

<script>
import { Instrument } from "piano-chart";

export default {
  name: "PianoChart",
  data() {
    return {
      piano: null,
      noteSequence: [],
    };
  },
  props: {
      sequence: {
          type: Array,
          default: () => { return ["C3","G3"]} 
      },
      interval: {
          type: Number,
          default: 1000
      }
  },
  methods: {
    test() {
      for (let i = 0; i < this.sequence.length; i++) {
        setTimeout(function () {
          this.piano.keyDown(this.sequence);
        }, this.interval * i);
      }
    },
  },
  mounted() {
    this.piano = new Instrument(document.getElementById("pianoContainer"));
    this.piano.create();
  },
};
</script>

<style lang="scss" scoped>
</style>