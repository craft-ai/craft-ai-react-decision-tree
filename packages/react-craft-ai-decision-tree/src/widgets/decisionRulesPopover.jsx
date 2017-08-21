import _ from 'lodash';
import glamorous from 'glamorous';
import PropTypes from 'prop-types';
import React from 'react';
import { Properties } from 'craft-ai';

const CrafPopoverTitle = glamorous.div({
  textAlign: 'center',
  fontWeight: 'bold',
  padding: 5,
  borderBottom: 'solid 1px #777'
});

const CrafPopoverList = glamorous.ul({
  listStyleType: 'none',
  borderBottom: 'none',
  margin: 0,
  padding: 5
});

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
      <div>
        <CrafPopoverTitle
          className='craft-popover-title'
          style={{ backgroundColor: color }}>
          {
            title
          }
        </CrafPopoverTitle>
        <CrafPopoverList>
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
        </CrafPopoverList>
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
