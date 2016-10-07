'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// import * as babylon from 'babylon';
// import template from 'babel-template';
// import generate from 'babel-generator';
/* eslint-disable new-cap */
/**
 * in(seajs):
 *      require.async(['a', 'b'], function(a, b){})
*  out(asynchronous cmd):
*       require.ensure(['a', 'b'], function(require){
*           (function(a, b){}).apply(null, ...[require('a'), require('b')]);
*       })
*/

// use a builder will result in problems about "parentPath" and "scope", don't know why
// const builder = template(`
//         require.ensure(DEPS, function(require){
//            (FN).apply(null, REQUIRES);
//         });
//     `);

function getRequires(t, depArgument) {
    var deps = depArgument.type === 'ArrayExpression' ? depArgument.elements : [depArgument];
    return t.ArrayExpression(deps.map(function (d) {
        return t.CallExpression(t.Identifier('require'), [d]);
    }));
}

exports.default = function (_ref) {
    var t = _ref.types;

    return {
        visitor: {
            CallExpression: function CallExpression(path, state) {
                var node = path.node;
                var callee = node.callee;
                var args = node.arguments;

                if (arguments.length > 0 && callee.type === 'MemberExpression' && callee.object.name === 'require' && callee.property.name === 'async') {
                    // const newAst = builder({
                    //     DEPS: args[0],
                    //     FN: args[1] || template('function noop() {}')({}),
                    //     REQUIRES: getRequires(t, args[0])
                    // });
                    //
                    // *       require.ensure(['a', 'b'], function(require){
                    // *           (function(a, b){}).apply(null, ...[require('a'), require('b')]);
                    // *       })
                    var newAst = t.ExpressionStatement(t.CallExpression(t.MemberExpression(t.Identifier('require'), t.Identifier('ensure')), [args[0], t.FunctionExpression(null, [t.Identifier('require')], t.BlockStatement([t.ExpressionStatement(t.CallExpression(t.MemberExpression(args[1] || t.FunctionExpression(null, [], t.BlockStatement([])), t.Identifier('apply')), [t.NullLiteral(), getRequires(t, args[0])]))]))]));
                    path.replaceWith(newAst);
                }
            }
        }
    };
};