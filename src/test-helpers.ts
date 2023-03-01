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

import { PdJson } from './types'

type ConcisePdConnection = [
    PdJson.LocalId,
    PdJson.PortletId,
    PdJson.LocalId,
    PdJson.PortletId
]

type ConciseNode = Partial<PdJson.Node>

type ConcisePatch = Partial<Omit<PdJson.Patch, 'connections' | 'nodes'>> & {
    nodes?: { [localId: string]: ConciseNode }
    connections?: Array<ConcisePdConnection>
}

type ConciseArray = Partial<PdJson.PdArray>

type ConcisePd = {
    patches: { [patchId: string]: ConcisePatch }
    arrays?: { [arrayId: string]: ConciseArray }
}

export const pdJsonDefaults = (): PdJson.Pd => ({
    patches: {},
    arrays: {},
})

export const pdJsonArrayDefaults = (id: PdJson.GlobalId): PdJson.PdArray => ({
    id,
    args: [`arrayname-${id}`, 100, 0],
    layout: {},
    data: null,
})

export const pdJsonPatchDefaults = (id: PdJson.GlobalId): PdJson.Patch => ({
    id,
    isRoot: true,
    nodes: {},
    args: [],
    outlets: [],
    inlets: [],
    connections: [],
})

export const pdJsonNodeDefaults = (
    id: PdJson.LocalId,
    type?: PdJson.NodeType
): PdJson.GenericNode => ({
    id,
    args: [],
    type: type || 'DUMMY',
    nodeClass: 'generic',
})

export const makeConnection = (
    conciseConnection: ConcisePdConnection
): PdJson.Connection => ({
    source: {
        nodeId: conciseConnection[0],
        portletId: conciseConnection[1],
    },
    sink: {
        nodeId: conciseConnection[2],
        portletId: conciseConnection[3],
    },
})

export const makePd = (concisePd: ConcisePd): PdJson.Pd => {
    const pd: PdJson.Pd = pdJsonDefaults()

    Object.entries(concisePd.patches).forEach(([patchId, concisePatch]) => {
        let nodes: PdJson.Patch['nodes'] = {}
        if (concisePatch.nodes) {
            nodes = Object.entries(concisePatch.nodes).reduce(
                (nodes, [nodeId, conciseNode]) => ({
                    ...nodes,
                    [nodeId]: {
                        ...(pdJsonNodeDefaults(nodeId) as any),
                        ...conciseNode,
                    },
                }),
                {} as PdJson.Patch['nodes']
            )
        }
        pd.patches[patchId] = {
            ...pdJsonPatchDefaults(patchId),
            ...pd.patches[patchId],
            ...concisePatch,
            nodes,
            connections: (concisePatch.connections || []).map(makeConnection),
        }
    })

    if (concisePd.arrays) {
        Object.entries(concisePd.arrays).forEach(([arrayId, conciseArray]) => {
            pd.arrays[arrayId] = {
                ...pdJsonArrayDefaults(arrayId),
                ...conciseArray,
            }
        })
    }

    return pd
}
