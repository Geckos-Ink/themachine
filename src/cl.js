#!/usr/bin/env node

import fs from 'fs'
import {TheMachine} from './index.js'

// Access command-line arguments
const args = process.argv.slice(2);

if(args.length == 1){
    let read = fs.readFileSync(args[0]).toString()
    console.log("to read: ", read)
}
