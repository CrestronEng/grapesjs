import { isUndefined } from 'underscore';
import Input from '../../../domain_abstract/ui/Input';
import ColorPicker from '../../../utils/ColorPicker';
import $ from '../../../utils/cash-dom';

$ && ColorPicker($);

const getColor = (color: any) => {
  const name = color.getFormat() === 'name' && color.toName();
  const cl = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
  return name || cl.replace(/ /g, '');
};

export default class InputColor extends Input {
  colorEl?: any;
  movedColor?: string;
  noneColor?: boolean;
  model!: any;
  updateFromInputColor?: boolean;
  currentColorValues: any;
  unitEl: any;
  isSettingValue?: boolean;

  template() {
    const ppfx = this.ppfx;
    return `
      <div class="${this.holderClass()}"></div>
      <span class="${ppfx}field-units"></span>
      <div class="${ppfx}field-colorp">
        <div class="${ppfx}field-colorp-c" data-colorp-c>
          <div class="${ppfx}checker-bg"></div>
        </div>
      </div>
    `;
  }

  onColorChange(e: Event) {
    if (this.updateFromInputColor) {
      this.updateFromInputColor = false;
      return;
    }

    //On refocus the currentcolorValues object has to revalidate
    this.revalidateColorObjectOnFocus(this.getInputEl().value);
    this.processSelectedColor();
  }

  onInputColorChange(e: Event) {
    this.updateFromInputColor = true;
    if (this.getInputEl().value == '#' || this.getInputEl().value == 'RGB' || this.getInputEl().value == 'rgb') {
      this.refreshUnitsDropdown(this.getUnitEl().value, this.currentColorValues);
      return;
    } else {
      //On refocus the currentcolorValues object has to revalidate
      this.revalidateColorObjectOnFocus(this.getInputEl().value);
      this.processSelectedColor();
    }
  }

  /**
   * Handled when the view is changed
   */
  onColorUnitChange(e: any) {
    this.updateFromInputColor = true;
    const inputVal = this.getInputEl().value;

    if (inputVal == 'none' || inputVal == 'None') {
      this.initializeColors();
      return;
    }

    //On refocus the currentcolorValues object has to revalidate
    this.revalidateColorObjectOnFocus(inputVal);

    if (JSON.stringify(this.currentColorValues) == JSON.stringify({ Name: '', Hex: '', RGB: '' })) {
      this.processSelectedColor();
    }

    this.processSelectedUnit();
    const unit = this.getUnitEl().value;
    this.refreshUnitsDropdown(unit, this.currentColorValues);
    this.setSelectedColor(unit, this.currentColorValues);
  }

  processSelectedUnit() {
    const inputVal = this.getInputEl().value;

    if (this.isHex(inputVal)) {
      if (this.currentColorValues.Hex != inputVal) {
        this.setColor(this.getColorName(inputVal), this.getRGBValue(inputVal), inputVal);
      }
      return;
    } else if (this.isRGB(inputVal)) {
      if (this.currentColorValues.RGB != inputVal) {
        const hexVal = '#' + this.getColorHexByRGB(inputVal);
        this.setColor(this.getColorName(hexVal), inputVal, hexVal);
      }
      return;
    } else if (this.isName(inputVal)) {
      if (this.currentColorValues.Name != inputVal) {
        const hexVal = '#' + this.getHexValue(inputVal);
        this.setColor(inputVal, this.getRGBValue(hexVal), hexVal);
      }
      return;
    }
  }

  processSelectedColor() {
    const inputVal = this.getInputEl().value;

    if (!this.updateFromInputColor) {
      if (this.isHex(inputVal)) {
        this.getUnitEl().value = 'Hex';
      } else if (this.isRGB(inputVal)) {
        this.getUnitEl().value = 'RGB';
      } else if (this.getHexValue(inputVal) != undefined) {
        this.getUnitEl().value = 'Name';
      }
    }

    const unit = this.getUnitEl().value;

    switch (unit) {
      case 'Hex': {
        if (!this.isValidHexInput(inputVal)) {
          this.resetInput();
        } else {
          let hexVal = '';
          if (!inputVal.startsWith('#')) {
            hexVal = '#' + inputVal;
          } else {
            hexVal = inputVal;
          }

          this.setColor(this.getColorName(inputVal), this.getRGBValue(hexVal), hexVal);
        }
        break;
      }
      case 'RGB': {
        if (!this.isValidRGBInput(inputVal)) {
          this.resetInput();
        } else {
          const rgbVal = inputVal.replace(/\s+/g, '');
          const hexVal = '#' + this.getColorHexByRGB(rgbVal);
          this.setColor(this.getColorName(hexVal), rgbVal, hexVal);
        }
        break;
      }
      case 'Name': {
        if (this.isHex(inputVal) || this.isRGB(inputVal) || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(inputVal)) {
          this.resetInput();
        } else {
          //Check for invalid name or random input
          if (this.getHexValue(inputVal) == undefined) {
            this.setSelectedColor(unit, this.currentColorValues);
            return;
          }

          const hexVal = '#' + this.getHexValue(inputVal);
          this.setColor(inputVal, this.getRGBValue(hexVal), hexVal);
        }
        break;
      }
      default: {
        break;
      }
    }

    this.refreshUnitsDropdown(unit, this.currentColorValues);
    this.setSelectedColor(unit, this.currentColorValues);
  }

