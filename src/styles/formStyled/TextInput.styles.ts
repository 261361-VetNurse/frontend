import styled from 'styled-components';

export const StyledInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 300;
  color: #303030ff;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  ${props => props.$error && `
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;
