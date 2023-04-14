import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="toggle"
export default class extends Controller {
  connect() {
    console.log(this.element)
  }
  toggle(){
    console.log(this.element.value)
    this.element.value = !(this.element.value)
    console.log(this.element.value)
  }
}
