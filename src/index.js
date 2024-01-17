import { Bassh } from "bassh";
import { Unilang, UniSynth } from "./unilang.js"

export class TheMachine {
    constructor(){
        this.unilang = new Unilang('themachine')
        this.unilang.setSynth(new MachineSynth())
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

        let patterns = this.patterns

        let instruction = patterns.pattern('instruction', true)

        let spaces = patterns.pattern('space')        
        spaces.addSeries(this.lang.sequenceType('space'))   
        
        instruction.callbacks['space'] = ()=>{
            return false // ignore spaces
        }
        
        let instructionStart = instruction.pattern('start', true)

        let cmd = instructionStart.pattern('cmd')
        let cmdStart = cmd.pattern('cmdStart').addSeries('$',' ')

        cmd.addSeries(cmdStart, '\n')

        cmd.$begin = (seq) => {
            cmd.stack.push('bash')
        }

        cmd.callback = (seq) => {
            cmd.stack.push(seq.str)
        }
        
        cmd.$end = (seq) => {
            cmd.stack.confirm()
        }
    }
}