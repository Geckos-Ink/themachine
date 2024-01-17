import { Bassh } from "bassh";
import { Unilang } from "./unilang.js"

export class TheMachine {
    constructor(){
        this.unilang = new Unilang('themachine')
    }

    read(script){
        this.unilang.reset()
        for(let c=0; c<script.length; c++){
            let seq = this.unilang.read(script[c])
            
        }
    }
}