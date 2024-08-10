<template>
  <div>
    <div id="pianoContainer" ref="pianoContainer"></div>
  </div>
</template>

<script>
import { Instrument } from "piano-chart";

export default {
  name: "PianoChart",
  data() {
    return {
      piano: null
    };
  },
  props: {
    sequence: {
      type: Array,
      default: () => {
        return [];
      },
    },
    interval: {
      type: Number,
      default: 200,
    },
  },
  methods: {
    test() {
      this.piano.destroy()
      this.piano = new Instrument(this.$refs.pianoContainer);
      this.piano.create();
      // this.clearAllNotes();
      const p  = this.piano
      const s = this.sequence
      for (let i = 0; i < this.sequence.length; i++) {
        setTimeout(function () {
          p.keyDown(s[i]);
        }, this.interval * i);
      }
    },
    clearAllNotes() {
      // console.log(this.sequence)
      if (this.sequence.length) {
        for (let i = 0; i < this.sequence.length; i++) {
          this.piano.keyUp(this.sequence[i]);
        }
      }
    },
  },
  watch: {
    sequence: {
      deep: true,
      handler: function (newValue, oldValue) {
        this.test();
      },
    },
  },
  mounted() {
    this.piano = new Instrument(this.$refs.pianoContainer);
    this.piano.create();
  },
};
</script>

<style lang="scss" scoped>
#pianoContainer{
  min-height: 200px;
}
</style>