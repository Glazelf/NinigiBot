class Experience {
    #exp = 0;

    getValue(){
        return this.#exp;
    }

    toLevel(){
        return Math.floor(Math.cbrt(1.25*this.#exp));
    }

    reset(){
        this.#exp = 0;
    }

    plus(amount){
      this.#exp += amount;
    }
  }