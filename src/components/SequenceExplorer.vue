<template>
  <div>
    <section>
      <h2>Triadic-Chromatic Sequence Generator</h2>
    </section>
    <section class="flex flex-wrap justify-center">
      <div class="ma4">
        <h3>Sequence Length</h3>
        <input class="ma4" type="number" v-model="triadNum" />
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
        <span v-for="(step,index) in halfStepPattern" :key="index" class="ma1 pa1 ba">{{
          step
        }}</span>
      </div>

      <div class="ma4">
        <h3>Triad Pattern</h3>
        <div class="ma3">
          <button
            v-for="(tri,index) in triads"
            :key="index"
            @click="addTriad(tri)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            {{ tri.name }}
          </button>
        </div>
        <span v-for="(tri,index) in triadPattern" :key="index" class="ma1 pa1 ba">{{
          tri.name
        }}</span>
      </div>

      <div class="ma4">
        <h3>Direction Pattern</h3>
        <div class="ma3">
          <button
            @click="directionPattern.push(1)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Up
          </button>
          <button
            @click="directionPattern.push(-1)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Down
          </button>
        </div>
        <div class="ma3">
          <span v-for="(dir,index) in directionPattern" :key="index" class="ma1 pa1 ba">{{
            dir
          }}</span>
        </div>
      </div>
      <!-- <div id="boo"></div> -->
    </section>
    <section>
      <div class="ma4">
        <h3>Play Seqence</h3>
        <div>
          <input
            type="range"
            min="30"
            max="500"
            value="120"
            class="slider"
            v-model="bpm"
          />
        </div>
        <div>
          <button
            @click="playSeq"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Play
          </button>
        </div>
        <div>
          <button
            @click="clear"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Clear
          </button>
          <button
            @click="stop"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            Stop
          </button>
          <!-- <button @click="playTone" class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black">Play Tone</button> -->
        </div>
      </div>
    </section>
    <section>
      <notation  :noteSequence="noteSequence"></notation>
    </section>
    <section>
      <piano-chart :sequence="noteSequence" :interval="interval"></piano-chart>
    </section>
  </div>
</template>

<script>
import { triads } from "../triads.js";
import * as utility from "../utility.js";
import * as Tone from "tone";
import PianoChart from "./PianoChart.vue";
import Notation from "./Notation.vue";

export default {
  name: "SequenceExplorer",
  components: {
    PianoChart,
    Notation,
  },
  data() {
    return {
      interval: 1000,
      speed: 0.2,
      startPitch: 262, //middle C (c3)
      triadNum: 3,
      triads: triads,
      triadPattern: [triads[0]],
      halfStepPattern: [-1],
      directionPattern: [1],
      tone: new Tone.Synth().toDestination(),
      toneSequence: null,
      bpm: 120,
    };
  },
  methods: {
    clear() {
      this.triadPattern = [triads[0]];
      this.halfStepPattern = [-1];
      this.directionPattern = [1];
      // this.noteSequence = [];
      this.triadNum = 3;
    },
    addTriad(tri) {
      this.triadPattern.push(tri);
    },
    addHalfStep(i) {
      this.halfStepPattern.push(i);
    },
    nextTriad(sequence, i) {
      const max = sequence.reduce((a, b) => {
        return Math.max(a, b);
      });
      const min = sequence.reduce((a, b) => {
        return Math.min(a, b);
      });
      const halfStep = utility.getCycle(this.halfStepPattern, i);
      const startingPoint = sequence[sequence.length - 1] + halfStep;
      let subSeq = utility.getCycle(this.triadPattern, i).tones.map((x) => x); //get the next triad shape
      // console.log(subSeq)
      if (utility.getCycle(this.directionPattern, i) < 0) {
        subSeq = subSeq.map((x) => -1 * x);
      }
      subSeq = subSeq.map((x) => x + startingPoint);
      return subSeq;
    },
    stop() {
      Tone.Transport.stop();
    },
    playSeq() {
      const now = Tone.now();
      this.toneSequence = new Tone.Sequence((time, note) => {
        this.tone.triggerAttackRelease(note, 0.1, time);
        // subdivisions are given as subarrays
      }, this.noteSequence).start(0);
      this.toneSequence.loop = false;
      Tone.Transport.bpm.value = this.bpm;
      Tone.Transport.start();
    },
    frequency(i) {
      const a = Math.pow(2.0, 1.0 / 12.0);
      const factor = Math.pow(a, i - 9);
      return this.startPitch * factor;
    },
  },
  computed: {
    seq() {
      let sequence = []
      for (let i = 0; i < this.triadNum; i++) {
        let next =
          i > 0
            ? this.nextTriad(sequence, i)
            : this.triadPattern[i].tones.map((x) => x);
        if (utility.getCycle(this.directionPattern, i) < 0)
          next = next.reverse();
        sequence = sequence.concat(next);
      }
      
      return sequence;
    },
    noteSequence(){
      console.log(utility.convertSequence(this.seq));
      return utility.convertSequence(this.seq);
    }
  },
};
</script>

<style lang="scss" scoped>
</style>