<template>
  <div>
    <div class="board-container ma5">
      <button
        v-for="i in tones"
        :key="i"
        @click="inputAnswer(i)"
        :class="
          ' grow b f1 br-100 ma1 h4 w4 ba bw3 b--' +
          borderColors[i] +
          ' ' +
          colors[i]
        "
      >
        <div class="note-name">
          {{ noteNames[i] }}
        </div>
      </button>
    </div>
    <div class="f-headline pr3 score">
      {{ this.seq.length }}
    </div>
    <div class="ma5 pa1">
      <button @click="start" class="h3 w3">Start</button>
    </div>
    <div>{{ seq.map((i) => this.noteNames[i]) }}</div>
    <div>{{ inputSeq.map((i) => this.noteNames[i]) }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
      noteNames: [
        "C",
        "C#",
        "D",
        "Eb",
        "E",
        "F",
        "F#",
        "G",
        "Ab",
        "A",
        "Bb",
        "B",
      ],
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
    start() {
      this.seq = [];
      this.playSeq();
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

/// Mixin to place items on a circle
/// @author Hugo Giraudel
/// @author Ana Tudor
/// @param {Integer} $item-count - Number of items on the circle
/// @param {Length} $circle-size - Large circle size
/// @param {Length} $item-size - Single item size
@mixin on-circle($item-count, $circle-size, $item-size) {
  width: $circle-size;
  height: $circle-size;
  list-style: none;

  > * {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    width: $item-size;
    height: $item-size;
    margin: -($item-size / 2);

    $angle: (360 / $item-count);
    $rot: 0;

    @for $i from 1 through $item-count {
      &:nth-of-type(#{$i}) {
        transform: rotate($rot + 1deg) translate($circle-size / 2);
        // rotate: ($angle * -2deg);
        > div {
          transform: rotate(-$rot * 1deg);
        }
      }
      $rot: $rot + $angle;
    }
  }
}

.board-container {
  @include on-circle(12, 500px, 120px);
}

.score {
}
</style>