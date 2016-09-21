import { camelize } from 'humps';
import compose from 'ramda/src/compose';

/**
 * @constant observers
 * @type {WeakMap}
 */
const observers = new WeakMap();

/**
 * @constant attributes
 * @type {WeakMap}
 */
const attributes = new WeakMap();

/**
 * @method removePrefix
 * @param {String} name
 * @return {String}
 */
const removePrefix = name => name.replace('data-', '');

/**
 * @method transform
 * @param {NamedNodeMap} attributes
 * @return {Object}
 */
const transform = attributes => {

    return Object.keys(attributes).reduce((acc, index) => {

        // Transform each attribute into a plain object.
        const model = attributes[index];
        const label = compose(camelize, removePrefix);

        return { ...acc, [label(model.nodeName)]: model.nodeValue };

    }, Object.create(null));

};

export default props => {

    // Obtain the reference to the observer, using the WeakMap to query whether we have an existing
    // one to utilise before creating another.
    const hasObserver = observers.has(props.node);
    const observer = hasObserver ? observers.get(props.node) : new MutationObserver(() => {

        // Remove the existing memorisation of the node's attributes before re-rendering.
        attributes.delete(props.node);
        props.render();

    });

    observer.observe(props.node, { attributes: true });
    !hasObserver && observers.set(props.node, observer);

    // Parse all of the attributes on the node, and nested those into the props passed.
    const attrs = attributes.get(props.node) || transform(props.node.attributes);
    attributes.set(props.node, attrs);

    // Clean up the observer if the node is no longer present in the DOM.
    !props.node.isConnected && observer.disconnect();

    return { ...props, attrs };

};
