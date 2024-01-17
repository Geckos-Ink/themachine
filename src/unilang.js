// Exported from Unilang project

export class Unilang {
    constructor(name){
        this.name = name
        
        this.sequenceTypes = {}

        this.defaultSequenceType = new SequenceType("default")

        const letterLower = this.sequenceType('letterLower').setRange('a', 'z')
        const letterUpper = this.sequenceType('letterUpper').setRange('A', 'Z')
        const letter = this.sequenceType('letter').setSeries(letterLower , letterUpper)

        const number = this.sequenceType('number').setRange('0','9')

        this.sequenceType('word').setSeries(letter, number)

        const space = this.sequenceType('space').setSeries(' ')
        const tab = this.sequenceType('tab').setSeries('\t')        
        this.sequenceType('spaces').setSeries(space, tab)   
        
        const newLine = this.sequenceType('newLine').setSeries('\n')
        //const newLineR = this.sequenceType('newLineR').setSeries('\r')
    }

    sequenceType(type){
        if(!this.sequenceTypes[type]){
            this.sequenceTypes[type] = new SequenceType(type)
        }

        return this.sequenceTypes[type]
    }

    ///
    /// Reading area
    ///

    read(ch){
        if(!this.session)
            this.reset()

        let res = new Char(ch)
        res.seqs = {}
        res.newSeqs = {}

        function addSeq(seq){
            let name = seq.name 

            if(!this.session.seqs[name]){
                let sseq = new Sequence(seq)
                this.session.seqs[name] = sseq
                res.newSeqs[name] = sseq
            }

            let sseq = this.session.seqs[name]
            sseq.str += ch

            res.seqs[seq.name] = sseq
        }

        let seqFound = false
        for(let s in this.sequenceTypes){
            let seq = this.sequenceTypes[s]
            if(seq.check(ch)){
                seqFound = true
                addSeq(seq)
            }
        }

        if(!seqFound){
            addSeq(this.defaultSequenceType)
        }

        res.oldSeqs = {}
        for(let s in this.session.seqs){
            if(!res.seqs[s]){
                let seq = this.session.seqs[s]
                res.oldSeqs[s] = seq
                delete this.session.seqs[s]
            }
        }

        return res
    }

    reset(){
        this.session = {
            seqs: {}
        }
    }
}

class Char {
    constructor(ch){
        this.ch = ch
    }
}

class Sequence {
    constructor(type){
        this.type = type
        this.str = ''
    }    
}

class SequenceType {
    constructor(name){
        this.name = name

        this.parents = []
        this.series = []
    }

    setRange(min, max){
        this.min = min
        this.max = max 
        this.hasRange = true
        return this
    }

    setSeries(){
        for(let a of arguments){
            if(a instanceof SequenceType){
                a.parents.push(this)
            }

            this.series.push(a)
        }

        return this
    }    

    check(ch){
        if(this.hasRange)
            return ch >= this.min && ch <= this.max

        for(let seq of this.series){
            if(seq instanceof SequenceType){
                if(seq.check(ch))
                    return true            
            }
            else {
                if(seq == ch)
                    return true
            }
        }

        return false
    }
}

///
/// Synthetizer
///

export class UniSynth {
    constructor(){
        this.patterns = {}
        this.stack = null
    }

    reset(){
        this.stack = new Stack(this, null)
    }

    readRes(res){

    }

    getPattern(name){
        if(!this.patterns[name]){
            let pat = new Pattern(this)
            pat.name = name 

            this.patterns[name] = pat
        }

        return this.patterns[name]
    }

    enter(){
        this.stack = new Stack(this)
    }

    exit(){
        this.stack = this.stack.parent
    }
}

class SythValue {
    constructor(value, type=null){
        this.value = value 
        this.type = type
    }
}

class Pattern {
    constructor(synth){
        this.synth = synth
    }
}

class Stack {
    constructor(synth){
        this.synth = synth
        let parent = this.parent = synth.stack 

        if(parent)
            parent.children.push(parent)

        this.children = []
    }
}