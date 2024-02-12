import DomainViews from '../../../domain_abstract/view/DomainViews';
import EditorModel from '../../../editor/model/Editor';
import TraitView from '../../../trait_manager/view/TraitView';

export default class TraitsView extends DomainViews {
  reuseView = true;
  em: EditorModel;
  pfx: string;
  ppfx: string;
  componentToggledListener: string;

  constructor(o: any = {}, itemsView: any) {
    super(o);
    this.itemsView = itemsView;
    const config = o.config || {};

    const em = o.editor;
    this.config = config;
    this.em = em;
    this.ppfx = config.pStylePrefix || '';
    this.pfx = this.ppfx + config.stylePrefix || '';
    this.className = `${this.pfx}traits`;
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
    const { ppfx, className, em } = this;
    const comp = em.getSelected();
    this.el.className = `${className} ${ppfx}one-bg ${ppfx}two-color`;
    // @ts-ignore
    this.collection = comp ? comp.traits : [];
    this.render();
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
