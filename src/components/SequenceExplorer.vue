<template>
  <div>
    <section>
      <h2>Triadic-Chromatic Sequence Generator</h2>
    </section>
    <section class="flex flex-wrap justify-center">
      <div class="ma4">
        <h3>Sequence Length</h3>
        <input class="ma4" type="number" v-model="pattern.length" />
        <h3>Starting Pitch</h3>
        <select v-model="pitches"></select>
        <select v-model="octaves"></select>
      </div>
      <div class="ma4">
        <h3>Half Steps</h3>
        <div class="ma3">
          <button
            @click="addHalfStep(1)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Up
          </button>
          <button
            @click="addHalfStep(-1)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Down
          </button>
        </div>
        <span
          @click="pattern.step.splice(index, 1)"
          v-for="(step, index) in pattern.step"
          :key="index"
          class="f6 link dim br1 ph3 pv2 mb2 dib bg-blue"
          >{{ step }}</span
        >
      </div>

      <div class="ma4">
        <h3>Triad Pattern</h3>
        <div class="ma3 flex flex-wrap">
          <button
            v-for="(tri, index) in triads"
            :key="index"
            @click="addTriad(tri)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            {{ tri.name }}
          </button>
        </div>
        <button
          @click="pattern.triads.splice(index, 1)"
          v-for="(tri, index) in pattern.triads"
          :key="index"
          class="f6 link dim br1 ph3 pv2 mb2 dib bg-blue"
        >
          {{ tri.name }}
        </button>
      </div>

      <div class="ma4">
        <h3>Direction Pattern</h3>
        <div class="ma3">
          <button
            @click="pattern.dir.push(1)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Up
          </button>
          <button
            @click="pattern.dir.push(-1)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Down
          </button>
        </div>
        <div class="ma3">
          <span
            @click="pattern.dir.splice(index, 1)"
            v-for="(dir, index) in pattern.dir"
            :key="index"
            class="f6 link dim br1 ph3 pv2 mb2 dib bg-blue"
            >{{ dir }}</span
          >
        </div>
      </div>
      <!-- <div id="boo"></div> -->
      <div>
        <button
          @click="clear"
          class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
        >
          <!-- <i class="fas fa-camera"></i> -->
          <font-awesome-icon icon="redo" />
        </button>
      </div>
    </section>
    <section>
      <div class="ma4">
        <h3>Play Sequence</h3>
        <div class="w4 dib pv4">
          <label for="tempo">Tempo</label>
          <vue-slider
            v-model="bpm"
            id="tempo"
            :min="30"
            :max="400"
            tooltip="always"
          ></vue-slider>
        </div>
        <div>
          <button
            @click="playSeq"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Play
          </button>
          <button
            @click="stop"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Stop
          </button>
        </div>
      </div>
      <div>
        <span v-for="chord in chords" :key="chord.quality" class="ma2">
          <label :for="chord.quality" class="ma1">{{ chord.quality }}</label>
          <input
            type="radio"
            :value="chord"
            :id="chord.quality"
            name="chord"
            v-model="selectedChord"
          />
        </span>
        <button @click="playChord">Play Chord</button>
      </div>
    </section>
    <section>
      <notation :noteSequence="noteSequence"></notation>
    </section>
    <section>
      <piano-chart :sequence="noteSequence" :interval="interval"></piano-chart>
    </section>
  </div>
</template>

