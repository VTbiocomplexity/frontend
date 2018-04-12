import React from 'react';
import ReactDOM from 'react-dom';
import HWcomp from './react-comp';
import {noView, inject, customElement} from 'aurelia-framework';

@noView()
@inject(Element)
@customElement('hello-world')
export class ReactElement {
  constructor(element) {
    this.element = element;
  }

  render() {
    ReactDOM.render(<HWcomp/>, this.element);
  }

  bind() {
    this.render();
  }
}
