import React from "react";
import Toggle from "./Toggle";

import renderer from 'react-test-renderer';

import { shallow } from "enzyme";

describe("toggle", () => {
  it("renders correctly", () => {
    const component = renderer
      .create(<Toggle switch={true} onChange={() => {}} />)
      .toJSON();
    expect(component).toMatchSnapshot();
  });

  it("has thee bars", () => {
    const component = shallow(<Toggle />);
    expect(component.closest("div").children()).toHaveLength(3);
  });
});
