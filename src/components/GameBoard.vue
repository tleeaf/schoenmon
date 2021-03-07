<template>
  <div>
    <div class="ma5">
      <div v-for="r in rows" :key="r" class="fl w-100">
        <button
          v-for="i in cols"
          :key="i"
          @click="play(i + cols.length * r)"
          :class="
            ' br4 ma1 h4 w4 ba bw3 b--' +
            borderColors[i + cols.length * r] +
            ' bg-animate hover-' +
            colors[i + cols.length * r]
          "
        ></button>
      </div>
    </div>
    <div class="ma5 pa1">
      <button @click="append" class="h3 w3">Start</button>
      <button @click="playSeq" class="h3 w3">Play</button>
    </div>
    <div>{{ seq }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rows: [0, 1, 2, 3],
      cols: [0, 1, 2],
      audioContext: new AudioContext(),
      colors: [
        "bg-red",
        "bg-light-red",
        "bg-gold",
        "bg-light-yellow",
        "bg-light-purple",
        "bg-hot-pink",
        "bg-light-pink",
        "bg-dark-green",
        "bg-blue",
        "bg-light-green",
        "bg-navy",
        "bg-light-blue",
      ],
      borderColors: [
        "red",
        "light-red",
        "gold",
        "light-yellow",
        "light-purple",
        "hot-pink",
        "light-pink",
        "dark-green",
        "blue",
        "light-green",
        "navy",
        "light-blue",
      ],
      seq: [],
    };
  },
  methods: {
    play(i) {
      const osc = this.audioContext.createOscillator();
      osc.frequency.setValueAtTime(
        this.frequency(i),
        this.audioContext.currentTime
      );
      const time = this.audioContext.currentTime;
      const attackTime = 0.2;
      const releaseTime = 0.5;
      const sweepLength = 2;
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
      osc.stop(this.audioContext.currentTime + sweepLength);
    },
    playSeq() {
      const osc = this.audioContext.createOscillator();

      osc.start();
      for (let i = 0; i < this.seq.length; i++) {
        osc.frequency.setValueAtTime(
          this.frequency(this.seq[i]),
          this.audioContext.currentTime + i
        );
        osc.stop(this.audioContext.currentTime + this.seq.length + 1);
      }
      osc.connect(this.audioContext.destination);
    },
    append() {
      this.seq.push(Math.floor(Math.random() * 12));
    },
    frequency(i) {
      const a = Math.pow(2.0, 1.0 / 12.0);
      const factor = Math.pow(a, i);
      return 440.0 * factor;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>