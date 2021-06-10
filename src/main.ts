import Vue from "vue";
import App from "./App.vue";
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import specific icons */
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* add icons to the library */
library.add(faArrowRight)

/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false;



new Vue({
  render: h => h(App)
}).$mount("#app");
