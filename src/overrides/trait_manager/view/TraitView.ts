import { isFunction, isString, isUndefined } from 'underscore';
import { $, SetOptions, View } from '../../../common';
import Component from '../../../dom_components/model/Component';
import EditorModel from '../../../editor/model/Editor';
import { capitalize } from '../../../utils/mixins';
import Trait from '../../../trait_manager/model/Trait';

export default class TraitView extends View<Trait> {
  pfx: string;
  ppfx: string;
  config: any;
  clsField: string;
  elInput!: HTMLInputElement;
  input?: HTMLInputElement;
  $input?: JQuery<HTMLInputElement>;
  eventCapture!: string[];
  noLabel?: boolean;
  em: EditorModel;
  target?: Component;
  createLabel?: (data: { label: string; component: Component; trait: TraitView }) => string | HTMLElement;
  createInput?: (data: ReturnType<TraitView['getClbOpts']>) => string | HTMLElement;

  events: any = {};
  models: any;

  appendInput = true;

  /** @ts-ignore */
  attributes() {
    return this.models && this.models[0].get('attributes');
  }

  templateLabel(cmp?: Component) {
    const { ppfx } = this;
    const label = this.getLabel();
    return `<div class="${ppfx}label" title="${label}">${label}</div>`;
  }

  templateInput(data: ReturnType<TraitView['getClbOpts']>) {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  }

  constructor(o: any = {}) {
    super(o);
    const { config = {} } = o;
    const { model, eventCapture } = this;
    this.models = o.models;
    // const { target } = model;
    // const { type } = model.attributes;
    const type = this.models ? this.models[0].attributes.type : '';
    this.config = config;
    this.em = config.em;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    //this.target = target;
    this.className = this.pfx + 'trait';
    this.clsField = `${this.ppfx}field ${this.ppfx}field-${type}`;
    const evToListen: [string, any][] = [
      ['change:value', this.onValueChange],
      ['remove', this.removeView],
    ];
    evToListen.forEach(([event, clb]) => {
      this.models &&
        this.models.forEach((modelRef: any) => {
          modelRef.off(event, clb);
          this.listenTo(modelRef, event, clb);
        });
    });
    this.models &&
      this.models.forEach((modelRef: any) => {
        modelRef.view = this;
        this.listenTo(modelRef, 'change:label', this.render);
        this.listenTo(modelRef, 'change:placeholder', this.rerender);
      });
    this.events = {};
    eventCapture.forEach(event => (this.events[event] = 'onChange'));
    this.delegateEvents();
    this.init();
  }

  getClbOpts() {
    return {
      component: this.models,
      trait: this.models,
      elInput: this.getInputElem(),
    };
  }

  removeView() {
    this.remove();
    this.removed();
  }

  init() {}
  removed() {}
  onRender(props: ReturnType<TraitView['getClbOpts']>) {}
  onUpdate(props: ReturnType<TraitView['getClbOpts']>) {}
  onEvent(props: ReturnType<TraitView['getClbOpts']> & { event: Event }) {}

  /**
   * Fires when the input is changed
   * @private
   */
  onChange(event: Event) {
    const el = this.getInputElem();

    if (el) {
      // favor the query-selected input value because for some reason
      // "sometimes" the el.value is old
      let valueToUse = el.value;
      const input = el.querySelector('input'); // alas, Javascript...
      if (input && input.value) {
        valueToUse = input.value;
      }

      if (!isUndefined(valueToUse)) {
        const { em } = this;
        em.trigger('traitview:change', this, this.models, valueToUse); // this event is not a native GrapesJS event, it was added for CCIDE

        //** CCIDE optimization
        const setProperty = function (modelRef: any, value: any) {
          modelRef.set('value', value, { fromInput: 1 });
        };

        const magicIndex = this.models.length - 1; //upper limit of for loop & index of last models element
        if (magicIndex > 0) {
          // @ts-ignore
          this.em.disableCollectionUpdateEventHandling && this.em.disableCollectionUpdateEventHandling();

          for (let i = 0; i < magicIndex; i += 1) {
            try {
              setProperty(this.models[i], valueToUse);
            } catch (e) {
              console.error('Error setting trait', e);
            }
          }

          // @ts-ignore
          this.em.enableCollectionUpdateEventHandling && this.em.enableCollectionUpdateEventHandling();
        }

        setProperty(this.models[magicIndex], valueToUse);
      }
    }

    this.onEvent({
      ...this.getClbOpts(),
      event,
    });
  }

  getValueForTarget() {
    return this.models[0].get('value');
  }

  setInputValue(value: string) {
    const el = this.getInputElem();
    el && (el.value = value);
  }