  revalidateColorObjectOnFocus(inputVal: any) {
    if (JSON.stringify(this.currentColorValues) == JSON.stringify({ Name: '', Hex: '', RGB: '' })) {
      if (this.isHex(inputVal)) {
        this.currentColorValues.Name = this.getColorName(inputVal);
        this.currentColorValues.Hex = inputVal;
        this.currentColorValues.RGB = this.getRGBValue(inputVal);
        return;
      }

      if (this.isRGB(inputVal)) {
        const hexVal = '#' + this.getColorHexByRGB(inputVal);
        this.currentColorValues.RGB = inputVal;
        this.currentColorValues.Name = this.getColorName(hexVal);
        this.currentColorValues.Hex = hexVal;
        return;
      }

      if (!this.isHex(inputVal) && !this.isRGB(inputVal)) {
        const hexVal = '#' + this.getHexValue(inputVal);
        this.currentColorValues.Name = inputVal;
        this.currentColorValues.RGB = this.getRGBValue(hexVal);
        this.currentColorValues.Hex = hexVal;
        return;
      }
    }
  }

  setColor(name: any, rgb: any, hex: string) {
    if (this.currentColorValues == null || this.currentColorValues == undefined)
      this.currentColorValues = { Name: '', Hex: '', RGB: '' };

    this.currentColorValues.RGB = rgb;
    this.currentColorValues.Hex = hex;
    this.currentColorValues.Name = name;
  }

  refreshUnitsDropdown(
    selectedUnit: string,
    colorObj: { Name: string | undefined; RGB: string | undefined; Hex: string | undefined }
  ) {
    if (!colorObj || !selectedUnit) return;

    const units = ['Hex', 'RGB', 'Name'];

    if (units.length) {
      let options: string[] = [];

      units.forEach(unit => {
        if (unit === 'Name') {
          if (colorObj.Name != '' && colorObj.Name != undefined && selectedUnit == 'Name') {
            options.push(`<option selected>${unit}</option>`);
          } else if (colorObj.Name == '' || colorObj.Name == undefined) {
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorObj.Name != '') {
            options.push(`<option>${unit}</option>`);
          }
        }

        if (unit === 'RGB') {
          if (colorObj.RGB != '' && colorObj.RGB != undefined && selectedUnit == 'RGB') {
            options.push(`<option selected>${unit}</option>`);
          } else if (colorObj.RGB == '' || colorObj.RGB == undefined) {
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorObj.RGB != '' || colorObj.RGB != undefined) {
            options.push(`<option>${unit}</option>`);
          }
        }

        if (unit === 'Hex') {
          if (colorObj.Hex != '' && colorObj.Hex != undefined && selectedUnit == 'Hex') {
            options.push(`<option selected>${unit}</option>`);
          } else if (colorObj.Hex == '' || colorObj.RGB == undefined) {
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorObj.Hex != '' || colorObj.RGB != undefined) {
            options.push(`<option>${unit}</option>`);
          }
        }
      });

      this.unitEl.innerHTML = `<select class="${this.ppfx}input-unit">${options.join('')}</select>`;
    }
  }

  setSelectedColor(selectedUnit: any, currentColorValues: { Name: string; RGB: string; Hex: string }) {
    switch (selectedUnit) {
      case 'Name': {
        this.setValue(currentColorValues.Name + 'Name');
        this.getInputEl().value = currentColorValues.Name;
        break;
      }
      case 'RGB': {
        this.setValue(currentColorValues.RGB + 'RGB');
        this.getInputEl().value = currentColorValues.RGB;
        break;
      }
      case 'Hex': {
        this.setValue(currentColorValues.Hex + 'Hex');
        this.getInputEl().value = currentColorValues.Hex;
        break;
      }
      default:
        break;
    }
  }

