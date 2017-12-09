/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AtomicBlockUtils } from 'draft-js';

import LayoutComponent from './Component';

class FileControl extends Component {
  static propTypes: Object = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state: Object = {
    expanded: false,
  };

  componentWillMount(): void {
    const { modalHandler } = this.props;
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillUnmount(): void {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent: Function = (): void => {
    this.signalExpanded = !this.state.expanded;
  };

  doExpand: Function = (): void => {
    this.setState({
      expanded: true,
    });
  };

  doCollapse: Function = (): void => {
    this.setState({
      expanded: false,
    });
  };

  expandCollapse: Function = (): void => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  }

  addFile: Function = (src: string): void => {
    const { editorState, onChange, config } = this.props;
    const entityData = { url: src };
    const entityKey = editorState
      .getCurrentContent()
      .createEntity('TEXT', 'MUTABLE', entityData)
      .getLastCreatedEntityKey();

    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      src,
    );
    onChange(newEditorState);
    this.doCollapse();
  };

  render(): Object {
    const { config, translations } = this.props;
    const { expanded } = this.state;
    const FileComponent = config.component || LayoutComponent;
    return (
      <FileComponent
        config={config}
        translations={translations}
        onChange={this.addFile}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
      />
    );
  }
}

export default FileControl;
