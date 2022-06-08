
import Experience from './types/experience';
import RangedType from './types/ranged_type';

class Shinx {
    #id = null;
    #happiness = new RangedType(0,10);
    #fullness = new RangedType(0,10);
    #experience = new Experience();

    constructor(id) {
        this.#id = id;
    }

    // Experience
    addExperience(experience){
        this.#experience.plus(experience);
    }

    getLevel(){
        return this.#experience.toLevel()
    }

    getExperience(){
        return this.#experience.getValue()
    }
    // Fullness
    feed(num_food){
        return this.#fullness.plus(num_food)
    }

    unfeed(num_food){
        return this.#fullness.minus(num_food)
    }

    getFullness(){
        this.#fullness.getValue()
    }

    // Happiness
    addHappiness(num_hap){
        return this.#happiness.plus(num_hap)
    }

    removeHappiness(num_hap){
        return this.#happiness.minus(num_hap)
    }

    getHappiness(){
        this.#happiness.getValue()
    }

  }