  getHexValue(colorName: string) {
    if (this.isHex(colorName)) {
      colorName = colorName.substring(1);
    }
    colorName = colorName.toLowerCase();
    // @ts-ignore
    const tinyColor = window.tinycolor;
    const hexVal = tinyColor.names[colorName];
    return hexVal;
  }

  getRGBValue(colorHex: string) {
    // @ts-ignore
    const tinyColor = window.tinycolor;
    const rgb = tinyColor(colorHex).toRgbString();
    return rgb;
  }

  getColorName(colorHex: string) {
    if (this.isHex(colorHex)) {
      colorHex = colorHex.substring(1);
    }
    colorHex = colorHex.toLowerCase();
    // @ts-ignore
    const tinyColor = window.tinycolor;
    const name = tinyColor.hexNames[colorHex];
    return name != 'undefined' ? name : '';
  }

  getColorHexByRGB(rgb: string) {
    // @ts-ignore
    const tinyColor = window.tinycolor;
    let hexValue = tinyColor(rgb).toHex8();
    let alpha = tinyColor(rgb).getCurrentAlpha();
    if (rgb == 'rgb(0, 0, 0)' || alpha == 1) {
      hexValue = tinyColor(rgb).toHex();
    }

    return hexValue;
  }

  inputClass() {
    const ppfx = this.ppfx;
    return `${ppfx}field ${ppfx}field-color`;
  }

  holderClass() {
    return `${this.ppfx}input-holder`;
  }

  remove() {
    super.remove();
    this.colorEl.spectrum('destroy');
    return this;
  }

  /**
   * Set value to the model
   * @param {string} val
   * @param {Object} opts
   */
  setValue(val: string, opts: any = {}) {
    if (this.isSettingValue) {
      return;
    }
    this.isSettingValue = true;

    const { model } = this;
    const def = !isUndefined(opts.def) ? opts.def : model.get('defaults');
    const value = !isUndefined(val) ? val : !isUndefined(def) ? def : '';
    const inputEl = this.getInputEl();
    const colorEl = this.getColorEl();
    const valueClr = value != 'none' ? value : '';
    inputEl.value = value;
    colorEl.get(0).style.backgroundColor = valueClr;

    // This prevents from adding multiple thumbs in spectrum
    if (opts.fromTarget || (opts.fromInput && !opts.avoidStore)) {
      colorEl.spectrum('set', valueClr);
      this.noneColor = value == 'none';
      this.movedColor = valueClr;
    }

    //On refocusing the control, based on the color value we need to set the unit
    if (valueClr) {
      const selectedUnit = this.getUnitEl().value;
      if (this.isHex(valueClr) && selectedUnit != 'Hex') {
        this.getUnitEl().value = 'Hex';
        this.onColorUnitChange(null);
      } else if (this.isRGB(valueClr) && selectedUnit != 'RGB') {
        this.getUnitEl().value = 'RGB';
        this.onColorUnitChange(null);
      } else if (this.isName(valueClr) && this.getHexValue(valueClr) != undefined && selectedUnit != 'Name') {
        this.getUnitEl().value = 'Name';
        this.onColorUnitChange(null);
      } else {
        this.initializeColors();
        this.revalidateColorObjectOnFocus(valueClr);
        this.refreshUnitsDropdown(selectedUnit, this.currentColorValues);
      }
    }
    this.isSettingValue = false;
  }

