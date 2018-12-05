import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import { interpreter, Properties } from 'craft-ai';

const PopoverTitle = styled('div')`
  text-align: center;
  font-weight: bold;
  padding: 5px;
  border-bottom: solid 1px #777;
`;

const PopoverUl = styled('ul')`
  list-style-type: none;
  border-bottom: none;
  margin: 0px;
  padding: 5px;
`;

class DecisionRulesPopover extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { color, node, title } = this.props;
    return (
      node != nextProps.node ||
      title != nextProps.title ||
      color != nextProps.color
    );
  }

  displayConditions = (property) => {
    try {
      const decisionRule = Properties.reduceDecisionRule(
        this.props.node.decisionRules[property]
      );
      const propertyType = this.props.context[property].type;
      const text = interpreter.formatDecisionRules([
        {
          ...decisionRule,
          type: propertyType,
          property: property
        }
      ]);
      return <li key={property}>{text}</li>;
    } catch (err) {
      return (
        <li style={{ color: 'red' }} key={property}>
          {err.message}
        </li>
      );
    }
  };

  render() {
    const { color, node, title } = this.props;
    const decisionRulesKeys = node ? _.keys(node.decisionRules) : [];
    return (
      <div>
        <PopoverTitle
          className='craft-popover-title'
          style={{ backgroundColor: color }}
        >
          {title}
        </PopoverTitle>
        <PopoverUl>
          <li>Confidence: {(node.data.confidence * 100).toFixed(2)}%</li>
          {!_.isUndefined(node.data.standard_deviation) ? (
            <li>
              Standard deviation: {node.data.standard_deviation.toFixed(2)}
            </li>
          ) : null}
          <li>
            Decision rules:
            <ul>{_.map(decisionRulesKeys, this.displayConditions)}</ul>
          </li>
        </PopoverUl>
      </div>
    );
  }
}

DecisionRulesPopover.propTypes = {
  node: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired
};

export default DecisionRulesPopover;
