import createInterpreter from '../utils/interpreter';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import React, { useCallback, useMemo } from 'react';

const CustomButton = styled('button')`
  position: absolute;
  height: 30px;
  border: ${1}px solid black;
  color: black;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 0 3px gray;
  font-size: 12px;
  visibility: visible;
  font-weight: bold;
  display: inline-block;
  padding: 0px 10px 0px 10px;
  transition: background-color 0.1s;
  cursor: pointer;
  &:hover {
    background: #ffcc00;
  }
  &:focus {
    outline: none;
  }
  &:active {
    background: white;
  }
`;

const MinifyButton = ({ tree, onMinify, selectedNodePath }) => {
  const interpreter = useMemo(
    () => createInterpreter(tree, Object.keys(tree.trees)[0]),
    [tree]
  );

  const minify = useCallback(
    () => onMinify(interpreter.computeMinify(selectedNodePath)),
    [interpreter, onMinify, selectedNodePath]
  );

  return (
    <CustomButton onClick={ minify }>
      Minify
    </CustomButton>
  );
};

MinifyButton.propTypes = {
  tree: PropTypes.object,
  onMinify: PropTypes.func,
  selectedNodePath: PropTypes.string
};

export default MinifyButton;
