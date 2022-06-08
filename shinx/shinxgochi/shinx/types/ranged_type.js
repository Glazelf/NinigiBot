export default class RangedType {
    #min_range = 0;
    #max_range = 0;
    #value = 0;

    constructor(min_range, max_range, init_value = 0) {
      this.#min_range = min_range;
      this.#max_range = max_range;
      this.#value = init_value;
    }

    plus(amount){
      if(this.#value<this.#max_range){
        this.#value = Math.min(this.#max_range, this.#value+amount);
        return true;
      } else {
        return false;
      }
    }

    minus(amount){
      if(this.#value>this.#min_range){
        this.#value = Math.max(this.#min_range, this.#value-amount);
        return true;
      } else {
        return false;
      }
    }

    getValue(){
      return this.#value
    }

  }