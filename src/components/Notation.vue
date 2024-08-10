<template>
  <div>
    <!-- <button @click="createNotation">Recalc</button> -->
    <div ref="notation" id="boo"></div>
    
  </div>
</template>

<script>
import Vex from "vexflow";
import _ from "lodash";
const VF = Vex.Flow;

function convertNote(note) {
  return note.slice(0, note.length - 1) + "/" + note.slice(note.length - 1);
}

export default {
  name: "Notation",
  data() {
    return {
      context: {},
      stave: {},
      staves: [],
    };
  },
  props: {
    noteSequence: {
      type: Array,
      default: () => ["C4", "C5", "C4", "C4", "C4", "C5", "C4", "C4", "C4"],
    },
  },
  watch: {
    noteSequence(newValue, oldValue) {
      this.createNotation();
    }
  },
  methods: {
    createNotation: function() {
      const div = this.$refs.notation;
      console.info(div);
      [].slice.call(div.children).forEach(function(child) {div.removeChild(child)});
      const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

      // Size our SVG:
      renderer.resize(500, 200);

      // And get a drawing context:
      this.context = renderer.getContext();
      // Create a stave at position 10, 40 of width 400 on the canvas.
      this.stave = new VF.Stave(10, 40, 500);

      // Add a clef and time signature.
      this.stave.addClef("treble");

      // Connect it to the rendering context and draw!
      this.stave.setContext(this.context).draw();

      const notes = [];
      for (let i = 0; i < this.noteSequence.length; i++) {
        const note = new VF.StaveNote({
          clef: "treble",
          keys: [convertNote(this.noteSequence[i])],
          duration: "8",
        });
        if (this.noteSequence[i].indexOf("#") >= 0)
          note.addAccidental(0, new VF.Accidental("#"));
        if (this.noteSequence[i].indexOf("b") >= 0)
          note.addAccidental(0, new VF.Accidental("b"));
        notes.push(note);
      }

      console.log(notes);
      const beams = _.chunk(notes, 3).map((x) => new VF.Beam(x));
      console.log(beams);

      // Render the notes followed by the beams
      const allNotes = notes;
      Vex.Flow.Formatter.FormatAndDraw(this.context, this.stave, allNotes);
      beams.forEach(function (b) {
        b.setContext(this.context).draw();
      });

      // Create a voice in 4/4 and add the notes from above
      const voice = new VF.Voice();
      voice.setStrict(false);
    },
  },
  mounted: function() {
    this.createNotation();
  },
  computed: {},
};
</script>

<style lang="scss" scoped>
</style>