  /**
   * On change callback
   * @private
   */
  onValueChange(model: Trait, value: string, opts: SetOptions & { fromTarget?: boolean } = {}) {
    if (opts.fromTarget) {
      this.setInputValue(model.get('value'));
      this.postUpdate();
    } else {
      const val = this.getValueForTarget();
      model.setTargetValue(val, opts);
    }
  }

  /**
   * Render label
   * @private
   */
  renderLabel() {
    const { $el } = this;
    const label = this.getLabel();
    let tpl: string | HTMLElement = this.templateLabel(this.models[this.models.length - 1]);

    if (this.createLabel) {
      tpl =
        this.createLabel({
          label,
          component: this.models[0],
          trait: this,
        }) || '';
    }

    $el.find('[data-label]').append(tpl);
  }

  /**
   * Returns label for the input
   * @return {string}
   * @private
   */
  getLabel() {
    const { em } = this;
    // const { label, name } = this.model.attributes;
    const { label, name } = this.models ? this.models[this.models.length - 1].attributes : { label: '', name: '' };
    return em.t(`traitManager.traits.labels.${name}`) || capitalize(label || name).replace(/-/g, ' ');
  }

  /**
   * Returns current target component
   */
  getComponent() {
    return this.models[0];
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const { em } = this;
      const md = this.models ? this.models[0] : undefined;
      const { name } = this.models ? this.models[0].attributes : { name: '' };
      const placeholder = md.get('placeholder') || md.get('default') || '';
      const type = md.get('type') || 'text';
      const min = md.get('min');
      const max = md.get('max');
      const value = this.getModelValue();
      const input: JQuery<HTMLInputElement> = $(`<input type="${type}">`);
      const i18nAttr = em.t(`traitManager.traits.attributes.${name}`) || {};
      input.attr({
        placeholder,
        ...i18nAttr,
      });

      if (!isUndefined(value)) {
        md.set({ value }, { silent: true });
        input.prop('value', value);
      }

      if (min) {
        input.prop('min', min);
      }

      if (max) {
        input.prop('max', max);
      }

      this.$input = input;
    }
    return this.$input.get(0);
  }

  getInputElem() {
    const { input, $input } = this;
    return input || ($input && $input.get && $input.get(0)) || this.getElInput();
  }

  getModelValue() {
    let value;
    const models = this.models;
    const target = this.models[0];
    const name = models ? models[0].get('name') : '';

    if (models && models[0].get('changeProp')) {
      value = target.get(name);
    } else {
      const attrs = target.attributes;
      value = (models && models[0].get('value')) || attrs[name];
    }

    return !isUndefined(value) ? value : '';
  }

  getElInput() {
    return this.elInput;
  }

  /**
   * Renders input
   * @private
   * */
  renderField() {
    const { $el, appendInput, models } = this;
    const inputs = $el.find('[data-input]');
    const el = inputs[inputs.length - 1];
    let tpl: HTMLElement | string | undefined = models && models[models.length - 1].el;

    if (!tpl) {
      tpl = this.createInput ? this.createInput(this.getClbOpts()) : this.getInputEl();
    }

    if (isString(tpl)) {
      el.innerHTML = tpl;
      this.elInput = el.firstChild as HTMLInputElement;
    } else {
      appendInput ? el.appendChild(tpl!) : el.insertBefore(tpl!, el.firstChild);
      this.elInput = tpl as HTMLInputElement;
    }

    models[models.length - 1].el = this.elInput;
  }

  hasLabel() {
    const { label } = this.models ? this.models[0].attributes : { label: '' };
    return !this.noLabel && label !== false;
  }

  rerender() {
    delete this.models.el;
    this.render();
  }

  postUpdate() {
    this.onUpdate(this.getClbOpts());
  }

  render() {
    const { $el, pfx, ppfx, models } = this;
    const { type, id } = models ? models[0].attributes : { type: '', id: '' };
    const hasLabel = this.hasLabel && this.hasLabel();
    const cls = `${pfx}trait`;
    delete this.$input;
    let tmpl = `<div class="${cls} ${cls}--${type}">
      ${hasLabel ? `<div class="${ppfx}label-wrp" data-label></div>` : ''}
      <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type}" data-input>
        ${
          this.templateInput
            ? isFunction(this.templateInput)
              ? this.templateInput(this.getClbOpts())
              : this.templateInput
            : ''
        }
      </div>
    </div>`;
    $el.empty().append(tmpl);
    hasLabel && this.renderLabel();
    this.renderField();
    this.el.className = `${cls}__wrp ${cls}__wrp-${id}`;
    this.postUpdate();
    this.onRender(this.getClbOpts());
    return this;
  }
}
TraitView.prototype.eventCapture = ['change'];
