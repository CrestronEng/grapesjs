import DomainViews from '../../../domain_abstract/view/DomainViews';
import EditorModel from '../../../editor/model/Editor';
import TraitView from './TraitView';
import { ObjectAny } from '../../../common';
import CategoryView from '../../../abstract/ModuleCategoryView';
import Categories from '../../../abstract/ModuleCategories';
import Trait from '../../../trait_manager/model/Trait';
import { includes, isObject, isString } from 'underscore';

export default class TraitsView extends DomainViews {
  reuseView = true;
  em: EditorModel;
  pfx: string;
  ppfx: string;
  componentToggledListener: string;
  categories: Categories;
  renderedCategories = new Map<string, CategoryView>();
  noCatClass: string;
  traitContClass: string;
  catsClass: string;
  catsEl?: HTMLElement;
  traitsEl?: HTMLElement;
  itemView?: any;
  itemType: any;
  rendered?: boolean;
  lastComp: any;
  collection: any;

  constructor(o: any = {}, itemsView: any) {
    super(o);
    this.itemsView = itemsView;
    const config = o.config || {};

    const em = o.editor;
    this.config = config;
    this.em = em;
    this.ppfx = config.pStylePrefix || '';
    this.pfx = config.stylePrefix || '';
    this.className = `${this.pfx}traits`;
    this.categories = o.categories || '';
    this.noCatClass = `${this.ppfx}traits-no-cat`;
    this.traitContClass = `${this.ppfx}traits-c`;
    this.catsClass = `${this.ppfx}trait-categories`;
    this.listenTo(em, 'component:toggled', this.updatedCollection);
    this.componentToggledListener = 'component:toggled'; //** CCIDE select / deselect optimization
    //** CCIDE select / deselect optimization
    this.enableViewCollectionUpdatedEventHandler();
    this.updatedCollection();
  }

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const { ppfx, em } = this;
    const comp = em.getSelectedAll();
    // check if there are more than one component selected and get the last selected value (last elemented pushed)
    this.lastComp = comp.length > 0 ? comp[comp.length - 1] : undefined;
    this.el.className = `${this.className} ${this.traitContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    // @ts-ignore
    this.collection = {};
    comp.length &&
      comp.forEach(comp => {
        var self = this; // need to keep upper level scope
        self.lastComp?.get('traits')?.each((trait: any) => {
          var tta;
          if ((tta = comp?.get('traits')?.findWhere({ name: trait.get('name') }))) {
            if (self.collection[tta.id]) {
              self.collection[tta.id].push(tta);
            } else {
              self.collection[tta.id] = [tta];
            }
          }
        });
      });
    // process buckets and clean out unwanted data
    Object.keys(this.collection).forEach(key => {
      if (this.collection[key] && this.collection[key].length != comp.length) {
        delete this.collection[key];
      }
    });

    // Need to guard access to each, due to being undefined in some observed cases where collection is not a backbone collection.
    this.collection.each &&
      this.collection.each(function (model: any) {
        model.set('visible', true);
      });
    this.render();
  }
  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   */
  addTo(model: Trait) {
    this.add(model);
  }

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(models: any, fragment?: DocumentFragment) {
    // const { config, renderedCategories } = this;
    const { config, reuseView, items, renderedCategories } = this;
    const itemsView = (this.itemsView || {}) as ObjectAny;
    const inputTypes = [
      'button',
      'checkbox',
      'color',
      'date',
      'datetime-local',
      'email',
      'file',
      'hidden',
      'image',
      'month',
      'number',
      'password',
      'radio',
      'range',
      'reset',
      'search',
      'submit',
      'tel',
      'text',
      'time',
      'url',
      'week',
    ];
    var itemView = this.itemView;
    var typeField = models ? models[models.length - 1].get(this.itemType) : '';
    let view;
    if (itemsView[typeField]) {
      itemView = itemsView[typeField];
    } else if (typeField && !itemsView[typeField] && !includes(inputTypes, typeField)) {
      this.itemViewNotFound(typeField);
    }
    if (models.view && reuseView) {
      view = models.view;
    } else {
      view = new itemView({ models: models, config }, config);
    }
    const rendered = view.render().el;
    var category = models ? models[models.length - 1].get('category') : '';

    // Check for categories
    if (category && this.categories && !config.ignoreCategories) {
      if (isString(category)) {
        category = {
          id: category,
          label: category,
        };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      const catModel = this.categories.add(category);
      const catId = catModel.get('id')!;
      const categories = this.getCategoriesEl();
      let catView = renderedCategories.get(catId);
      //@ts-ignore
      models[models.length - 1].set('category', catModel, { silent: true });

      if (!catView && categories) {
        catView = new CategoryView(
          {
            model: catModel,
          },
          config,
          'trait'
        ).render();
        renderedCategories.set(catId, catView);
        categories.appendChild(catView.el);
      }

      catView && catView.append(rendered);
      return;
    }
    items && items.push(view);
    fragment ? fragment.appendChild(rendered) : this.$el.append(rendered);
  }

  getCategoriesEl() {
    if (!this.catsEl) {
      this.catsEl = this.el.querySelector(`.${this.catsClass}`)!;
    }
    return this.catsEl;
  }

  getTraitsEl() {
    if (!this.traitsEl) {
      this.traitsEl = this.el.querySelector(`.${this.noCatClass} .${this.traitContClass}`)!;
    }

    return this.traitsEl;
  }

  append(el: HTMLElement | DocumentFragment) {
    let traits = this.getTraitsEl();
    traits && traits.appendChild(el);
  }

  render() {
    const ppfx = this.ppfx;
    const frag = document.createDocumentFragment();
    delete this.catsEl;
    delete this.traitsEl;
    this.renderedCategories = new Map();
    this.el.innerHTML = `
    <div class="${this.catsClass}"></div>
    <div class="${this.noCatClass}">
    <div class="${this.traitContClass}"></div>
    </div>
    `;
    if (Object.keys(this.collection).length) {
      Object.keys(this.collection).forEach(key => {
        // this.collection[key][0].get('visible') && // we don't use filter for traits
        this.add(this.collection[key], frag);
      }, this);
    }
    this.$el.append(frag);
    const cls = `${this.className} ${this.traitContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    this.rendered = true;
    return this;
  }
  disableViewCollectionUpdatedEventHandler() {
    //** CCIDE select / deselect optimization
    this.stopListening(this.em, this.componentToggledListener, this.updatedCollection);
  }
  enableViewCollectionUpdatedEventHandler() {
    //** CCIDE select / deselect optimization
    this.listenTo(this.em, this.componentToggledListener, this.updatedCollection);
  }
}

// @ts-ignore
TraitsView.prototype.itemView = TraitView;
