<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
     -->
    <nav class="ma5">
      <button @click="seqExp = true" v-show="!seqExp" class="f6 link dim ph3 pv2 mb2 dib white bg-black">Sequence Explorer</button>
      <button @click="seqExp = false" v-show="seqExp" class="f6 link dim ph3 pv2 mb2 dib white bg-black">Game</button>
      </nav>
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
