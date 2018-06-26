import React from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import {Flex, Box} from 'grid-emotion';

import Link from 'app/components/link';
import SelectControl from 'app/components/forms/selectControl';
import {t} from 'app/locale';

import {getInternal, getExternal, isValidCondition} from './utils';
import {CONDITION_OPERATORS} from '../data';

class Condition extends React.Component {
  static propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func,
    columns: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedColumn: null,
      selectedOperator: null,
    };
  }

  focus() {
    this.select.focus();
  }

  handleChange = option => {
    const external = getExternal(option.value, this.props.columns);

    if (new Set(this.props.columns.map(({name}) => name)).has(external[0])) {
      this.setState({selectedColumn: external[0]}, this.focus);
    }

    if (new Set(CONDITION_OPERATORS).has(external[1])) {
      this.setState({selectedOperator: external[1]});
    }
  };

  handleClose = () => {
    this.setState({selectedColumn: null, selectedOperator: null});
  };

  getOptions() {
    const currentValue = getInternal(this.props.value);
    return [{label: currentValue, value: currentValue}];
  }

  filterOptions = (options, input) => {
    let optionList = options;
    const external = getExternal(input, this.props.columns);
    const isValid = isValidCondition(external, this.props.columns);

    if (isValid) {
      return [];
    }

    const hasSelectedColumn = external[0] !== null || this.state.selectedColumn !== null;
    const hasSelectedOperator =
      external[1] !== null || this.state.selectedOperator !== null;

    if (!hasSelectedColumn) {
      optionList = this.props.columns.map(({name}) => ({
        value: `${name}`,
        label: `${name}...`,
      }));
    }

    if (hasSelectedColumn && !hasSelectedOperator) {
      optionList = CONDITION_OPERATORS.map(op => {
        const value = `${external[0] || this.state.selectedColumn} ${op}`;
        return {
          value,
          label: value,
        };
      });
    }

    return optionList.filter(({label}) => label.includes(input));
  };

  isValidNewOption = ({label}) => {
    return isValidCondition(getExternal(label, this.props.columns), this.props.columns);
  };

  inputRenderer = props => {
    let val = `${this.state.selectedColumn || ''} ${this.state.selectedOperator ||
      ''}`.trim();

    return (
      <input
        id="custom-input"
        type="text"
        {...props}
        value={props.value || val}
        style={{width: '100%', border: 0}}
      />
    );
  };

  valueRenderer = option => {
    const hideValue = this.state.selectedColumn || this.state.selectedOperator;

    return hideValue ? '' : option.value;
  };

  render() {
    return (
      <Box w={1}>
        <SelectControl
          forwardedRef={ref => (this.select = ref)}
          value={getInternal(this.props.value)}
          options={this.getOptions()}
          filterOptions={this.filterOptions}
          onChange={this.handleChange}
          closeOnSelect={true}
          openOnFocus={true}
          autoBlur={true}
          clearable={false}
          backspaceRemoves={false}
          deleteRemoves={false}
          onClose={this.handleClose}
          creatable={true}
          promptTextCreator={text => text}
          isValidNewOption={this.isValidNewOption}
          inputRenderer={this.inputRenderer}
          valueRenderer={this.valueRenderer}
        />
      </Box>
    );
  }
}

export default class Conditions extends React.Component {
  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.array).isRequired,
    onChange: PropTypes.func.isRequired,
    columns: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      editIndex: null,
    };
  }

  addRow() {
    const idx = this.props.value.length;
    this.setState({
      editIndex: idx,
    });
    this.props.onChange([...this.props.value, [null, null, null]]);
  }

  removeRow(idx) {
    const conditions = this.props.value.slice();
    conditions.splice(idx, 1);
    this.props.onChange(conditions);
  }

  render() {
    const {value, columns} = this.props;

    return (
      <div>
        <div>
          <strong>{t('Conditions')}</strong>
          <Add>
            (<Link onClick={() => this.addRow()}>{t('Add')}</Link>)
          </Add>
        </div>
        {!value.length && 'None, showing all events'}
        {value.map((condition, idx) => (
          <Flex key={idx}>
            <Condition
              value={condition}
              onChange={val => this.handleChange(val, idx)}
              columns={columns}
            />
            <Box ml={1}>
              <a
                className="icon-circle-cross"
                style={{lineHeight: '37px'}}
                onClick={() => this.removeRow(idx)}
              />
            </Box>
          </Flex>
        ))}
      </div>
    );
  }
}

const Add = styled.span`
  font-style: italic;
  text-decoration: underline;
  margin-left: 4px;
  font-size: 13px;
  line-height: 16px;
  color: ${p => p.theme.gray1};
`;
