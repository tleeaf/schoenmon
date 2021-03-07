<template>
  <div>
    <div class="board-container ma5">
      <div v-for="r in rows" :key="r" class="fl w-100">
        <button
          v-for="i in cols"
          :key="i"
          @click="inputAnswer(i + cols.length * r)"
          :class="
            ' grow b f1 br4 ma1 h4 w4 ba bw3 b--' +
            borderColors[i + cols.length * r] +
            ' ' +
            colors[i + cols.length * r]
          "
        >{{noteNames[i + cols.length * r]}}</button>
      </div>
    </div>
    <div class="f-headline pr3">
      {{ this.seq.length }}
    </div>
    <div class="ma5 pa1">
      <button @click="playSeq" class="h3 w3">Play</button>
    </div>
    <div>{{ seq.map(i => this.noteNames[i]) }}</div>
    <div>{{ inputSeq.map(i => this.noteNames[i])  }}</div>
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
        "bg-dark-blue",
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
        "dark-blue",
        "light-blue",
      ],
      noteNames: ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
      seq: [],
      inputSeq: [],
      waitingForInput: false,
    };
  },
  methods: {
    inputAnswer(i) {
      this.inputSeq.push(i);
      this.play(i);
      if (this.inputSeq.length >= this.seq.length) this.checkAnswer();
    },
    checkAnswer() {
      if (this.arrayEquals(this.seq, this.inputSeq)) {
        const id = window.setTimeout(() => {
          this.playSeq();
        }, 3000);
      } else {
        console.log("game over");
        this.seq = [];
      }
      this.inputSeq = [];
    },
    arrayEquals(a, b) {
      return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
      );
    },
    play(i, time) {
      if (!time) time = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      osc.frequency.setValueAtTime(this.frequency(i), time);
      const attackTime = 0.2;
      const releaseTime = 0.5;
      const sweepLength = 1.4;
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
      this.append();
      for (let i = 0; i < this.seq.length; i++) {
        this.play(this.seq[i], this.audioContext.currentTime + i * 1.4);
        const id = window.setTimeout(function () {
          console.log("play");
        }, 1.4);
      }
      this.waitingForInput = true;
    },
    append() {
      this.seq.push(Math.floor(Math.random() * 12));
    },
    frequency(i) {
      const a = Math.pow(2.0, 1.0 / 12.0);
      const factor = Math.pow(a, i - 9);
      return 440.0 * factor;
    },
  },
};
</script>

<style lang="scss" scoped>
.simon-button {
  opacity: 0.5;
  :hover {
    animation-name: fadeIn;
    animation-duration: 1s;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}
</style>