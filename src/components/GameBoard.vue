<template>
  <div>
    <div class="board-container ma5">
      <div v-for="i in tones" :key="i" class="br-100">
        <button
          @click="inputAnswer(i)"
          class="simon-button br-100 ma1 h4 w4 bn"
          :class="colors[i]"
          :style="{ opacity: i === activeTone ? 1 : 0.5 }"
        >
          <div class="note-name f1 b">
            {{ noteNames[i] }}
          </div>
        </button>
      </div>
    </div>
    <div class="ma1 w1 center ct f-headline pr3 score">
      {{ score }}
    </div>
    <div class="score w1 center ma1">
      <button @click="start" class="h3 w3 bn grow">Start</button>
    </div>
    <!-- <div>{{ seq.map((i) => this.noteNames[i]) }}</div>
    <div>{{ inputSeq.map((i) => this.noteNames[i]) }}</div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      tones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      activeTone: null,
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
    animateButtons() {
      for (let i = 0; i < this.seq.length; i++) {
        // const a = await delay(1400*i,this.activeTone = this.seq[i]);
        window.setTimeout(() => {
          this.activeTone = this.seq[i];
        }, 1400*i);
      }
    },
    playSeq() {
      this.append();
      for (let i = 0; i < this.seq.length; i++) {
        const noteToPlay = this.seq[i];
        this.play(noteToPlay, this.audioContext.currentTime + i * 1.4);
        this.animateButtons();
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
  computed: {
    score() {
      return this.seq.length;
    },
    buttonClass: function (i) {
      const colorChoices = [
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
      ];
      return colorChoices[0];
    },
  },
};
</script>

<style lang="scss" scoped>
button:focus {
  outline: 0;
}
.active {
  opacity: 1;
  border: red 10px solid;
}
.simon-button {
  &:hover {
    animation-name: fadeIn;
    animation-duration: 0.5s;
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
        .note-name {
          transform: rotate(-$rot * 1deg);
        }
      }
      $rot: $rot + $angle;
    }
  }
}

.board-container {
  @include on-circle(12, 30rem, 7rem);
}

.score {
  transform: translateY(-15rem);
}
</style>