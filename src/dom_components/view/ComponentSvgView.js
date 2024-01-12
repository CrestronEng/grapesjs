import ComponentView from 'overrides/dom_components/view/ComponentView';

export default ComponentView.extend({
  _createElement: function(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }
});
