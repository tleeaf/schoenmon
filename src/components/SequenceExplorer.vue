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
        <span v-for="step in halfStepPattern" :key="step" class="ma1 pa1 ba">{{
          step
        }}</span>
      </div>

      <div class="ma4">
        <h3>Triad Pattern</h3>
        <div class="ma3">
          <button
            v-for="tri in triads"
            :key="tri.name"
            @click="addTriad(tri)"
            class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black"
          >
            {{ tri.name }}
          </button>
        </div>
        <span v-for="tri in triadPattern" :key="tri.name" class="ma1 pa1 ba">{{
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
          <span v-for="dir in directionPattern" :key="dir" class="ma1 pa1 ba">{{
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
          <button
            @click="testSeq"
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
      <piano-chart :sequence="seq" :interval="interval"></piano-chart>
    </section>
  </div>
</template>

<script>
import { triads } from "../triads.js";
import * as utility from "../utility.js";
import Vex from "vexflow";
import * as Tone from "tone";
import PianoChart from './PianoChart.vue';

export default {
  name: "SequenceExplorer",
  components: {
    PianoChart,
  },
  data() {
    return {
      interval: 1000,
      speed: 0.2,
      seq: [],
      startPitch: 262, //middle C (c3)
      triadNum: 3,
      triads: triads,
      triadPattern: [triads[0]],
      halfStepPattern: [-1],
      directionPattern: [1],
      noteSequence: [],
      tone: new Tone.Synth().toDestination(),
    };
  },
  methods: {
    clear() {
      this.triadPattern = [];
      this.halfStepPattern = [];
      this.directionPattern = [];
      this.noteSequence = [];
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
    testSeq() {
      this.clearAllNotes();
      this.seq = [];
      for (let i = 0; i < this.triadNum; i++) {
        let next =
          i > 0
            ? this.nextTriad(this.seq, i)
            : this.triadPattern[i].tones.map((x) => x);
        if (utility.getCycle(this.directionPattern, i) < 0)
          next = next.reverse();
        this.seq = this.seq.concat(next);
      }
      this.noteSequence = utility.convertSequence(this.seq);
      this.playSeq();
    },
    stop() {
      Tone.Transport.stop();
    },
    clearAllNotes() {
      for (let i = 0; i < this.noteSequence.length; i++) {
        this.piano.keyUp(this.noteSequence[i]);
      }
    },
    playSeq() {
      const seq = new Tone.Sequence((time, note) => {
        this.tone.triggerAttackRelease(note, 0.1, time);
        // subdivisions are given as subarrays
      }, this.noteSequence).start(0);
      seq.loop = false;
      Tone.Transport.bpm.value = 200;
      Tone.Transport.start();
    },
    frequency(i) {
      const a = Math.pow(2.0, 1.0 / 12.0);
      const factor = Math.pow(a, i - 9);
      return this.startPitch * factor;
    },
  },
  mounted() {
    // const vf = new Vex.Flow.Factory({
    //   renderer: { elementId: "boo", width: 500, height: 200 },
    // });
    // const score = vf.EasyScore();
    // const system = vf.System();
    // system
    //   .addStave({
    //     voices: [
    //       score.voice(
    //         score
    //           .tuplet(score.beam(score.notes("C#4/8, C4, C4")))
    //           .concat(score.tuplet(score.beam(score.notes("C#4/8, C4, C4"))))
    //           .concat(score.tuplet(score.beam(score.notes("C#4/8, C4, C4"))))
    //           .concat(score.tuplet(score.beam(score.notes("C#4/8, C4, C4"))))
    //       ),
    //     ],
    //   })
    //   .addClef("treble");
    // vf.draw();
  },
};
</script>

<style lang="scss" scoped>
</style>