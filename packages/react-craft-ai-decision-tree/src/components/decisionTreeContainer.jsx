import ContainerDimensions from 'react-container-dimensions';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const DecisionTreeContainerDiv = styled('div')`
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  width: 100%;
  height: 100%;
`;

const DecisionTreeContainer = ({ children, style }) => (
  <DecisionTreeContainerDiv style={ style }>
    <ContainerDimensions>{children}</ContainerDimensions>
  </DecisionTreeContainerDiv>
);

DecisionTreeContainer.propTypes = {
  children: PropTypes.func.isRequired,
  style: PropTypes.object
};

export default DecisionTreeContainer;