  /**
   * Get the color input element
   * @return {HTMLElement}
   */
  getColorEl() {
    if (!this.colorEl) {
      const { em, model, opts } = this;
      const ppfx = this.ppfx;
      const { onChange } = opts;

      let colorEl = $(`<div class="${this.ppfx}field-color-picker"></div>`);
      let cpStyle = colorEl.get(0)!.style;
      let elToAppend = em && em.config ? em.config.el : '';
      let colorPickerConfig = (em && em.getConfig && em.getConfig().colorPicker) || {};

      this.movedColor = '';
      let changed = false;
      let previousColor: string;
      this.$el.find('[data-colorp-c]').append(colorEl);

      const handleChange = (value: string, complete = true) => {
        if (onChange) {
          onChange(value, !complete);
        } else {
          complete && model.setValueFromInput(0, false); // for UndoManager
          model.setValueFromInput(value, complete);
        }
      };

      // @ts-ignore
      colorEl.spectrum({
        color: model.getValue() || false,
        containerClassName: `${ppfx}one-bg ${ppfx}two-color`,
        appendTo: elToAppend || 'body',
        maxSelectionSize: 8,
        showPalette: true,
        showAlpha: true,
        chooseText: 'Ok',
        cancelText: '⨯',
        palette: [],

        // config expanded here so that the functions below are not overridden
        ...colorPickerConfig,
        ...(model.get('colorPicker') || {}),

        move: (color: any) => {
          const cl = getColor(color);
          this.movedColor = cl;
          cpStyle.backgroundColor = cl;
          handleChange(cl, false);
        },
        change: (color: any) => {
          changed = true;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          handleChange(cl);
          this.noneColor = false;
        },
        show: (color: any) => {
          changed = false;
          this.movedColor = '';
          previousColor = onChange ? model.getValue({ noDefault: true }) : getColor(color);
        },
        hide: () => {
          if (!changed && (previousColor || onChange)) {
            if (this.noneColor) {
              previousColor = '';
            }
            cpStyle.backgroundColor = previousColor;
            // @ts-ignore
            colorEl.spectrum('set', previousColor);
            handleChange(previousColor, false);
          }
        },
      });

      if (em && em.on!) {
        em.on('component:selected', () => {
          this.movedColor && handleChange(this.movedColor);
          changed = true;
          this.movedColor = '';
          // @ts-ignore
          colorEl.spectrum('hide');
        });
      }

      this.colorEl = colorEl;
    }
    return this.colorEl;
  }

  getUnitEl() {
    if (!this.unitEl) {
      const units = ['Hex', 'RGB', 'Name'];

      if (units.length) {
        const options: string[] = [];

        units.forEach(unit => {
          options.push(`<option >${unit}</option>`);
        });

        const temp = document.createElement('div');
        temp.innerHTML = `<select class="${this.ppfx}input-unit">${options.join('')}</select>`;
        this.unitEl = temp.firstChild;
      }
    }

    return this.unitEl;
  }

  initializeColors() {
    this.currentColorValues = { Name: '', Hex: '', RGB: '' };
    this.getUnitEl();
  }

  resetInput() {
    let val = '';
    if (this.model && this.model.attributes && this.model.attributes.value) {
      val = this.model.attributes.value;
      this.currentColorValues = { Name: '', Hex: '', RGB: '' };
      this.revalidateColorObjectOnFocus(val);
    } else {
      this.getInputEl().value = '';
      this.getUnitEl();
    }
  }

  isRGB(inputVal: string) {
    return inputVal.startsWith('RGB') || inputVal.startsWith('rgb');
  }

  isHex(inputVal: string) {
    return inputVal.startsWith('#');
  }

  isName(inputVal: string) {
    return !this.isRGB(inputVal) && !this.isHex(inputVal);
  }

  isValidRGBInput(inputVal: string) {
    let range = '(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|2[0-5]{2})';
    let rgb = new RegExp('^rgb\\(\\s*' + range + '\\s*,\\s*' + range + '\\s*,\\s*' + range + '\\s*\\)$');
    return rgb.test(inputVal);
  }

  isValidHexInput(inputVal: string) {
    return this.isHex(inputVal) && inputVal.match(/[0-9A-Fa-f]{6}/g);
  }

  handleChange(e: any) {
    e.stopPropagation();
    const { value } = e.target;
    if (isUndefined(value)) return;
    this.__onInputChange(value);
  }

  __onInputChange(val: string) {
    const { model, opts } = this;
    const { onChange } = opts;
    let value = val;
    const colorEl = this.getColorEl();

    // Check the color by using the ColorPicker's parser
    if (colorEl) {
      colorEl.spectrum('set', value);
      const tc = colorEl.spectrum('get');
      const color = value && getColor(tc);
      color && (value = color);
    }

    onChange ? onChange(value) : model.set({ value }, { fromInput: 1 });
  }

  render() {
    Input.prototype.render.call(this);
    this.unitEl = null;
    this.updateFromInputColor = false;
    this.isSettingValue = false;
    this.getColorEl();
    const unit = this.getUnitEl();
    this.initializeColors();
    // This will make the color input available on render
    // @ts-ignore
    unit && this.$el.find(`.${this.ppfx}field-units`).get(0).appendChild(unit);
    return this;
  }
}

// @ts-ignore
InputColor.__proto__.events = {
  // @ts-ignore
  'change input': 'onInputColorChange',
  'change select': 'onColorUnitChange',
  change: 'onColorChange',
};
