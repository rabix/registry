/**
 * Created by filip on 11/28/14.
 */
'use strict';

var Sort = {
    tsort: function (edges) {
        var nodes = {}, // hash: stringified id of the node => { id: id, afters: list of ids }
            sorted = [], // sorted list of IDs ( returned value )
            visited = {}; // hash: id of already visited node => true

        var errors = [];

        var Node = function (id) {
            this.id = id;
            this.afters = [];
        };

        // 1. build data structures
        edges.forEach(function (v) {
            var from = v.start_node, to = v.end_node;
            if (!nodes[from]) { nodes[from] = new Node(from); }
            if (!nodes[to]) { nodes[to] = new Node(to); }
            nodes[from].afters.push(to);
        });

        // 2. topological sort
        Object.keys(nodes).forEach(function visit(idstr, ancestors) {
            var node = nodes[idstr],
                id = node.id;

            // if already exists, do nothing
            if (visited[idstr]) { return; }

            if (!Array.isArray(ancestors)) { ancestors = []; }

            ancestors.push(id);

            visited[idstr] = true;

            node.afters.forEach(function (afterID) {
                if (ancestors.indexOf(afterID) >= 0) { // if already in ancestors, a closed chain exists.
//                    throw new Error('closed chain : ' + afterID + ' is in ' + id);
                    errors.push('Closed chain : ' + afterID + ' is in ' + id);
                    return false;
                }

                // has to map array not to keep reference of ancestors
                visit(afterID.toString(), ancestors.map(function (v) {
                    return v;
                })); // recursive call
            });

            sorted.unshift(id);
        });

        return {sorted: sorted, errors: errors};
    }
};

module.exports = Sort;

