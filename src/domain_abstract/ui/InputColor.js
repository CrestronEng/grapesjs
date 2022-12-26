import Backbone from 'backbone';
import { isUndefined } from 'underscore';
import ColorPicker from 'utils/ColorPicker';
import Input from './Input';

const $ = Backbone.$;
ColorPicker($);

export default Input.extend({
  events: {
    'change input': 'handleColorChange',
    'change select': 'handleColorUnitChange',
    change: 'colorchanging'
  },

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
  },

  colorchanging(e) {
    console.log('color Changing');
    this.processSelectedColor();
  },

  handleColorChange(e) {
    console.log('handle color change: ', JSON.stringify(e));
    console.log('handle color change: ', e);
    console.log('Color: ', this.getInputEl().value);
    console.log('Current Color: ', JSON.stringify(this.currentColorValues));
    if (this.getInputEl().value == '#' || this.getInputEl().value == '') {
      console.log('Entering If condition');
      this.render();
    } else {
      console.log('Entering else condition');
      this.processSelectedColor();
    }
  },

  /**
   * Handled when the view is changed
   */
  handleColorUnitChange(e) {
    // console.log("handleUnitChange Color Type Value: ", this.getInputEl().value);
    // console.log("handleUnitChange Color Type Unit Selected: ", this.getUnitEl().value);
    // console.log("colorEl", this.colorEl);
    // console.log("colorEl-JSON", JSON.stringify(this.colorEl));
    // console.log("colorEl.spectrum()", this.colorEl.spectrum());
    // console.log("colorEl.spectrum()-JSON", JSON.stringify(this.colorEl.spectrum()));
    // console.log("tiny Color: ", window.tinycolor);
    // console.log("tiny Color: ",JSON.stringify(window.tinycolor));

    console.log('e:', e);
    //Based on the selected 'Color Unit' the color Input field is allowed
    if (this.currentColorValues != null) {
      console.log(
        'Available Values: ',
        JSON.stringify(this.currentColorValues)
      );
      this.setSelectedColor(this.getUnitEl().value, this.currentColorValues);
    } else {
      this.processSelectedColor();
    }
  },

  processSelectedColor() {
    const colorValue = this.getInputEl().value;
    const selectedUnit = this.getUnitEl().value;

    console.log('Entered Color: ' + colorValue);
    console.log('Selected Unit: ' + selectedUnit);

    switch (selectedUnit) {
      case 'Name': {
        if (
          colorValue.startsWith('RGB') ||
          colorValue.startsWith('rgb') ||
          colorValue.startsWith('#') ||
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(colorValue)
        ) {
          this.getInputEl().value = '';
        } else {
          var colorValues = this.CreateColorValues(colorValue, selectedUnit);
          this.currentColorValues = colorValues;
        }
        break;
      }
      case 'Hex': {
        if (!colorValue.startsWith('#')) {
          //&& /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(colorValue))) {
          this.getInputEl().value = '';
        } else {
          var colorValues = this.CreateColorValues(colorValue, selectedUnit);
          this.currentColorValues = colorValues;
        }
        break;
      }
      case 'RGB': {
        if (!(colorValue.startsWith('RGB') || colorValue.startsWith('rgb'))) {
          this.getInputEl().value = '';
        } else {
          var colorValues = this.CreateColorValues(colorValue, selectedUnit);
          this.currentColorValues = colorValues;
        }
        break;
      }
      default: {
        break;
      }
    }

    this.ReloadUIDropdown(selectedUnit, this.currentColorValues);
    this.setSelectedColor(selectedUnit, this.currentColorValues);
  },

  ReloadUIDropdown(selectedUnit, colorValues) {
    if (!colorValues) return;

    console.log(
      'Entering ReloadUIDropdown(): ' + JSON.stringify(this.getUnitEl())
    );
    console.log(
      'Entering ReloadUIDropdown() Inner HTML: ' +
        JSON.stringify(this.getUnitEl().innerHTML)
    );
    console.log('Entering ReloadUIDropdown(): ' + this.getUnitEl());

    // if (!this.unitEl) {
    const units = ['Hex', 'RGB', 'Name'];

    if (units.length) {
      var options = [];

      console.log(
        'ReloadUIDropdown(): ' + 'Unit: ' + selectedUnit,
        'ColorValues: ' + JSON.stringify(colorValues)
      );
      units.forEach(unit => {
        console.log('ReloadUIDropdown(): ' + 'Unit loop: ' + unit);

        if (unit === 'Name') {
          if (
            colorValues.Name != '' &&
            colorValues.Name != undefined &&
            selectedUnit == 'Name'
          ) {
            console.log('Inside 1st if');
            options.push(`<option selected>${unit}</option>`);
          } else if (
            colorValues.Name == '' ||
            (colorValues.Name == undefined && selectedUnit == 'Name')
          ) {
            console.log('Inside 2nd if');
            options.shift();
            arr.splice(0, 0, `<option selected>${hex}</option>`);
          } else if (colorValues.Name == '' || colorValues.Name == undefined) {
            console.log('Inside 3rd if');
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorValues.Name != '') {
            console.log('Inside 4th if');
            options.push(`<option>${unit}</option>`);
          }
        }

        if (unit === 'RGB') {
          if (
            colorValues.RGB != '' &&
            colorValues.RGB != undefined &&
            selectedUnit == 'RGB'
          ) {
            console.log('Inside 1st if');
            options.push(`<option selected>${unit}</option>`);
          } else if (colorValues.RGB == '' || colorValues.RGB == undefined) {
            console.log('Inside 2nd if');
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorValues.RGB != '' || colorValues.RGB != undefined) {
            console.log('Inside 3rd if');
            options.push(`<option>${unit}</option>`);
          }
        }

        if (unit === 'Hex') {
          if (
            colorValues.Hex != '' &&
            colorValues.Hex != undefined &&
            selectedUnit == 'Hex'
          ) {
            console.log('Inside 1st if');
            options.push(`<option selected>${unit}</option>`);
          } else if (colorValues.Hex == '' || colorValues.RGB == undefined) {
            console.log('Inside 2nd if');
            options.push(`<option disabled>${unit}</option>`);
          } else if (colorValues.Hex != '' || colorValues.RGB != undefined) {
            console.log('Inside 3rd if');
            options.push(`<option>${unit}</option>`);
          }
        }
      });

      console.log('Options: ', JSON.stringify(options.join('')));

      // const temp = document.createElement('div');
      // temp.innerHTML = `<select class="${this.ppfx}input-unit">${options.join(
      //   ''
      // )}</select>`;

      this.unitEl.innerHTML = `<select class="${
        this.ppfx
      }input-unit">${options.join('')}</select>`;
    }
    // }

    // return this.unitEl;

    //Input.prototype.render.call(this);
    // this.getColorEl();
    // const unit = this.unitEl;
    // This will make the color input available on render
    // unit &&
    //   this.$el
    //     .find(`.${this.ppfx}field-units`)
    //     .get(0)
    //     .appendChild(unit);
    // return this;
  },

  setSelectedColor(selectedUnit, currentColorValues) {
    console.log(
      'setSelectedColor() Unit:' + selectedUnit,
      'Color: ' + JSON.stringify(currentColorValues)
    );
    switch (selectedUnit) {
      case 'Name': {
        console.log(
          'Entering Name block',
          'Unit :' + selectedUnit,
          'Color :' + currentColorValues.Name
        );
        // this.setValue(currentColorValues.Name);
        // this.getInputEl().value= currentColorValues.Name;
        // const inputEl = this.getInputEl();
        // inputEl.value = currentColorValues.Name;
        // const colorEl = this.getColorEl();
        // colorEl.spectrum('set', currentColorValues.Name);
        //const model = this.model;
        //model.setValueFromInput(currentColorValues.Name, 0);
        console.log('CE: ' + JSON.stringify(this.getColorEl()));
        const opts = { fromTarget: 1 };
        console.log('Setting COlor: ' + currentColorValues.Name);
        this.setValue(currentColorValues.Name, opts);
        //this.getColorEl().change(currentColorValues.Name);
        console.log('CE: ' + JSON.stringify(this.getColorEl()));
        // var tinyColor = window.tinycolor;
        // model.setValueFromInput(tinyColor(currentColorValues.Name), 0);
        break;
      }
      case 'RGB': {
        console.log(
          'Entering RGB block',
          'Unit :' + selectedUnit,
          'Color :' + currentColorValues.RGB
        );
        this.setValue(currentColorValues.RGB);
        this.getInputEl().value = currentColorValues.RGB;
        break;
      }
      case 'Hex': {
        console.log(
          'Entering Hex block',
          'Unit :' + selectedUnit,
          'Color :' + currentColorValues.Hex
        );
        this.setValue(currentColorValues.Hex);
        this.getInputEl().value = currentColorValues.Hex;
        break;
      }
      default:
        break;
    }
  },

  CreateColorValues(color, selectedUnit) {
    if (!color || !selectedUnit) return;

    const colorValues = { Name: '', Hex: '', RGB: '' };

    switch (selectedUnit) {
      case 'Name': {
        colorValues.Name = color;
        colorValues.Hex = this.getHexValue(color);
        colorValues.RGB = this.getRGBValue(colorValues.Hex);
        console.log('Final: ' + JSON.stringify(colorValues));
        break;
      }
      case 'Hex': {
        if (!color.startsWith('#')) {
          colorValues.Hex = '#' + color;
        } else {
          colorValues.Hex = color;
        }

        colorValues.Name = this.getColorName(color);
        colorValues.RGB = this.getRGBValue(colorValues.Hex);
        console.log('Final: ' + JSON.stringify(colorValues));
        break;
      }
      case 'RGB': {
        colorValues.RGB = color;
        colorValues.Hex = this.getColorHexByRGB(color);
        colorValues.Name = this.getColorName(colorValues.Hex);
        console.log('Final: ' + JSON.stringify(colorValues));
        break;
      }
      default:
        break;
    }
    return colorValues;
  },

  getHexValue(colorName) {
    if (colorName.startsWith('#')) {
      colorName = colorName.substring(1);
    }

    const tinyColor = window.tinycolor;
    const hexVal = tinyColor.names[colorName];
    console.log('Color Name: ' + colorName, 'Color Hex: ' + hexVal);
    return hexVal;
  },

  getRGBValue(colorHex) {
    const tinyColor = window.tinycolor;
    const rgb = tinyColor(colorHex).toRgbString();
    console.log('Color Hex: ' + colorHex, 'Color RGB: ' + rgb);
    return rgb;
  },

  getColorName(colorHex) {
    console.log('getColorName() :', colorHex);

    if (colorHex.startsWith('#')) {
      colorHex = colorHex.substring(1);
    }

    const tinyColor = window.tinycolor;
    const name = tinyColor.hexNames[colorHex];
    console.log('Color Hex/RGB: ' + colorHex, 'Color Name: ' + name);
    return name;
  },

  getColorHexByRGB(rgb) {
    const tinyColor = window.tinycolor;
    const hexValue = tinyColor(rgb).toHex();
    console.log('Color RGB: ' + rgb, 'Color Hex: ' + hexValue);
    return hexValue;
  },

  inputClass() {
    const ppfx = this.ppfx;
    return `${ppfx}field ${ppfx}field-color`;
  },

  holderClass() {
    return `${this.ppfx}input-holder`;
  },

  remove() {
    Input.prototype.remove.apply(this, arguments);
    this.colorEl.spectrum('destroy');
  },

  /**
   * Set value to the model
   * @param {string} val
   * @param {Object} opts
   */
  setValue(val, opts = {}) {
    const model = this.model;
    const def = model.get('defaults');
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
    }
  },

  /**
   * Get the color input element
   * @return {HTMLElement}
   */
  getColorEl() {
    if (!this.colorEl) {
      const { em } = this;
      const self = this;
      const ppfx = this.ppfx;
      var model = this.model;

      var colorEl = $(`<div class="${this.ppfx}field-color-picker"></div>`);
      var cpStyle = colorEl.get(0).style;
      var elToAppend = em && em.config ? em.config.el : '';
      var colorPickerConfig =
        (em && em.getConfig && em.getConfig('colorPicker')) || {};
      const getColor = color => {
        let cl =
          color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
        return cl.replace(/ /g, '');
      };

      let changed = 0;
      let previousColor;
      let isHideOnSelection = false;
      this.$el.find(`[data-colorp-c]`).append(colorEl);
      colorEl.spectrum({
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

        move(color) {
          changed = 0;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          model.setValueFromInput(cl, 0);
        },
        change(color) {
          changed = 1;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          model.setValueFromInput(cl);
          self.noneColor = 0;
        },
        show(color) {
          changed = 0;
          previousColor = getColor(color);
          isHideOnSelection = false;
          const propertyId = model.attributes.property;
          em.trigger('inputcolor:show', this, propertyId, previousColor); // this event is not a native GrapesJS event, it was added for CCIDE
        },
        hide(color) {
          if (!changed && previousColor) {
            if (self.noneColor) {
              previousColor = '';
            }
            // if coming from hide due to a selection event then use the color which was set
            if (isHideOnSelection) {
              previousColor = getColor(color);
            }
            cpStyle.backgroundColor = previousColor;
            colorEl.spectrum('set', previousColor);
            model.setValueFromInput(previousColor, 0);
          }
        }
      });

      em &&
        em.on &&
        em.on('component:selected', model => {
          changed = 0;
          self.noneColor = false;
          isHideOnSelection = true;
          colorEl.spectrum('hide');
        });

      this.colorEl = colorEl;
    }
    return this.colorEl;
  },

  getUnitEl() {
    if (!this.unitEl) {
      const units = ['Hex', 'RGB', 'Name'];

      if (units.length) {
        const options = [];

        units.forEach(unit => {
          options.push(`<option >${unit}</option>`);
        });

        const temp = document.createElement('div');
        temp.innerHTML = `<select class="${this.ppfx}input-unit">${options.join(
          ''
        )}</select>`;
        this.unitEl = temp.firstChild;
      }
    }

    return this.unitEl;
  },

  render() {
    Input.prototype.render.call(this);
    this.unitEl = null;
    this.getColorEl();
    const unit = this.getUnitEl();
    // This will make the color input available on render
    unit &&
      this.$el
        .find(`.${this.ppfx}field-units`)
        .get(0)
        .appendChild(unit);
    return this;
  }
});
