import React, { Fragment, useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
  Button,
  TextField,
  FieldGroup,
  RadioButtonField,
  EntryCard,
  Notification,
  Dropdown,
  DropdownList,
  DropdownListItem,
  FormLabel,
  HelpText
} from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

const LINK_TYPE = 'linkType';
const LINK_TYPE_INTERNAL = 'internal';
const LINK_TYPE_EXTERNAL = 'external';

const TARGET_TYPE_BLANK = '_blank';
const TARGET_TYPE_SELF = '_self';
const TARGET_TYPE_NICE_BLANK = 'New Tab';
const TARGET_TYPE_NICE_SELF = 'Internal';

export function AddSingle({ entry, addNew }) {
  let field = entry;
  console.log('field => ', field);

  /**
   * Change schema from
   *
   * entry {}
   * link
   * linkType
   *
   * TO
   *
   * items [
   *  SINGLE_ENTRY
   * ]
   */

  const [value, setValue] = useState(field);
  const [linkType, setLinkType] = useState(undefined);
  const [urlValue, setUrlValue] = useState('');
  const [urlTitleValue, setUrlTitleValue] = useState('');
  const [entryCard, setEntryCard] = useState(null);
  const [targetType, setTargetType] = useState('');
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

  useEffect(() => {
    setValue(field);
    setLinkType(field.linkType);

    let link_obj = field.link;
    // check if external url data exists
    if (link_obj) {
      setUrlValue(link_obj.url);
      setUrlTitleValue(link_obj.title);
      setTargetType(link_obj.target);

      if (!targetType) {
        setTargetType(TARGET_TYPE_BLANK);
      }
    }
  }, [field]);

  function handleResetButtonClick() {
    field.setValue({
      linkType: LINK_TYPE_INTERNAL,
      entry: null,
      link: null
    });
    setUrlTitleValue('');
    setUrlValue('');
    setEntryCard(null);
    setTargetType(TARGET_TYPE_BLANK);
    setValue(field);
  }

  function handleLinkTypeChange(type_value) {
    const nextState = {
      linkType: type_value
    };
    setLinkType(type_value);

    if (type_value === LINK_TYPE_INTERNAL) {
      nextState.entry = null;
    } else if (type_value === LINK_TYPE_EXTERNAL) {
      nextState.link = null;
      setTargetType(TARGET_TYPE_BLANK);
    }

    field.setValue(nextState);
    setValue(nextState);
  }

  function handleExternalUrlChange(url_value) {
    setUrlValue(url_value);

    field.setValue({
      ...value,
      link: {
        url: url_value,
        title: urlTitleValue,
        target: targetType
      }
    });
    setValue(field.getValue());
  }

  function handleExternalUrlTitleChange(url_title_value) {
    setUrlTitleValue(url_title_value);

    field.setValue({
      ...value,
      link: {
        url: urlValue,
        title: url_title_value,
        target: targetType
      }
    });
    setValue(field.getValue());
  }

  function renderResetButton() {
    return (
      <FieldGroup>
        <Button buttonType="negative" icon="Close" onClick={handleResetButtonClick} size="small">
          Remove Link
        </Button>
      </FieldGroup>
    );
  }

  async function getEntryCardfield(entry) {
    const contentType = await field.sdk.space.getContentType(entry.sys.contentType.sys.id);

    const defaultLocale = field.sdk.locales.default;

    // only make connection if displayField is set
    if (contentType.displayField) {
      let title = entry.fields[contentType.displayField][defaultLocale];
      console.warn('title => ', title);

      setEntryCard({
        contentType: contentType.name,
        title: title
      });

      setValue({
        ...value,
        link: null,
        entry: {
          contentType: contentType.name,
          title: title
        }
      });

      field.setValue({
        ...value,
        link: null,
        entry: {
          contentType: contentType.name,
          title: title
        }
      });
    } else {
      setValue({
        ...value,
        link: null,
        entry: null
      });

      field.setValue({
        ...value,
        link: null,
        entry: null
      });
      setEntryCard(null);
      Notification.error('Related entry has invalid displayField');
    }
  }

  async function handleChooseEntryButtonClick() {
    const selectedEntry = await field.sdk.dialogs.selectSingleEntry();

    // setValue({
    //   ...value,
    //   entry: selectedEntry,
    //   link: null
    // });

    getEntryCardfield(selectedEntry);
  }

  function renderInternalLinkPicker() {
    // If no entry has been selected, render a button to open the entry selector
    if (!value.entry) {
      return <Button onClick={handleChooseEntryButtonClick}>Choose Entry...</Button>;
    }

    // If the field for the entry card haven't been fetched yet, show a loading state for the card
    if (!entryCard) {
      return <EntryCard loading size="small" />;
    }

    // If the field for the entry card have been fetched, show the entry card
    return <EntryCard title={entryCard.title} contentType={entryCard.contentType} size="small" />;
  }

  function handleTargetType(type) {
    setTargetType(type);
    setDropdownIsOpen(false);

    field.setValue({
      ...value,
      link: {
        url: urlValue,
        title: urlTitleValue,
        target: type
      }
    });
    setValue(field.getValue());
  }

  return (
    <Fragment>
      <FieldGroup>
        <RadioButtonField
          labelText="Internal"
          helpText="Link to internal content"
          name={LINK_TYPE}
          checked={linkType === LINK_TYPE_INTERNAL}
          value={LINK_TYPE_INTERNAL}
          onChange={e => handleLinkTypeChange(e.target.value)}
          id={`link-type-${LINK_TYPE_INTERNAL}`}
        />
        <RadioButtonField
          labelText="External"
          helpText="Link to another website"
          name={LINK_TYPE}
          checked={linkType === LINK_TYPE_EXTERNAL}
          value={LINK_TYPE_EXTERNAL}
          onChange={e => handleLinkTypeChange(e.target.value)}
          id={`link-type-${LINK_TYPE_EXTERNAL}`}
        />
      </FieldGroup>
      {linkType === LINK_TYPE_INTERNAL && (
        <Fragment>
          <FieldGroup>{renderInternalLinkPicker()}</FieldGroup>
          {!value.entry && (
            <FieldGroup>
              <Button
                buttonType="negative"
                icon="Close"
                onClick={handleResetButtonClick}
                size="small">
                Cancel
              </Button>
            </FieldGroup>
          )}
          {value.entry && <FieldGroup>{renderResetButton()}</FieldGroup>}
        </Fragment>
      )}
      {linkType === LINK_TYPE_EXTERNAL && (
        <Fragment>
          <FieldGroup>
            <TextField
              labelText="External link"
              label="Location URL"
              name="link_location"
              id={`linkType-${LINK_TYPE_EXTERNAL}-url`}
              value={urlValue}
              textInputfield={{
                width: 'large',
                type: 'url',
                placeholder: 'Enter a URL',
                error: urlValue === ''
              }}
              onChange={e => handleExternalUrlChange(e.target.value)}
            />
            <TextField
              labelText="Title"
              label="Title"
              name="link_title"
              id={`linkType-${LINK_TYPE_EXTERNAL}-title`}
              value={urlTitleValue}
              textInputfield={{
                width: 'large',
                type: 'text',
                placeholder: 'Enter a nice name for your link',
                error: urlTitleValue === ''
              }}
              onChange={e => handleExternalUrlTitleChange(e.target.value)}
            />
            <FormLabel htmlFor="location_target">Location</FormLabel>
            <Dropdown
              isOpen={dropdownIsOpen}
              onClose={() => setDropdownIsOpen(false)}
              key={Date.now()} // Force Reinit
              id="location_target"
              position="bottom-left"
              toggleElement={
                <Button
                  size="small"
                  buttonType="muted"
                  position="bottom-left"
                  indicateDropdown
                  onClick={() => setDropdownIsOpen(!dropdownIsOpen)}>
                  {targetType === TARGET_TYPE_SELF
                    ? TARGET_TYPE_NICE_SELF
                    : targetType === TARGET_TYPE_BLANK
                    ? TARGET_TYPE_NICE_BLANK
                    : null}
                </Button>
              }>
              <DropdownList>
                <DropdownListItem onClick={() => handleTargetType(TARGET_TYPE_BLANK)}>
                  {TARGET_TYPE_NICE_BLANK}
                </DropdownListItem>
                <DropdownListItem onClick={() => handleTargetType(TARGET_TYPE_SELF)}>
                  {TARGET_TYPE_NICE_SELF}
                </DropdownListItem>
              </DropdownList>
            </Dropdown>
            <HelpText>By default, the link will open in a New Tab.</HelpText>
          </FieldGroup>
          <FieldGroup>{renderResetButton()}</FieldGroup>
        </Fragment>
      )}
    </Fragment>
  );
}
