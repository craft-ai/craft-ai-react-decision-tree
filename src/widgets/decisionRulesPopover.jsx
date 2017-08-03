import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Properties } from 'craft-ai';

import './popover.scss';

class DecisionRulesPopover extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { node, title, color } = this.props;
    return node  != nextProps.node  ||
           title != nextProps.title ||
           color != nextProps.color;
  }

  displayConditions = (key) => {
    try {
      const decisionRule = Properties.reduceDecisionRule(this.props.node.decisionRules[key]);
      const propertyType = this.props.context[key].type;
      const text = Properties.formatDecisionRule({
        ...decisionRule,
        type: propertyType
      });
      return (
        <li key={ key }>{ `${key}: ${text}` }</li>
      );
    }
    catch (err) {
      return (
        <li style={{ 'color': 'red' }} key={ key }>{ err.message }</li>
      );
    }
  }

  render() {
    const { node, title, color } = this.props;
    const decisionRulesKeys = node ? _.keys(node.decisionRules) : [];
    return (
      <div className='popover-content craft-popover'>
        <div className='title' style={{ backgroundColor: color }}>
        {
          title
        }
        </div>
        <ul>
          <li>Confidence: { (node.data.confidence * 100).toFixed(2) }%</li>
          {
            !_.isUndefined(node.data.standard_deviation) ?
              <li>Standard deviation: { node.data.standard_deviation.toFixed(2) }</li> :
              null
          }
          <li>Decision rules:
            <ul>
            {
              _.map(decisionRulesKeys, this.displayConditions)
            }
            </ul>
          </li>
        </ul>
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
