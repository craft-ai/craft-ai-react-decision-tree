import ContainerDimensions from 'react-container-dimensions';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import { NODE_HEIGHT, NODE_WIDTH, NODE_WIDTH_MARGIN } from '../utils/constants';

const DecisionTreeContainerDiv = styled('div')`
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  width: 100%;
  height: 100%;
  min-width: ${NODE_WIDTH + 2 * NODE_WIDTH_MARGIN}px;
  min-height: ${NODE_HEIGHT + 2 * NODE_HEIGHT}px;
`;

const DecisionTreeContainer = ({ children, style = {} }) => (
  <DecisionTreeContainerDiv style={ style }>
    <ContainerDimensions>{children}</ContainerDimensions>
  </DecisionTreeContainerDiv>
);

DecisionTreeContainer.propTypes = {
  children: PropTypes.func.isRequired,
  style: PropTypes.object
};

export default DecisionTreeContainer;
