import React from "react";
import TextInput from "./TextInput";

import renderer from "react-test-renderer";

import { shallow } from "enzyme";

describe("text input", () => {
  it("renders correctly", () => {
    const component = renderer
      .create(<TextInput initial="foo" onChange={(value) => {}} />)
      .toJSON();
    expect(component).toMatchSnapshot();
  });

  it("default initial value actually works", () => {
    const component = shallow(<TextInput initial="potato" />);
    expect(component.find('input').first().prop("type")).toBe("text");
    expect(component.find('input').first().prop("defaultValue")).toBe("potato");
  });
});
