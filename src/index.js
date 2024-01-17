import { Bassh } from "bassh";
import { Unilang, UniSynth } from "./unilang.js"

export class TheMachine {
    constructor(){
        this.unilang = new Unilang('themachine')
        this.unilang.synth = new MachineSynth()
    }

    read(script){
        this.unilang.reset()
        for(let c=0; c<script.length; c++){
            this.unilang.read(script[c])
        }
        let end = this.unilang.read('\0')
        console.log(end)
    }
}

class MachineSynth extends UniSynth {
    constructor(){
        super()


    }
}