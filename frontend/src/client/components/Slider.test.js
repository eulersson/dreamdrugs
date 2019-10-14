import React from 'react';
import { shallow } from 'enzyme';
import Slider from './Slider';

describe('Slider tests', () => {
  it('Does it render', () => {
    //const component = renderer.create(<Slider range={[1, 10]} initial={5} type="int" prettyName="My Slider" name="my-slider" />); 
    //const json = component.toJSON();
    //expect(json).toMatchSnapshot();
    const slider = shallow(<Slider range={[1, 10]} initial={5} type="int" prettyName="My Slider" name="my-slider" />); 
    expect(slider.find('div').html()).toEqual('Hello world');
  });
});
