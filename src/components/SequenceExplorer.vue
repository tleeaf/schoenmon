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
          <button @click="playTone" class="f6 link dim br1 ph3 pv2 mb2 dib white bg-black">Play Tone</button>
        </div>
      </div>
    </section>
    <section id="pianoContainer"></section>
  </div>
</template>

<script>
import { triads } from "../triads.js";
import * as utility from "../utility.js";
import Vex from "vexflow";
import * as Tone from 'tone'
import { Instrument } from "piano-chart";

export default {
  data() {
    return {
      interval: 1000,
      speed: 0.2,
      activeTone: null,
      audioContext: new AudioContext(),
      seq: [],
      startPitch: 262, //middle C (c3)
      triadNum: 3,
      triads: triads,
      triadPattern: [triads[0]],
      halfStepPattern: [-1],
      directionPattern: [1],
      piano: null,
      noteSequence: [],
    };
  },
  methods: {
    playTone(){
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease("C4","8n")
    },
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
    clearAllNotes(){
      for(let i = 0; i < this.noteSequence.length; i++){
        this.piano.keyUp(this.noteSequence[i]);
      }
    },
    playSeq() {
      const p = this.piano;
      const ns = this.noteSequence;
      const inter = this.interval * this.speed;
      for (let i = 0; i < this.seq.length; i++) {
        setTimeout(function(){
          p.keyDown(ns[i]);
        },inter*i)
        this.play(this.seq[i],this.audioContext.currentTime + (i * this.interval * this.speed) / 1000);
      }
      // setTimeout(this.clearAllNotes,ns.length*inter)
    },
    frequency(i) {
      const a = Math.pow(2.0, 1.0 / 12.0);
      const factor = Math.pow(a, i - 9);
      return this.startPitch * factor;
    },
  },
  mounted() {
    this.piano = new Instrument(document.getElementById("pianoContainer"));
    this.piano.create();

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