<script>
import { triads, chords } from "../triads.js";
import * as utility from "../utility.js";
import * as Tone from "tone";
import PianoChart from "./PianoChart.vue";
import Notation from "./Notation.vue";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";
import _ from "lodash";
const initPattern = {
  step: [1],
  dir: [1],
  triads: [triads[0]],
  length: 3,
};
export default {
  name: "SequenceExplorer",
  components: {
    PianoChart,
    Notation,
    VueSlider,
  },
  data() {
    return {
      interval: 1000,
      speed: 0.2,
      refPitch: 261.6256, //middle C (c3)
      startPitch: 0,
      triads: triads,
      pattern: _.cloneDeep(initPattern),
      tone: new Tone.Synth().toDestination(),
      toneSequence: null,
      bpm: 120,
      pitches: utility.notes,
      octaves: utility.octaves,
      seq: [],
      chords: chords,
      selectedChord: null,
      chordSynth: new Tone.PolySynth().toDestination()
    };
  },
  methods: {
    clear: function () {
      this.pattern = _.cloneDeep(initPattern);
    },
    addTriad: function (tri) {
      this.pattern.triads.push(tri);
    },
    addHalfStep: function (i) {
      this.pattern.step.push(i);
    },
    nextTriad: function (sequence, i) {
      const halfStep = utility.getCycle(this.pattern.step, i);
      const startingPoint = sequence[sequence.length - 1] + halfStep;
      const shape = this.getNext(this.pattern.triads, i).tones; //get the next triad shape
      let subSeq = _.cloneDeep(shape);
      if (utility.getCycle(this.pattern.dir, i) < 0) {
        subSeq = shape.map((x) => x - _.max(shape));
      }
      subSeq = subSeq.map((x) => x + startingPoint);
      return subSeq;
    },
    stop: function () {
      Tone.Transport.stop();
    },
    playSeq: function () {
      Tone.Transport.bpm.value = this.bpm;
      Tone.Transport.start();
      this.playChord();
    },
    playChord: function () {
      console.log("chord")
      Tone.context.resume();
      const now = Tone.now();
      const chord = new Tone.PolySynth().toDestination();
      chord.set({ volume: -5 });
      this.chordSynth.triggerAttackRelease(this.chordNotes,10)
      // this.chordSynth.triggerAttackRelease(["C3","E3","G3"], 1);
    },
    frequency: function (i) {
      const a = Math.pow(2.0, 1.0 / 12.0);
      const factor = Math.pow(a, i - 9);
      return this.refPitch * factor;
    },

    getNext: function (arr, i) {
      return utility.getCycle(arr, i);
    },
    buildSeq: function () {
      let sequence = [];
      if (!this.parametersValid) return sequence;
      for (let i = 0; i < this.pattern.length; i++) {
        let next =
          i > 0
            ? this.nextTriad(sequence, i)
            : this.triads[0].tones.map((x) => x);
        if (utility.getCycle(this.pattern.dir, i) < 0) next = next.reverse();
        sequence = sequence.concat(next);
      }
      return sequence;
    },
  },
  computed: {
    noteSequence: function () {
      if (this.seq.length > 0) {
        return utility.convertSequence(this.seq);
      }
      return [];
    },
    chordNotes: function () {
      if (this.selectedChord) {
        return utility.convertSequence(this.selectedChord.tones);
      }
      return [];
    },
    parametersValid: function () {
      return !!(
        this.pattern.triads.length &&
        this.pattern.step.length &&
        this.pattern.dir.length &&
        this.pattern.length
      );
    },
  },
  mounted: function () {
    this.seq = this.buildSeq();
    const now = Tone.now();
    this.tone = new Tone.AMSynth().toDestination();
    this.toneSequence = new Tone.Sequence((time, note) => {
      this.tone.triggerAttackRelease(note, 0.1, time);
      // subdivisions are given as subarrays
    }, this.noteSequence).start(0);
    this.toneSequence.loop = false;
  },
  beforeUpdate: function () {
    this.seq = this.buildSeq();
    const now = Tone.now();
    this.tone = new Tone.AMSynth().toDestination();
    this.toneSequence = new Tone.Sequence((time, note) => {
      this.tone.triggerAttackRelease(note, 0.1, time);
      // subdivisions are given as subarrays
    }, this.noteSequence).start(0);
    this.toneSequence.loop = false;
  },
};
</script>

<style lang="scss" scoped>
</style>