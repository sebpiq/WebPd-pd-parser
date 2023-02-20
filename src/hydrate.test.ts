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
import assert from 'assert'
import { hydrateNodeControl, hydrateNodePatch } from './hydrate'

describe('hydrate', () => {
    describe('hydrateNodeControl - hsl/vsl', () => {
        it('should hydrate hsl log value correctly', () => {
            const node = hydrateNodeControl({
                id: 'dummy',
                type: 'hsl',
                args: [101, 15, 1, 1000, 1, 1, '', '', '', -2, -8, 0, 10, '#fcfcfc', '#000000', '#000000', 8300, 1]
            })
            assert.deepStrictEqual<PdJson.SliderNode['args']>(node.args, [1, 1000, 1, 309.02954325135886, '', ''])
        })

        it('should hydrate vsl lin value correctly', () => {
            const node = hydrateNodeControl({
                id: 'dummy',
                type: 'vsl',
                args: [15, 201, 0, 1000, 0, 0, '', '', '', 0, -9, 0, 10, '#fcfcfc', '#000000', '#000000', 16800, 1]
            })
            assert.deepStrictEqual<PdJson.SliderNode['args']>(node.args, [0, 1000, 0, 840, '', ''])
        })

        it('should hydrate vsl log value correctly', () => {
            const node = hydrateNodeControl({
                id: 'dummy',
                type: 'vsl',
                args: [15, 201, 10, 1000, 1, 1, '', '', '', 0, -9, 0, 10, '#fcfcfc', '#000000', '#000000', 16100, 1]
            })
            assert.deepStrictEqual<PdJson.SliderNode['args']>(node.args, [10, 1000, 1, 407.380277804113, '', ''])
        })
    })

    describe('hydrateNodePatch', () => {
        it('should hydrate subpatch without name', () => {
            const node = hydrateNodePatch(
                'pd_node_p1',
                { 
                    tokens: ['PATCH', 'p1', '269', '614', 'pd'],
                    lineIndex: 0 
                },
            )
            assert.deepStrictEqual<PdJson.SubpatchNode>(node, {
                id: 'pd_node_p1',
                patchId: 'p1',
                type: 'pd',
                nodeClass: 'subpatch',
                args: [],
                layout: {
                    x: 269,
                    y: 614,
                },
            })
        })
    })
})
