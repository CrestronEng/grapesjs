import Backbone from 'backbone';
import Device from './Device';

export default Backbone.Collection.extend({
  model: Device,

  comparator: (left, right) => {
    const max = Number.MAX_VALUE;
    return (left.get('priority') || max) - (right.get('priority') || max);
  },

  getSorted() {
    return this.sort();
  }
});
