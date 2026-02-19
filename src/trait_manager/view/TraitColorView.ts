import InputColor from '../../overrides/domain_abstract/ui/InputColor';
import TraitView from '../../overrides/trait_manager/view/TraitView';

export default class TraitColorView extends TraitView {
  templateInput() {
    return '';
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.input) {
      const model = this.model;
      const value = this.getModelValue();
      const inputColor = new InputColor({
        model,
        target: this.config.em,
        contClass: this.ppfx + 'field-color',
        ppfx: this.ppfx,
      });
      const input = inputColor.render();
      input.setValue(value, { fromTarget: 1 });
      this.input = input.el as HTMLInputElement;
    }

    return this.input;
  }
}
