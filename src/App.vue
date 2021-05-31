<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
     -->
    <div>
      <button @click="seqExp = true" v-show="!seqExp">Sequence Explorer</button>
      <button @click="seqExp = false" v-show="seqExp">Game</button>
      </div>
    <game-board v-show="!seqExp"></game-board>
    <sequence-explorer v-show="seqExp"></sequence-explorer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "./components/HelloWorld.vue";
import GameBoard from "./components/GameBoard.vue";
import SequenceExplorer from "./components/SequenceExplorer.vue";

@Component({
  data() {
    return {
      seqExp: false
    }
  },
  components: {
    HelloWorld,
    GameBoard,
    SequenceExplorer,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
