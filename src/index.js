import { Bassh } from "bassh";
import { Unilang, UniSynth } from "./unilang.js"

export class TheMachine {
    constructor(){
        this.unilang = new Unilang('themachine')
        this.unilang.synth = new MachineSynth(this.unilang)
    }

    read(script){
        this.unilang.reset()
        for(let c=0; c<script.length; c++){
            this.unilang.read(script[c])
        }
        this.unilang.read('\0')
        console.log(this.unilang.synth.patterns.stack)
        return
    }
}

class MachineSynth extends UniSynth {
    constructor(lang){
        super(lang)      
        
        const doubleQuote = lang.sequenceType('doubleQuote').setSeries('"')
        //todo: handle strings

        ///

        let patterns = this.patterns

        let instruction = patterns.pattern('instruction')

        /*let spaces = patterns.pattern('space', true)        
        spaces.addSeries(this.lang.sequenceType('space'))   
        
        instruction.callbacks['space'] = (stack, seq)=>{
            return false// ignore spaces
        }*/
        
        let instructionStart = instruction.pattern('start')

        ///
        /// CMD
        ///
        let cmd = instructionStart.pattern('cmd')

        let cmdStart = cmd.pattern('cmdStart').addSeries('$',' ')        
        cmdStart.$end = (stack, seq) => {
            // Confirm CMD after immediately after is start pattern
            stack.parent.confirm()
        }

        cmd.addSeries(cmdStart, '\n')

        cmd.$begin = (stack, seq) => {
            stack.push('bash')
            stack.arg = ''

            stack.flushArg = ()=>{
                if(stack.arg){
                    stack.push(stack.arg)
                    stack.arg = ''
                }
            }
        }

        cmd.callback = (stack, seq) => {
            if(seq.is('word')){
                stack.arg += seq.str
                return true
            }
        }

        cmd.callbacks['space'] = (stack, seq) => {
            stack.flushArg()
        }

        cmd.$end = (stack, seq) => {
            stack.flushArg()
        }

        ///
        /// EXPRESSION
        ///
        let expression = instruction.pattern('expression')
        expression.condition = {not: instructionStart}

        expression.callback = (stack, seq)=>{
            //console.log(stack)
            console.log("expression check")
        }
    }
}