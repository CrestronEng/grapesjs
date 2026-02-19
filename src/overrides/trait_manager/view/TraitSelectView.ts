import { isString, isUndefined } from 'underscore';
import { $ } from '../../../common';
import TraitView from './TraitView';

export default class TraitSelectView extends TraitView {
  constructor(o = {}) {
    super(o);
    this.models && this.listenTo(this.models[0], 'change:options', this.rerender);
  }

  templateInput() {
    const { ppfx, clsField } = this;
    return `<div class="${clsField}">
      <div data-input></div>
      <div class="${ppfx}sel-arrow">
        <div class="${ppfx}d-s-arrow"></div>
      </div>
    </div>`;
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const { models, em } = this;
      const propName = models && models[0].get('name');
      const opts = (models && models[0].get('options')) || [];
      const values: string[] = [];
      let input = '<select>';

      opts.forEach((el: any) => {
        let attrs = '';
        let name, value, style;

        if (isString(el)) {
          name = el;
          value = el;
        } else {
          name = el.name || el.label || el.value;
          value = `${isUndefined(el.value) ? el.id : el.value}`.replace(/"/g, '&quot;');
          style = el.style ? el.style.replace(/"/g, '&quot;') : '';
          attrs += style ? ` style="${style}"` : '';
        }
        const resultName = em.t(`traitManager.traits.options.${propName}.${value}`) || name;
        input += `<option value="${value}"${attrs}>${resultName}</option>`;
        values.push(value);
      });

      input += '</select>';
      this.$input = $(input);
      const val = models && models[0].getTargetValue();
      const valResult = models && values.indexOf(val) >= 0 ? val : models[0].get('default');
      !isUndefined(valResult) && this.$input!.val(valResult);
    }

    return this.$input!.get(0);
  }
}
