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
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import { AddSingle } from './add-single';
import { uuid } from './helpers';

const LINK_TYPE = 'linkType';
const LINK_TYPE_INTERNAL = 'internal';
const LINK_TYPE_EXTERNAL = 'external';

const TARGET_TYPE_BLANK = '_blank';
const TARGET_TYPE_SELF = '_self';
const TARGET_TYPE_NICE_BLANK = 'New Tab';
const TARGET_TYPE_NICE_SELF = 'Internal';

function UiExtension(props) {
  console.log('props.sdk.field => ', props.sdk.field);
  console.log('props.sdk.field.getValue() => ', props.sdk.field.getValue());

  /**
   * Change schema from
   *
   * entry {}
   * link
   * linkType
   *
   * TO
   *
   * location: String,
   * items [
   *  SINGLE_ENTRY
   * ]
   */

  const [value, setValue] = useState(props.sdk.field.getValue());
  const [urlValue, setUrlValue] = useState('');
  const [urlTitleValue, setUrlTitleValue] = useState('');
  const [entryCard, setEntryCard] = useState(null);
  const [targetType, setTargetType] = useState('');
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

  useEffect(() => {
    if (props.sdk.window) {
      props.sdk.window.startAutoResizer();
    }

    setValue(props.sdk.field.getValue());

    let link_obj = props.link;
    // check if external url data exists
    if (link_obj) {
      setUrlValue(link_obj.url);
      setUrlTitleValue(link_obj.title);
      setTargetType(link_obj.target);

      if (!targetType) {
        setTargetType(TARGET_TYPE_BLANK);
      }
    }

    setEntryCard(props.entry);
  }, [props]);

  function setHardCoded() {
    props.sdk.field.setValue({
      id: uuid(16),
      location: 'asf_header',
      items: [
        {
          id: uuid(16),
          linkType: LINK_TYPE_EXTERNAL,
          entry: null,
          target: TARGET_TYPE_BLANK,
          link: null
        },
        {
          id: uuid(16),
          linkType: LINK_TYPE_EXTERNAL,
          entry: null,
          target: TARGET_TYPE_SELF,
          link: null
        }
      ]
    });
  }

  function addNewListItem(payload) {
    console.log('parent payload ', payload);
  }

  console.log('value ', value);

  return (
    <Fragment>
      {value
        ? value.items
          ? value.items.length > 0
            ? value.items.map(single_entry => (
                <div key={single_entry.id}>
                  <AddSingle addNew={addNewListItem} entry={single_entry} />
                </div>
              ))
            : ''
          : ''
        : ''}
      <Button buttonType="positive" icon="Close" onClick={setHardCoded} size="small">
        set hardcoded value
      </Button>
    </Fragment>
  );
}

// init the extension and pass the sdk as props
init(sdk => {
  ReactDOM.render(<UiExtension sdk={sdk} />, document.getElementById('root'));
});
