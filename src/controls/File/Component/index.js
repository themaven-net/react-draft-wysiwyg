/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Option from '../../../components/Option';
import Spinner from '../../../components/Spinner';
import './styles.css';

class LayoutComponent extends Component {
  static propTypes: Object = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    doCollapse: PropTypes.func,
    onChange: PropTypes.func,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state: Object = {
    imgSrc: '',
    dragEnter: false,
    uploadHighlighted: this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
    showImageLoading: false,
  };

  componentWillReceiveProps(props: Object): void {
    if (this.props.expanded && !props.expanded) {
      this.setState({
        imgSrc: '',
        dragEnter: false,
        uploadHighlighted: this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
        showImageLoading: false,
      });
    } else if (props.config.uploadCallback !== this.props.config.uploadCallback ||
      props.config.uploadEnabled !== this.props.config.uploadEnabled) {
      this.setState({
        uploadHighlighted: props.config.uploadEnabled && !!props.config.uploadCallback,
      });
    }
  }

  onDragEnter: Function = (event: Object): void => {
    this.stopPropagation(event);
    this.setState({
      dragEnter: true,
    });
  };

  onImageDrop: Function = (event: Object): void => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      dragEnter: false,
    });

    // Check if property name is files or items
    // IE uses 'files' instead of 'items'
    let data;
    let dataIsItems;
    if (event.dataTransfer.items) {
      data = event.dataTransfer.items;
      dataIsItems = true;
    } else {
      data = event.dataTransfer.files;
      dataIsItems = false;
    }
    for (let i = 0; i < data.length; i += 1) {
      if ((!dataIsItems || data[i].kind === 'file') && data[i].type.match('^image/')) {
        const file = dataIsItems ? data[i].getAsFile() : data[i];
        this.uploadImage(file);
      }
    }
  };

  showImageUploadOption: Function = (): void => {
    this.setState({
      uploadHighlighted: true,
    });
  };

  addImageFromState: Function = (): void => {
    const { imgSrc } = this.state;
    const { onChange } = this.props;
    onChange(imgSrc);
  };

  showImageURLOption: Function = (): void => {
    this.setState({
      uploadHighlighted: false,
    });
  };

  toggleShowImageLoading: Function = (): void => {
    const showImageLoading = !this.state.showImageLoading;
    this.setState({
      showImageLoading,
    });
  };

  updateValue: Function = (event: Object): void => {
    this.setState({
      [`${event.target.name}`]: event.target.value,
    });
  };

  selectImage: Function = (event: Object): void => {
    if (event.target.files && event.target.files.length > 0) {
      this.uploadImage(event.target.files[0]);
    }
  };

  uploadImage: Function = (file: Object): void => {
    this.toggleShowImageLoading();
    const { uploadCallback } = this.props.config;
    uploadCallback(file)
      .then(({ data }) => {
        this.setState({
          showImageLoading: false,
          dragEnter: false,
          imgSrc: data.link,
        });
        this.fileUpload = false;
      }).catch(() => {
        this.setState({
          showImageLoading: false,
          dragEnter: false,
        });
      });
  };

  fileUploadClick = (event) => {
    this.fileUpload = true;
    event.stopPropagation();
  };

  stopPropagation: Function = (event: Object): void => {
    if (!this.fileUpload) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.fileUpload = false;
    }
  };

  renderAddImageModal(): Object {
    const {
      imgSrc,
      uploadHighlighted,
      showImageLoading,
      dragEnter,
    } = this.state;
    const {
      config: {
        popupClassName,
        uploadCallback,
        uploadEnabled,
        urlEnabled,
        inputAccept,
      },
      doCollapse,
      translations,
    } = this.props;
    return (
      <div
        className={classNames('rdw-image-modal', popupClassName)}
        onClick={this.stopPropagation}
      >
        <div className="rdw-image-modal-header">
          {uploadEnabled && uploadCallback &&
            <span
              onClick={this.showImageUploadOption}
              className="rdw-image-modal-header-option"
            >
              {translations['components.controls.image.fileUpload']}
              <span
                className={classNames(
                  'rdw-image-modal-header-label',
                  { 'rdw-image-modal-header-label-highlighted': uploadHighlighted },
                )}
              />
            </span>}
          { urlEnabled &&
            <span
              onClick={this.showImageURLOption}
              className="rdw-image-modal-header-option"
            >
              {translations['components.controls.image.byURL']}
              <span
                className={classNames(
                  'rdw-image-modal-header-label',
                  { 'rdw-image-modal-header-label-highlighted': !uploadHighlighted },
                )}
              />
            </span>}
        </div>
        {
          uploadHighlighted ?
            <div onClick={this.fileUploadClick}>
              <div
                onDragEnter={this.onDragEnter}
                onDragOver={this.stopPropagation}
                onDrop={this.onImageDrop}
                className={classNames(
                  'rdw-image-modal-upload-option',
                  { 'rdw-image-modal-upload-option-highlighted': dragEnter })}
              >
                <label
                  htmlFor="file"
                  className="rdw-image-modal-upload-option-label"
                >
                  {imgSrc || translations['components.controls.image.dropFileText']}
                </label>
              </div>
              <input
                type="file"
                id="file"
                accept={inputAccept}
                onChange={this.selectImage}
                className="rdw-image-modal-upload-option-input"
              />
            </div> :
            <div className="rdw-image-modal-url-section">
              <input
                className="rdw-image-modal-url-input"
                placeholder={translations['components.controls.image.enterlink']}
                name="imgSrc"
                onChange={this.updateValue}
                onBlur={this.updateValue}
                value={imgSrc}
              />
              <span className="rdw-image-mandatory-sign">*</span>
            </div>
        }
        <span className="rdw-image-modal-btn-section">
          <button
            className="rdw-image-modal-btn"
            onClick={this.addImageFromState}
            disabled={!imgSrc}
          >
            {translations['generic.add']}
          </button>
          <button
            className="rdw-image-modal-btn"
            onClick={doCollapse}
          >
            {translations['generic.cancel']}
          </button>
        </span>
        {showImageLoading ?
          <div className="rdw-image-modal-spinner">
            <Spinner />
          </div> :
          undefined}
      </div>
    );
  }

  render(): Object {
    const {
      config: { icon, className, title },
      expanded,
      onExpandEvent,
      translations,
    } = this.props;
    return (
      <div
        className="rdw-image-wrapper"
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-label="rdw-image-control"
      >
        <Option
          className={classNames(className)}
          value="unordered-list-item"
          onClick={onExpandEvent}
          title={title || translations['components.controls.image.image']}
        >
          <img
            src={icon}
            alt=""
          />
        </Option>
        {expanded ? this.renderAddImageModal() : undefined}
      </div>
    );
  }
}

export default LayoutComponent;
