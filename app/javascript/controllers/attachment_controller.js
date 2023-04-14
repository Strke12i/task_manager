import { Controller } from "@hotwired/stimulus"
import Rails from "../../../../../../../../var/lib/gems/3.0.0/gems/actionview-7.0.4.2/lib/assets/compiled/rails-ujs";

// Connects to data-controller="attachment"
export default class extends Controller {
  static targets = ["attachment"]

  delete(event){
    console.log("clicou")
  }

}
