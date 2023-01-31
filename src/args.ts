/*
 * Copyright (c) 2012-2020 Sébastien Piquemal <sebpiq@gmail.com>
 *
 * BSD Simplified License.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.
 *
 * See https://github.com/sebpiq/WebPd_pd-parser for documentation
 *
 */

import { PdJson } from '@webpd/pd-json'

// Regular expressions to detect escaped special chars.
const ESCAPED_DOLLAR_VAR_RE_GLOB = /\\(\$\d+)/g
const ESCAPED_COMMA_VAR_RE_GLOB = /\\,/g
const ESCAPED_SEMICOLON_VAR_RE_GLOB = /\\;/g

// Parses argument to a string or a number.
// Needs to handle the case when the argument is already a number as in the process of gathering
// arguments we sometimes insert a number.
export const parseArg = (rawArg: PdJson.ObjectArg): PdJson.ObjectArg => {
    // Try to parse arg as a number
    try {
        return parseNumberArg(rawArg)
    } catch (err) {
        if (!(err instanceof ValueError)) {
            throw err
        }
    }

    // Try to parse arg as a string
    try {
        return parseStringArg(rawArg)
    } catch (err) {
        if (!(err instanceof ValueError)) {
            throw err
        }
    }

    throw new ValueError(`Not a valid arg ${rawArg}`)
}

// Parses a float from a .pd file. Returns the parsed float or throws ValueError.
export const parseNumberArg = (val: PdJson.ObjectArg): number => {
    if (isNumber(val)) {
        return val
    } else if (isString(val)) {
        // `Number` is better than `parseFloat` for example 
        // which is too flexible.
        // REF : https://stackoverflow.com/questions/3257112/is-it-possible-to-parsefloat-the-whole-string
        const parsed = Number(val)
        if (isNaN(parsed)) {
            throw new ValueError(`Not a valid number arg ${val}`)
        }
        return parsed
    } else {
        throw new ValueError(`Not a valid number arg ${val}`)
    }
}

// Parses a '0' or '1' from a .pd file.
export const parseBoolArg = (val: PdJson.ObjectArg): 0 | 1 => {
    const parsed = parseNumberArg(val)
    if (parsed === 0 || parsed === 1) {
        return parsed
    }
    throw new ValueError(`Should be 0 or 1`)
}

// Apply some operations to a string arg
export const parseStringArg = (val: PdJson.ObjectArg): string => {
    if (!isString(val)) {
        throw new ValueError(`Not a valid string arg ${val}`)
    }

    // Unescape special characters
    let arg = val
        .replace(ESCAPED_COMMA_VAR_RE_GLOB, ',')
        .replace(ESCAPED_SEMICOLON_VAR_RE_GLOB, ';')

    // Unescape dollars
    let matched
    while ((matched = ESCAPED_DOLLAR_VAR_RE_GLOB.exec(arg))) {
        arg = arg.replace(matched[0], matched[1])
    }

    return arg
}

export class ValueError extends Error {}

const isNumber = (obj: unknown): obj is number => Number.isFinite(obj)

const isString = (obj: unknown): obj is string => typeof obj === 'string'
