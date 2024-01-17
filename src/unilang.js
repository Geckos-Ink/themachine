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
        const newLineR = this.sequenceType('newLineR').setSeries('\r')
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

        const addSeq = (seq)=>{
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

        if(this.synth)
            this.synth.readRes(res)

        return res
    }

    reset(){
        this.session = {
            seqs: {}
        }

        if(this.synth)
            this.synth.reset()
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

    is(name){
        return this.type.name == name
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
///
/// Synthetizer
///
///

export class UniSynth {
    constructor(lang){        
        this.patterns = new Pattern(this)

        this.lang = lang
    }

    reset(){
        this.patterns.reset()
    }

    readRes(res){
        let seqs = res.oldSeqs

        let winner = null
        for(let s in seqs){
            let winner = this.patterns.check(seqs[s])
            if(winner)
                break;
        }

        //if(winner) winner.confirm()
    }
}

class Pattern {
    constructor(synth){
        this.synth = synth
        this.patterns = {}        
        this.patternsToIterate = []      
        this.series = []  

        /// Patterns callback
        this.callback = null
        this.callbacks = {}                   
    }

    addSeries(){
        for(let a in arguments)
            this.series.push(arguments[a])

        return this
    }

    pattern(name, generic=false){
        if(!this.patterns[name]){
            let pat = new Pattern(this.synth)
            pat.name = name 

            this.patterns[name] = pat
        }

        let pattern = this.patterns[name]

        if(!generic){
            this.patternsToIterate.push(pattern)
        }

        return pattern
    }

    begin(seq){
        let stack = new Stack(this.stack)
        stack.pattern = this
        this.stacks.push(stack)

        if(this.$begin)
            this.$begin(stack, seq)

        return stack
    }

    end(stack, seq){
        if(stack.$end)
            stack.$end(stack, seq)        

        // it's possible to set false checking the result of this.$end
        return true 
    }

    check(seq){        
        let endedStacks = []

        const seqSeriesCmp = (seq, series, stack)=>{
            if(!series)
                return 0

            const typeOfSeries = typeof series
            if(typeOfSeries == 'string'){
                return seq.str == this.seriesStart ? 2 : 0
            }
            else if(typeOfSeries == 'object'){
                if(series instanceof SequenceType){
                    return seq.type == series ? 1 : 0
                }
                else if(series instanceof Pattern){
                    let w = series.check(seq)
                    if(w){
                        endedStacks.push(w)                        
                    }
                }
            }

            return -1
        }        

        let cmp = 0
        if((cmp = seqSeriesCmp(seq, this.seriesStart, this.stack)) > 0){
            let stack = this.begin(seq)
            stack.push(seq)
            stack.tokens += cmp
            stack.seriesPos++
        }            

        let stacksToRemove = []

        const remove = (stack)=>{
            stacksToRemove.push(stack)
            return false
        }

        const confirmRemove = () =>{
            for(let stack of stacksToRemove)
                this.stacks.splice(this.stacks.indexOf(stack), 1)

            stacksToRemove = []
        }
        
        const checkStack = (stack) =>{          
            /// Check series pos
            let series = this.series[stack.seriesPos]
            if(series){
                if((cmp = seqSeriesCmp(seq, series, stack))>0){
                    stack.push(seq)
                    stack.tokens += cmp
                    stack.seriesPos++

                    if(stack.seriesPos == this.series.length){                        
                        stack.ended = true
                    }

                    return true
                }
                else if(cmp == -1)
                    return remove(stack)
            }
            
            /// Check callbacks
            if(this.callbacks[seq.type.name]){
                let cbkRes = this.callbacks[seq.type.name](stack, seq)
                if(cbkRes === false){
                    return remove(stack)
                }

                if(cbkRes){
                    stack.push(seq)
                    stack.tokens += cbkRes
                    return true
                }
            }

            if(this.callback){
                let cbkRes = this.callback(stack, seq)
                if(cbkRes === false){
                    return remove(stack)
                }

                if(cbkRes){
                    stack.push(seq)
                    stack.tokens += cbkRes
                    return true
                }
            }            
        }
        
        /// Cycle
        for(let s in this.stacks){
            checkStack(this.stacks[s])
        }

        if(this.stacks.length == 0){
            let stack = this.begin(seq)
            checkStack(stack)
        }


        /// Remove
        confirmRemove()

        /// Check "endeds"        
        for(let stack of this.stacks){
            if(stack.ended){
                if(this.end(stack, seq)){
                    endedStacks.push(stack)
                    remove(stack)
                }
            }
        }

        confirmRemove()

        /// Check generic patterns
        for(let pat of this.patternsToIterate){
            let w = pat.check(seq)
            if(w){
                endedStacks.push(w)
            }
        }

        endedStacks.sort((a, b) => {
            if(a.tokens > b.tokens) return -1
            if(a.tokens < b.tokens) return 1
            return 0
        });        

        let stack = endedStacks[0]

        if(stack)
            this.stack.push(stack)

        return stack
    }

    reset(){
        this.seriesStart = this.series[0]

        this.stacksRes = []
        this.stacks = []
        this.stack = new Stack()
        
        for(let p in this.patterns)
            this.patterns[p].reset()
    }
}

class Stack {
    constructor(parent){
        this.parent = parent     
        this.children = []

        this.tokens = 0
        this.seriesPos = 0
    }

    push(child){
        this.children.push(child)
    }

    confirm(){
        if(this.parent) 
            this.parent.children.push(this.parent)
    }
}