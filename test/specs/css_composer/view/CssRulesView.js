import CssRulesView from 'css_composer/view/CssRulesView';
import CssRules from 'css_composer/model/CssRules';
import Editor from 'editor/model/Editor';

describe('CssRulesView', () => {
  let obj;
  const prefix = 'rules';
  const devices = [
    {
      name: 'Mobile portrait',
      width: '320px',
      widthMedia: '480px',
      priorityObjNum: '1'
    },

    {
      name: 'Tablet',
      width: '768px',
      widthMedia: '992px',
      priorityObjNum: '3'
    },
    {
      name: 'Desktop',
      width: '',
      widthMedia: '',
      priorityObjNum: '2'
    }
  ];

  beforeEach(() => {
    const col = new CssRules([]);
    obj = new CssRulesView({
      collection: col,
      config: {
        em: new Editor({
          deviceManager: {
            devices
          }
        })
      }
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures').appendChild(obj.render().el);
  });

  afterEach(() => {
    obj.collection.reset();
  });

  test('Object exists', () => {
    expect(CssRulesView).toBeTruthy();
  });

  test('Collection is empty. Styles structure bootstraped', () => {
    expect(obj.$el.html()).toBeTruthy();
    const foundStylesContainers = Array(obj.$el.find('div'));
    expect(foundStylesContainers[0].length - 1).toEqual(devices.length);
    const sortedDevicesWidthMedia = devices
      .map(dvc => dvc.priorityObjNum)
      .sort((left, right) => {
        return (left || Number.MAX_VALUE) - (right || Number.MAX_VALUE);
      })
      .map(widthMedia => parseFloat(widthMedia));

    for (let i = 1; i < foundStylesContainers.length; i++) {
      const priority = sortedDevicesWidthMedia[i];
      let $styleC = foundStylesContainers[i].id;

      expect($styleC.id).toEqual(`${prefix}${priority ? `-${priority}` : ''}`);
    }
  });

  test('Devices are sorted in ascending order according to the priority asssigned to them manually', () => {
    const sortedDevicesPriority = devices.sort((left, right) => {
      return (
        (left.priorityObjNum || Number.MAX_VALUE) -
        (right.priorityObjNum || Number.MAX_VALUE)
      );
    });

    expect(parseInt(sortedDevicesPriority[0].priorityObjNum)).toBeLessThan(
      parseInt(sortedDevicesPriority[1].priorityObjNum)
    );
  });
  test('Add new rule', () => {
    sinon.stub(obj, 'addToCollection');
    obj.collection.add({});
    expect(obj.addToCollection.calledOnce).toBeTruthy();
  });

  test('Add correctly rules with different media queries', () => {
    const foundStylesContainers = obj.$el.find('div');
    const rules = [
      {
        selectorsAdd: '#testid'
      },
      {
        selectorsAdd: '#testid2',
        mediaText: '(max-width: 1000px)'
      },
      {
        selectorsAdd: '#testid3',
        mediaText: '(min-width: 900px)'
      },
      {
        selectorsAdd: '#testid4',
        mediaText: 'screen and (max-width: 900px) and (min-width: 600px)'
      }
    ];
    obj.collection.add(rules);
    const stylesCont = obj.el.querySelector(`#${obj.className}`);
    expect(stylesCont.children.length).toEqual(rules.length);
  });

  test('Render new rule', () => {
    obj.collection.add({});
    expect(obj.$el.find(`#${prefix}`).html()).toBeTruthy();
  });
});
