<template>
  <div class="vh-100">
    <div class="board-container ma1">
      <div v-for="i in tones" :key="i" class="br-100">
        <button
          @click="inputAnswer(i)"
          class="simon-button br-100 ma1 h4-ns w4-ns h3 w3 bn"
          :class="btnClass(i)"
        >
          <div class="note-name f4 f1-ns b">
            {{ noteNames[i] }}
          </div>
        </button>
      </div>
    </div>
    <div class="v-mid">
      <div class="f3 mv5" v-show="gameOver">Game Over</div>
      <div class="">
        <button
          @click="start"
          v-show="!playing"
          class="h3-ns w3-ns h3 w3 br-100 grow"
        >
          Start
        </button>
      </div>
      <div>
        <span v-show="playing" class="f-headline-ns f1">
          {{ score }}
        </span>
      </div>
    </div>
    <!-- 
    <div>
      {{ seq }}
    </div>
    <div>
      {{ inputSeq }}
    </div> -->

    <!-- <div>{{ seq.map((i) => this.noteNames[i]) }}</div>
    <div>{{ inputSeq.map((i) => this.noteNames[i]) }}</div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      tones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      interval: 1000,
      speed: 0.17,
      activeTone: null,
      audioContext: new AudioContext(),
      colors: [
        "bg-red",
        "bg-light-red",
        "bg-gold",
        "bg-light-yellow",
        "bg-light-green",
        "bg-dark-green",
        "bg-light-blue",
        "bg-blue",
        "bg-dark-blue",
        "bg-light-purple",
        "bg-hot-pink",
        "bg-light-pink",
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
      playing: false,
      gameOver: false,
      states: { playing: "playing", gameover: "gameover", start: "start" },
      currentState: null,
      currentIndex: 0,
      startPitch: 220,
    };
  },
  methods: {
    inputAnswer(i) {
      this.inputSeq.push(i);
      this.play(i);
      this.checkAnswer();
    },
    checkAnswer() {
      const seqNum = this.inputSeq.length - 1;
      if (this.inputSeq[seqNum] === this.seq[seqNum]) {
        if (seqNum === this.seq.length - 1) {
          window.setTimeout(() => {
            this.inputSeq = [];
            this.addRandomTone();
            this.playSeq();
          }, this.interval * this.speed + 500);
        }
      } else {
        this.currentState = this.states.gameOver;
        this.gameOver = true;
        this.playing = false;
        this.seq = this.inputSeq = [];
      }

      // this.interval *= 0.9
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
    start() {
      this.seq = [];
      this.currentState = this.states.playing;
      this.playing = true;
      this.gameOver = false;
      this.inputSeq = [];
      this.addRandomTone();
      this.playSeq();
    },
    animateButtons() {
      for (let i = 0; i < this.seq.length; i++) {
        window.setTimeout(() => {
          this.activeTone = this.seq[i];
        }, this.interval * this.speed * i);
        window.setTimeout(() => {
          this.activeTone = null;
        }, this.interval * this.speed * this.seq.length);
      }
    },
    playSeq() {
      for (let i = 0; i < this.seq.length; i++) {
        const noteToPlay = this.seq[i];
        this.play(
          noteToPlay,
          this.audioContext.currentTime +
            (i * this.interval * this.speed) / 1000
        );
        this.animateButtons();
      }
      this.waitingForInput = true;
    },
    addRandomTone() {
      this.seq.push(Math.floor(Math.random() * 12));
    },
    frequency(i) {
      const a = Math.pow(2.0, 1.0 / 12.0);
      const factor = Math.pow(a, i - 9);
      return this.startPitch * factor;
    },
    btnClass: function (i) {
      return this.colors[i].concat(
        i === this.activeTone ? " active" : " inactive"
      );
    },
  },
  computed: {
    score() {
      return this.seq.length;
    },
  },
  mounted() {
    this.currentState = this.states.start;
  },
};
</script>

<style lang="scss" scoped>
button:focus {
  outline: 0;
}
.active {
  opacity: 1;
}
.inactive {
  opacity: 0.6;
}
.simon-button {
  -moz-box-shadow: inset 0 0 10px #000000;
  -webkit-box-shadow: inset 0 0 10px #000000;
  box-shadow: inset 0 0 10px #000000;
  &:hover {
    animation-name: fadeIn;
    animation-duration: 0.7s;
    animation-fill-mode: forwards;
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

$board-size-ns: 50vh;
$item-size-ns: 10vh;
$board-size: 65vw;
$item-size: 10vw;

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

@media only screen and(min-width: 600px) {
  .board-container {
    @include on-circle(12, $board-size-ns, $item-size-ns);
  }
}

@media only screen and(max-width: 600px) {
  body {
    background-color: red;
    color: red;
  }
  .board-container {
    @include on-circle(12, $board-size, $item-size);
  }
}

.score {
  position: absolute;
  bottom: 43vh;
  left: 47vw;
}
</style>