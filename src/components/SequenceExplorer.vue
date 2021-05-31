<template>
  <div class="vh-100">
    <div>
      <h3>Sequence Length</h3>
      <input class="ma4" type="number" :value="triadNum" />
    </div>
    <div class="ma4">
      <h3>Half Steps</h3>
      <div class="ma3">
        <button @click="addHalfStep(1)">Add 1</button>
        <button @click="addHalfStep(-1)">Add -1</button>
      </div>
      <span v-for="step in halfStepPattern" :key="step" class="ma1 pa1 ba">{{
        step
      }}</span>
    </div>

    <div class="ma4">
      <h3>Triad Pattern</h3>
      <div class="ma3">
        <button v-for="tri in triads" :key="tri" @click="addTriad(tri)">
          {{ tri.name }}
        </button>
      </div>
      <span v-for="tri in triadPattern" :key="tri" class="ma1 pa1 ba">{{
        tri.name
      }}</span>
    </div>
    <div>
      <div>
        <button @click="testSeq" class="h3-ns w3-ns h3 w3 grow">
          Play Test Seq
        </button>
      </div>
      <div>
        <button @click="clear">Clear</button>
      </div>
    </div>
    <div id="boo"></div>
  </div>
</template>

<script>
import { triads } from "../triads.js";
import Vex from "vexflow";

export default {
  data() {
    return {
      interval: 1000,
      speed: 0.12,
      activeTone: null,
      audioContext: new AudioContext(),
      seq: [],
      startPitch: 262, //middle C (c3)
      triadNum: 5,
      triads: triads,
      triadPattern: [],
      halfStepPattern: [1, -1],
    };
  },
  methods: {
    clear() {
      this.triadPattern = [];
      this.halfStepPattern = [];
    },
    addTriad(tri) {
      this.triadPattern.push(tri);
    },
    addHalfStep(i) {
      this.halfStepPattern.push(i);
    },
    testSeq() {
      this.seq = [];
      for (let i = 0; i < this.triadNum; i++) {
        if (i > 0) {
          const max = this.seq.reduce((a, b) => {
            return Math.max(a, b);
          });
          this.seq = this.seq.concat(
            this.triadPattern[i % this.triadPattern.length].tones.map(
              (x) =>
                x + max + this.halfStepPattern[i % this.halfStepPattern.length]
            )
          );
        } else {
          this.seq = this.seq.concat(this.triadPattern[0].tones);
        }
      }
      this.playSeq();
    },
    play(i, time) {
      if (!time) time = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      osc.frequency.setValueAtTime(this.frequency(i), time);
      const attackTime = 0.2 * this.speed;
      const releaseTime = 0.5 * this.speed;
      const sweepLength = 1.4 * this.speed;
      const sweepEnv = this.audioContext.createGain();
      sweepEnv.gain.cancelScheduledValues(time);
      sweepEnv.gain.setValueAtTime(0, time);
      // set our attack
      sweepEnv.gain.linearRampToValueAtTime(1, time + attackTime);
      // set our release
      sweepEnv.gain.linearRampToValueAtTime(
        0,
        time + sweepLength - releaseTime
      );
      osc.connect(sweepEnv).connect(this.audioContext.destination);
      osc.start(time);
      osc.stop(time + sweepLength);
    },
    playSeq() {
      for (let i = 0; i < this.seq.length; i++) {
        const noteToPlay = this.seq[i];
        this.play(
          noteToPlay,
          this.audioContext.currentTime +
            (i * this.interval * this.speed) / 1000
        );
      }
    },
    frequency(i) {
      const a = Math.pow(2.0, 1.0 / 12.0);
      const factor = Math.pow(a, i - 9);
      return this.startPitch * factor;
    },
  },
  mounted() {
    const vf = new Vex.Flow.Factory({
      renderer: { elementId: "boo", width: 500, height: 200 },
    });

    const score = vf.EasyScore();
    const system = vf.System();

    system
      .addStave({
        voices: [
          score.voice(score.tuplet(score.beam(score.notes("C#4/8, C4, C4"))).concat(score.tuplet(score.beam(score.notes("C#4/8, C4, C4")))).concat(score.tuplet(score.beam(score.notes("C#4/8, C4, C4")))).concat(score.tuplet(score.beam(score.notes("C#4/8, C4, C4"))))),
        ],
      })
      .addClef("treble")

    vf.draw();
  },
};
</script>

<style lang="scss" scoped>
</style>